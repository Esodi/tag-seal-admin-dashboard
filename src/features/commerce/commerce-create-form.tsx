"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGrid, FieldLabel } from "@/components/ui/field";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";
import { commerceLabel, commerceMoney } from "./commerce-config";
import type { CommerceResource } from "./types";

type Farm = { uuid: string; name: string };
type Person = { id: number; name: string; phone?: string | null; farms: Farm[] };
type Animal = { uuid: string; identification_number?: string | null; name?: string | null; farm_name?: string | null };
type OpenListing = {
  uuid: string; listing_title: string; listing_type: "individual" | "group_lot"; group_sale_type?: "whole_lot" | "quantity_based" | null;
  available_quantity: number; min_order_quantity: number; max_order_quantity: number; unit_price: string | number;
  seller_user_id: number; seller_name?: string | null; animals: Animal[];
};
type FormProps = { open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void };
type Errors = Record<string, string>;

const HOLD_MAX_DAYS = 30;
const settlementMethods = ["cash_on_delivery", "direct_mobile_money", "bank_transfer", "escrow"].map((value) => ({ value, label: commerceLabel(value) }));
const animalLabel = (animal: Animal) => [animal.identification_number, animal.name].filter(Boolean).join(" · ") || "Unnamed animal";
const personLabel = (person: Person) => person.phone ? `${person.name} · ${person.phone}` : person.name;

/** Loads one portal lookup while [path] is set. */
function useLookup<T>(path: string | null) {
  const [state, setState] = useState<{ path: string | null; data: T[]; error: string | null }>({ path: null, data: [], error: null });
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    authenticatedFetch(`/api/admin/commerce/form/${path}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Could not load the choices.");
        setState({ path, data: payload.data ?? [], error: null });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ path, data: [], error: error instanceof Error ? error.message : "Could not load the choices." });
      });
    return () => controller.abort();
  }, [path]);
  const current = state.path === path;
  return { data: current ? state.data : [], error: current ? state.error : null, loading: Boolean(path) && !current };
}

async function create(path: string, body: Record<string, unknown>, success: string, { onOpenChange, onSaved }: FormProps) {
  try {
    const response = await authenticatedFetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message ?? "Could not save.");
    toast.success(success);
    onOpenChange(false);
    onSaved();
    return true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Could not save.");
    return false;
  }
}

function Choice({ id, label, error, hint, loadError, required = true, className, children }: {
  id: string; label: string; error?: string; hint?: ReactNode; loadError?: string | null; required?: boolean; className?: string; children: ReactNode;
}) {
  return <Field className={className}>
    <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>
    {loadError ? <p role="alert" className="text-sm text-destructive">{loadError}</p> : children}
    {hint && <FieldDescription>{hint}</FieldDescription>}
    <FieldError>{error}</FieldError>
  </Field>;
}

/** Puts a farm owner's animals on the marketplace for them. */
function ListingForm(props: FormProps) {
  const people = useLookup<Person>(props.open ? "people" : null);
  const [sellerId, setSellerId] = useState("");
  const [farmUuid, setFarmUuid] = useState("");
  const [type, setType] = useState<"individual" | "group_lot">("individual");
  const [saleType, setSaleType] = useState<"whole_lot" | "quantity_based">("whole_lot");
  const [picked, setPicked] = useState<string[]>([]);
  const [values, setValues] = useState({ listing_title: "", unit_price: "", min_order_quantity: "", max_order_quantity: "", location_name: "", description: "" });
  const [errors, setErrors] = useState<Errors>({});
  const seller = people.data.find((person) => String(person.id) === sellerId);
  const animals = useLookup<Animal>(farmUuid ? `farms/${encodeURIComponent(farmUuid)}/livestock` : null);

  function chooseSeller(value: string) {
    const farms = people.data.find((person) => String(person.id) === value)?.farms ?? [];
    setSellerId(value);
    setFarmUuid(farms.length === 1 ? farms[0].uuid : "");
    setPicked([]);
    setErrors((old) => ({ ...old, seller_user_id: "", farm_uuid: "", animal_uuids: "" }));
  }

  function validate(keys: string[]) {
    const found: Errors = {};
    if (keys.includes("seller_user_id") && !sellerId) found.seller_user_id = "Choose the seller.";
    if (keys.includes("farm_uuid") && !farmUuid) found.farm_uuid = "Choose the farm the animals are on.";
    if (keys.includes("animal_uuids") && !picked.length) found.animal_uuids = type === "individual" ? "Choose the animal." : "Choose at least one animal.";
    if (keys.includes("listing_title") && !values.listing_title.trim()) found.listing_title = "This field is required.";
    if (keys.includes("unit_price") && !(Number(values.unit_price) > 0)) found.unit_price = "Enter a price above zero.";
    const min = Number(values.min_order_quantity || 1);
    const max = Number(values.max_order_quantity || picked.length);
    if (keys.includes("max_order_quantity") && type === "group_lot" && saleType === "quantity_based" && (min > max || max > picked.length)) found.max_order_quantity = `Order limits must be between 1 and ${picked.length}.`;
    setErrors((old) => ({ ...old, ...Object.fromEntries(keys.map((key) => [key, found[key] ?? ""])) }));
    return Object.keys(found).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate(["seller_user_id", "farm_uuid", "animal_uuids", "listing_title", "unit_price", "max_order_quantity"])) return false;
    const quantityBased = type === "group_lot" && saleType === "quantity_based";
    return create("/api/admin/commerce/listings", {
      seller_user_id: Number(sellerId), farm_uuid: farmUuid, listing_type: type, group_sale_type: type === "group_lot" ? saleType : null,
      animal_uuids: picked, listing_title: values.listing_title.trim(), unit_price: Number(values.unit_price),
      min_order_quantity: quantityBased && values.min_order_quantity ? Number(values.min_order_quantity) : null,
      max_order_quantity: quantityBased && values.max_order_quantity ? Number(values.max_order_quantity) : null,
      location_name: values.location_name.trim() || null, description: values.description.trim() || null,
    }, "Listing published. The animals are now on sale.", props);
  }

  const input = (name: keyof typeof values, label: string, options: { required?: boolean; type?: string; placeholder?: string } = {}) => <Field key={name}>
    <FieldLabel htmlFor={`listing-${name}`} required={options.required}>{label}</FieldLabel>
    <Input id={`listing-${name}`} type={options.type} min={options.type === "number" ? 0 : undefined} placeholder={options.placeholder} value={values[name]} aria-invalid={Boolean(errors[name])} maxLength={255}
      onChange={(event) => { setValues((old) => ({ ...old, [name]: event.target.value })); setErrors((old) => ({ ...old, [name]: "" })); }} />
    <FieldError>{errors[name]}</FieldError>
  </Field>;

  const animalChoice = type === "individual"
    ? <FormSelect id="listing-animal" value={picked[0] ?? ""} onValueChange={(value) => { setPicked([value]); setErrors((old) => ({ ...old, animal_uuids: "" })); const animal = animals.data.find((row) => row.uuid === value); if (animal && !values.listing_title) setValues((old) => ({ ...old, listing_title: animal.name || animal.identification_number || "" })); }}
      searchable disabled={!farmUuid || animals.loading} placeholder={animals.loading ? "Loading animals…" : "Choose an animal"} options={animals.data.map((animal) => ({ value: animal.uuid, label: animalLabel(animal) }))} />
    : <div id="listing-animal" role="group" aria-label="Animals in this lot" className="grid gap-3 sm:grid-cols-2">
      {animals.data.map((animal) => <label key={animal.uuid} className="flex items-start gap-3 rounded-lg bg-muted/40 p-3 text-sm">
        <Checkbox checked={picked.includes(animal.uuid)} onCheckedChange={(checked) => { setPicked((old) => checked === true ? [...old, animal.uuid] : old.filter((uuid) => uuid !== animal.uuid)); setErrors((old) => ({ ...old, animal_uuids: "" })); }} />
        <span><span className="block font-medium">{animal.identification_number || "No tag"}</span><span className="text-muted-foreground">{animal.name || "Unnamed animal"}</span></span>
      </label>)}
    </div>;

  return <FormDialog open={props.open} onOpenChange={props.onOpenChange} onSubmit={submit} submitLabel="Publish listing" size="xl" errors={errors}
    title="Add listing" description="Put a farm owner's animals on sale. The seller can manage the listing from the app."
    onValidateStep={(_index, step) => validate(step.fieldNames ?? [])}
    steps={[
      { id: "animals", title: "Seller and animals", description: "Who is selling, and which animals.", fieldNames: ["seller_user_id", "farm_uuid", "animal_uuids"], content: <FieldGrid>
        <Choice id="listing-seller" label="Seller" error={errors.seller_user_id} loadError={people.error}>
          <FormSelect id="listing-seller" value={sellerId} onValueChange={chooseSeller} searchable disabled={people.loading} placeholder={people.loading ? "Loading people…" : "Choose a farm owner"} options={people.data.map((person) => ({ value: String(person.id), label: personLabel(person) }))} />
        </Choice>
        <Choice id="listing-farm" label="Farm" error={errors.farm_uuid}>
          <FormSelect id="listing-farm" value={farmUuid} onValueChange={(value) => { setFarmUuid(value); setPicked([]); setErrors((old) => ({ ...old, farm_uuid: "" })); }} disabled={!seller} placeholder="Choose the farm" options={(seller?.farms ?? []).map((farm) => ({ value: farm.uuid, label: farm.name }))} />
        </Choice>
        <Choice id="listing-type" label="Listing type">
          <FormSelect id="listing-type" value={type} onValueChange={(value) => { setType(value as typeof type); setPicked([]); }} options={[{ value: "individual", label: "Single animal" }, { value: "group_lot", label: "Group lot" }]} />
        </Choice>
        {type === "group_lot" && <Choice id="listing-sale-type" label="How buyers order">
          <FormSelect id="listing-sale-type" value={saleType} onValueChange={(value) => setSaleType(value as typeof saleType)} options={[{ value: "whole_lot", label: "Whole lot only" }, { value: "quantity_based", label: "Any quantity" }]} />
        </Choice>}
        <Choice id="listing-animal" label={type === "individual" ? "Animal" : `Animals in this lot${picked.length ? ` (${picked.length} selected)` : ""}`} className="sm:col-span-2" error={errors.animal_uuids} loadError={animals.error}
          hint={farmUuid && !animals.loading && !animals.data.length ? "No animals on this farm can be listed. Animals already listed, held or ordered are not shown." : "Only active animals that are not listed, held or ordered are shown."}>
          {animalChoice}
        </Choice>
      </FieldGrid> },
      { id: "details", title: "Listing details", description: "What buyers see in the marketplace.", fieldNames: ["listing_title", "unit_price", "min_order_quantity", "max_order_quantity", "location_name", "description"], content: <FieldGrid>
        {input("listing_title", "Title", { required: true })}
        {input("unit_price", "Price per animal (TZS)", { required: true, type: "number" })}
        {type === "group_lot" && saleType === "quantity_based" && <>{input("min_order_quantity", "Smallest order", { type: "number", placeholder: "1" })}{input("max_order_quantity", "Largest order", { type: "number", placeholder: String(picked.length || "") })}</>}
        {input("location_name", "Location", { placeholder: "Village, ward or district" })}
        <Field className="sm:col-span-2"><FieldLabel htmlFor="listing-description">Description</FieldLabel>
          <Textarea id="listing-description" rows={3} maxLength={2000} value={values.description} onChange={(event) => setValues((old) => ({ ...old, description: event.target.value }))} />
        </Field>
      </FieldGrid> },
    ]} />;
}

/** Places an order for a buyer on an active listing, with the same 48-hour reservation as the app. */
function OrderForm(props: FormProps) {
  const listings = useLookup<OpenListing>(props.open ? "open-listings" : null);
  const people = useLookup<Person>(props.open ? "people" : null);
  const [listingUuid, setListingUuid] = useState("");
  const [animalUuid, setAnimalUuid] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [buyerId, setBuyerId] = useState("");
  const [farmUuid, setFarmUuid] = useState("");
  const [method, setMethod] = useState("cash_on_delivery");
  const [errors, setErrors] = useState<Errors>({});
  const listing = listings.data.find((row) => row.uuid === listingUuid);
  const buyers = useMemo(() => people.data.filter((person) => person.id !== listing?.seller_user_id), [people.data, listing]);
  const buyer = buyers.find((person) => String(person.id) === buyerId);
  const wholeLot = listing?.listing_type === "group_lot" && listing.group_sale_type === "whole_lot";
  const count = listing?.listing_type === "individual" ? 1 : wholeLot ? listing.available_quantity : Number(quantity) || 0;

  function chooseListing(value: string) {
    setListingUuid(value);
    setAnimalUuid("");
    setQuantity(String(listings.data.find((row) => row.uuid === value)?.min_order_quantity ?? 1));
    if (listings.data.find((row) => row.uuid === value)?.seller_user_id === Number(buyerId)) { setBuyerId(""); setFarmUuid(""); }
    setErrors((old) => ({ ...old, listing_uuid: "", livestock_uuid: "", quantity: "" }));
  }

  function validate(keys: string[]) {
    const found: Errors = {};
    if (keys.includes("listing_uuid") && !listing) found.listing_uuid = "Choose the listing.";
    if (keys.includes("livestock_uuid") && listing?.listing_type === "individual" && !animalUuid) found.livestock_uuid = "Choose the animal.";
    if (keys.includes("quantity") && listing && listing.listing_type === "group_lot" && !wholeLot) {
      const max = Math.min(listing.max_order_quantity, listing.available_quantity);
      if (!Number.isInteger(count) || count < listing.min_order_quantity || count > max) found.quantity = `Enter between ${listing.min_order_quantity} and ${max}.`;
    }
    if (keys.includes("buyer_user_id") && !buyerId) found.buyer_user_id = "Choose the buyer.";
    if (keys.includes("destination_farm_uuid") && !farmUuid) found.destination_farm_uuid = "Choose where the animals will go.";
    setErrors((old) => ({ ...old, ...Object.fromEntries(keys.map((key) => [key, found[key] ?? ""])) }));
    return Object.keys(found).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate(["listing_uuid", "livestock_uuid", "quantity", "buyer_user_id", "destination_farm_uuid"])) return false;
    return create("/api/admin/commerce/orders", {
      listing_uuid: listingUuid, livestock_uuid: listing?.listing_type === "individual" ? animalUuid : null, quantity: count,
      buyer_user_id: Number(buyerId), destination_farm_uuid: farmUuid, settlement_method: method,
    }, "Order placed. The animals are reserved for 48 hours and the seller has been notified.", props);
  }

  return <FormDialog open={props.open} onOpenChange={props.onOpenChange} onSubmit={submit} submitLabel="Place order" size="xl" errors={errors}
    title="Add purchase order" description="The animals are reserved for 48 hours while payment is settled, and the seller gets an SMS."
    onValidateStep={(_index, step) => validate(step.fieldNames ?? [])}
    steps={[
      { id: "listing", title: "What is bought", description: "The listing and the animals in this order.", fieldNames: ["listing_uuid", "livestock_uuid", "quantity"], content: <FieldGrid>
        <Choice id="order-listing" label="Listing" className="sm:col-span-2" error={errors.listing_uuid} loadError={listings.error}
          hint={!listings.loading && !listings.data.length ? "There are no active listings with stock left." : listing ? `${listing.seller_name ?? "Seller"} · ${commerceMoney(listing.unit_price)} per animal · ${listing.available_quantity} available` : undefined}>
          <FormSelect id="order-listing" value={listingUuid} onValueChange={chooseListing} searchable disabled={listings.loading} placeholder={listings.loading ? "Loading listings…" : "Choose an active listing"} options={listings.data.map((row) => ({ value: row.uuid, label: `${row.listing_title} · ${row.seller_name ?? "Seller"}` }))} />
        </Choice>
        {listing?.listing_type === "individual" && <Choice id="order-animal" label="Animal" error={errors.livestock_uuid} hint={!listing.animals.length ? "Every animal on this listing is already in an order." : undefined}>
          <FormSelect id="order-animal" value={animalUuid} onValueChange={(value) => { setAnimalUuid(value); setErrors((old) => ({ ...old, livestock_uuid: "" })); }} placeholder="Choose the animal" options={listing.animals.map((animal) => ({ value: animal.uuid, label: animalLabel(animal) }))} />
        </Choice>}
        {listing?.listing_type === "group_lot" && <Choice id="order-quantity" label="Quantity" error={errors.quantity} hint={wholeLot ? "This lot is sold whole." : `Between ${listing.min_order_quantity} and ${Math.min(listing.max_order_quantity, listing.available_quantity)}.`}>
          <Input id="order-quantity" type="number" min={1} disabled={wholeLot} value={wholeLot ? String(listing.available_quantity) : quantity} aria-invalid={Boolean(errors.quantity)} onChange={(event) => { setQuantity(event.target.value); setErrors((old) => ({ ...old, quantity: "" })); }} />
        </Choice>}
      </FieldGrid> },
      { id: "buyer", title: "Buyer and payment", description: "Who buys, where the animals go and how payment is settled.", fieldNames: ["buyer_user_id", "destination_farm_uuid", "settlement_method"], content: <FieldGrid>
        <Choice id="order-buyer" label="Buyer" error={errors.buyer_user_id} loadError={people.error} hint="The seller cannot buy their own listing.">
          <FormSelect id="order-buyer" value={buyerId} onValueChange={(value) => { setBuyerId(value); const farms = buyers.find((person) => String(person.id) === value)?.farms ?? []; setFarmUuid(farms.length === 1 ? farms[0].uuid : ""); setErrors((old) => ({ ...old, buyer_user_id: "", destination_farm_uuid: "" })); }}
            searchable disabled={people.loading} placeholder={people.loading ? "Loading people…" : "Choose the buyer"} options={buyers.map((person) => ({ value: String(person.id), label: personLabel(person) }))} />
        </Choice>
        <Choice id="order-farm" label="Destination farm" error={errors.destination_farm_uuid}>
          <FormSelect id="order-farm" value={farmUuid} onValueChange={(value) => { setFarmUuid(value); setErrors((old) => ({ ...old, destination_farm_uuid: "" })); }} disabled={!buyer} placeholder="Choose the buyer's farm" options={(buyer?.farms ?? []).map((farm) => ({ value: farm.uuid, label: farm.name }))} />
        </Choice>
        <Choice id="order-method" label="Settlement method">
          <FormSelect id="order-method" value={method} onValueChange={setMethod} options={settlementMethods} />
        </Choice>
        {listing && count > 0 && <Field><FieldLabel htmlFor="order-total">Total price (TZS)</FieldLabel><Input id="order-total" disabled value={commerceMoney(Number(listing.unit_price) * count)} /><FieldDescription>Any bulk price on the listing is applied when the order is placed.</FieldDescription></Field>}
      </FieldGrid> },
    ]} />;
}

const localDateTime = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

/** Keeps one animal for one person until a set time. Other buyers cannot order it or list it meanwhile. */
function HoldForm(props: FormProps) {
  const animals = useLookup<Animal>(props.open ? "holdable-livestock" : null);
  const people = useLookup<Person>(props.open ? "people" : null);
  const [animalUuid, setAnimalUuid] = useState("");
  const [personId, setPersonId] = useState("");
  const [until, setUntil] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [now] = useState(() => new Date());
  const latest = localDateTime(new Date(now.getTime() + HOLD_MAX_DAYS * 86400000));

  function validate() {
    const found: Errors = {};
    if (!animalUuid) found.livestock_uuid = "Choose the animal.";
    if (!personId) found.held_by_user_id = "Choose who the animal is held for.";
    if (!until) found.expires_at = "Choose when the hold ends.";
    else if (until <= localDateTime(new Date()) || until > latest) found.expires_at = `Choose a time within the next ${HOLD_MAX_DAYS} days.`;
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return false;
    return create("/api/admin/commerce/reservations", {
      livestock_uuid: animalUuid, held_by_user_id: Number(personId), expires_at: new Date(until).toISOString(),
    }, "Hold created. Only this person can order the animal until the hold ends.", props);
  }

  return <FormDialog open={props.open} onOpenChange={props.onOpenChange} onSubmit={submit} submitLabel="Create hold" size="lg" errors={errors}
    title="Add hold" description={`Keep an animal for one person for up to ${HOLD_MAX_DAYS} days. Nobody else can order or list it until the hold ends or is released.`}>
    <FieldGrid>
      <Choice id="hold-animal" label="Animal" className="sm:col-span-2" error={errors.livestock_uuid} loadError={animals.error}
        hint="Animals already held or in an order are not shown.">
        <FormSelect id="hold-animal" value={animalUuid} onValueChange={(value) => { setAnimalUuid(value); setErrors((old) => ({ ...old, livestock_uuid: "" })); }} searchable disabled={animals.loading} placeholder={animals.loading ? "Loading animals…" : "Choose an animal"}
          options={animals.data.map((animal) => ({ value: animal.uuid, label: animal.farm_name ? `${animalLabel(animal)} · ${animal.farm_name}` : animalLabel(animal) }))} />
      </Choice>
      <Choice id="hold-person" label="Held for" error={errors.held_by_user_id} loadError={people.error}>
        <FormSelect id="hold-person" value={personId} onValueChange={(value) => { setPersonId(value); setErrors((old) => ({ ...old, held_by_user_id: "" })); }} searchable disabled={people.loading} placeholder={people.loading ? "Loading people…" : "Choose a person"} options={people.data.map((person) => ({ value: String(person.id), label: personLabel(person) }))} />
      </Choice>
      <Choice id="hold-until" label="Hold until" error={errors.expires_at}>
        <Input id="hold-until" type="datetime-local" min={localDateTime(now)} max={latest} value={until} aria-invalid={Boolean(errors.expires_at)} onChange={(event) => { setUntil(event.target.value); setErrors((old) => ({ ...old, expires_at: "" })); }} />
      </Choice>
    </FieldGrid>
  </FormDialog>;
}

export function CommerceCreateForm({ resource, ...props }: FormProps & { resource: CommerceResource }) {
  if (resource === "listings") return <ListingForm {...props} />;
  if (resource === "orders") return <OrderForm {...props} />;
  return <HoldForm {...props} />;
}
