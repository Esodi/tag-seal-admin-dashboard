import { eventTypes } from "@/features/events/event-types";

export type FeatureStatus = "stable" | "new" | "migration";

export type FeatureDefinition = {
  slug: string;
  label: string;
  description: string;
  columns: string[];
  status?: FeatureStatus;
  primaryAction?: string;
};

export type FeatureGroup = {
  slug: string;
  label: string;
  description: string;
  features: FeatureDefinition[];
};

const feature = (
  slug: string,
  label: string,
  description: string,
  columns: string[],
  options: Pick<FeatureDefinition, "status" | "primaryAction"> = {},
): FeatureDefinition => ({ slug, label, description, columns, primaryAction: "Add new", ...options });

export const featureGroups: FeatureGroup[] = [
  {
    slug: "people",
    label: "People & Organization",
    description: "Farms, people, accounts and access relationships.",
    features: [
      feature("farms", "Farms", "Farm registry, ownership and geographical coverage.", ["Farm", "Owner", "Location", "Animals", "Status"], { primaryAction: "Add farm" }),
      feature("farmers", "Farmers", "Farmer profiles, identity and contact information.", ["Farmer", "Farmer no.", "Phone", "Farms", "Status"], { primaryAction: "Add farmer" }),
      feature("extension-officers", "Extension Officers", "Field officers supporting farms and farmers.", ["Officer", "Email", "Phone", "District", "Status"], { primaryAction: "Add officer" }),
      feature("farm-users", "Farm Users", "Users assigned to one or multiple farms.", ["User", "Account", "Assigned farms", "Role", "Status"], { primaryAction: "Assign user" }),
      feature("farm-invites", "Farm Invites", "Extension-officer invitations and acceptance status.", ["Invitee", "Farm", "Invited by", "Expires", "Status"], { primaryAction: "Send invite" }),
      feature("system-user-profiles", "System User Profiles", "Administrative staff profiles and operational scope.", ["Profile", "User account", "Region", "Role", "Status"], { primaryAction: "Add profile" }),
      feature("user-accounts", "User Accounts", "Authentication accounts, roles and account state.", ["Username", "Email", "Role", "Last active", "Status"], { primaryAction: "Create account" }),
    ],
  },
  {
    slug: "events",
    label: "Events & Logs",
    description: "Unified animal event history, lifecycle workflows and operational activity.",
    features: eventTypes.filter((eventType) => eventType.slug !== "all-events").map((eventType) => {
      const isId = eventType.slug === "identification-events";
      const columns = isId
        ? ["Farm", "Livestock Tag", "Identification No.", "Event Date", "Remarks", "Created At"]
        : ["Animal / Group", "Farm", ...eventType.fields.map((f) => f.label), "Date Recorded", "Status"];

      return feature(
        eventType.slug,
        eventType.name,
        eventType.description,
        columns,
        {
          status: eventType.status,
          primaryAction: eventType.primaryAction,
        },
      );
    }),
  },
  {
    slug: "animals",
    label: "Animals & Livestock",
    description: "Dynamic animal subjects and the legacy livestock registry.",
    features: [
      feature("animals", "Animals", "Dynamic animal subjects, identifiers and timelines.", ["Animal", "Species", "Primary ID", "Farm", "Status"], { status: "new", primaryAction: "Register animal" }),
      feature("legacy-livestock", "Legacy Livestock", "Existing livestock records retained during ledger migration.", ["Livestock", "Tag no.", "Type", "Farm", "Migration state"], { status: "migration", primaryAction: "Add legacy record" }),
      feature("animal-types", "Animal Types", "High-level livestock usage classifications.", ["Type", "Code", "Species", "Animals", "Status"], { primaryAction: "Add type" }),
      feature("species", "Species", "Legacy species catalogue and type mappings.", ["Species", "Animal type", "Breeds", "Animals", "Status"], { primaryAction: "Add species" }),
      feature("breeds", "Breeds", "Breed catalogue associated with species.", ["Breed", "Species", "Code", "Animals", "Status"], { primaryAction: "Add breed" }),
      feature("acquisition-methods", "Acquisition Methods", "Ways animals enter a farm or herd.", ["Method", "Code", "Description", "Usage", "Status"], { primaryAction: "Add method" }),
    ],
  },
  {
    slug: "blueprints",
    label: "Blueprint Engine",
    description: "Dynamic platform configuration, forms and publishing.",
    features: [
      feature("animal-blueprints", "Animal Blueprints", "Versioned animal workflows, identity and capability settings.", ["Blueprint", "Species", "Version", "Events", "Status"], { status: "new", primaryAction: "Create blueprint" }),
      feature("event-definitions", "Event Definitions", "Map event forms to behaviors, eligibility and subject modes.", ["Event", "Behavior", "Form", "Version", "Status"], { status: "new", primaryAction: "Create event" }),
      feature("form-definitions", "Form Definitions", "Reusable registration and event form schemas.", ["Form", "Purpose", "Version", "Fields", "Status"], { status: "new", primaryAction: "Build form" }),
      feature("lookup-sets", "Lookup Sets", "Reusable flat and hierarchical option catalogues.", ["Lookup", "Code", "Options", "Hierarchy", "Status"], { status: "new", primaryAction: "Create lookup" }),
      feature("dynamic-species", "Dynamic Species", "Species enabled for blueprint-driven registration.", ["Species", "Code", "Blueprints", "Published version", "Status"], { status: "new", primaryAction: "Add species" }),
    ],
  },
  {
    slug: "finance",
    label: "Finance & Billing",
    description: "Bills, income, expenditure and financial reporting.",
    features: [
      feature("bills", "Bills", "Farm and animal-related bills and payment state.", ["Bill no.", "Farmer", "Farm", "Amount", "Status"], { primaryAction: "Create bill" }),
      feature("income", "Income", "Manual and event-linked income records.", ["Reference", "Farm", "Source", "Amount", "Date"], { primaryAction: "Record income" }),
      feature("expenditure", "Expenditure", "Manual and event-linked expense records.", ["Reference", "Farm", "Category", "Amount", "Date"], { primaryAction: "Record expense" }),
      feature("income-expenditure", "Income & Expenditure", "Financial summaries, comparisons and exports.", ["Period", "Farm", "Income", "Expenditure", "Balance"], { primaryAction: "Generate report" }),
    ],
  },
  {
    slug: "commerce",
    label: "Livestock Commerce",
    description: "Marketplace listings, anti-double-sale reservations and purchase orders.",
    features: [
      feature("listings", "Marketplace Listings", "Advertised animals for public trading.", ["Title", "Seller", "Farm", "Asking Price", "Status"], { status: "new", primaryAction: "Create listing" }),
      feature("reservations", "Commercial Holds", "Active exclusive holds locking animals from double sales.", ["Animal", "Hold Type", "Held By", "Expires", "Status"], { status: "new", primaryAction: "View holds" }),
      feature("orders", "Purchase Orders", "Negotiated orders, settlement and physical tag handover.", ["Order Code", "Seller", "Buyer", "Amount", "Status"], { status: "new", primaryAction: "View orders" }),
    ],
  },
  {
    slug: "dairy",
    label: "Dairy Operations",
    description: "Milk collection centres, bulk cooling tanks and factory delivery.",
    features: [
      feature("centres", "Collection Centres", "Rural milk intake centres with cooling facilities.", ["Centre Code", "Name", "Region", "District", "Status"], { status: "new", primaryAction: "Add centre" }),
      feature("tanks", "Cooling Tanks", "Refrigerated stainless bulk storage tanks.", ["Tank Code", "Centre", "Capacity", "Target Temp", "Status"], { status: "new", primaryAction: "Add tank" }),
      feature("batches", "Intake Batches", "Morning and evening daily collection sessions.", ["Batch Code", "Centre", "Session", "Date", "Status"], { status: "new", primaryAction: "Open batch" }),
      feature("intakes", "Farmer Intakes", "Milk intakes via digital scale and rapid lab QA tests.", ["Intake ID", "Centre", "Farmer", "Volume", "Timestamp"], { status: "new", primaryAction: "Record intake" }),
      feature("dispatches", "Milk Dispatches", "Tanker movement manifests and container security seals.", ["Dispatch Code", "Centre", "Factory", "Volume", "Status"], { status: "new", primaryAction: "Create dispatch" }),
      feature("deliveries", "Factory Deliveries", "Weighbridge receiving and discrepancy reconciliation.", ["Delivery Note", "Dispatch Ref", "Received Vol", "QA Status", "Date"], { status: "new", primaryAction: "Receive delivery" }),
      feature("transporters", "Transporters & Fleet", "Milk tanker transport carriers, LATRA permits, and drivers.", ["Company", "License", "Vehicles", "Drivers", "Approval"], { status: "new", primaryAction: "Register transporter" }),
      feature("factories", "Dairy Processing Plants", "Processing factories, storage capacity, and TDB licenses.", ["Factory", "Code", "Location", "Capacity", "Approval"], { status: "new", primaryAction: "Register factory" }),
      feature("trips", "Milk Tanker Trips", "Multi-stop collection journeys with mid-transit route addition.", ["Trip No.", "Transporter", "Plate", "Total Liters", "Status"], { status: "new", primaryAction: "Create trip" }),
      feature("factory-tanks", "Factory Bulk Silos", "Processing plant bulk silos and live storage monitors.", ["Tank Code", "Factory", "Capacity", "Current Stock", "Status"], { status: "new", primaryAction: "Add tank" }),
    ],
  },
  {
    slug: "reference",
    label: "Reference Master Data",
    description: "Controlled values shared across operational forms.",
    features: [
      feature("vaccines", "Vaccines", "Vaccine products and manufacturer information.", ["Vaccine", "Type", "Manufacturer", "Usage", "Status"], { primaryAction: "Add vaccine" }),
      feature("vaccine-types", "Vaccine Types", "Classification of vaccine products.", ["Type", "Code", "Vaccines", "Description", "Status"], { primaryAction: "Add type" }),
      feature("medicine-types", "Medicine Types", "Classification of treatments and medicines.", ["Type", "Code", "Medicines", "Description", "Status"], { primaryAction: "Add type" }),
      feature("marking-types", "Marking Types", "Supported livestock marking methods.", ["Method", "Code", "Species", "Usage", "Status"], { primaryAction: "Add method" }),
      feature("tail-docking-methods", "Tail Docking Methods", "Approved tail docking methods.", ["Method", "Code", "Species", "Usage", "Status"], { primaryAction: "Add method" }),
      feature("teeth-clipping-methods", "Teeth Clipping Methods", "Approved teeth clipping methods.", ["Method", "Code", "Species", "Usage", "Status"], { primaryAction: "Add method" }),
      feature("id-card-types", "ID Card Types", "Supported personal identification documents.", ["ID type", "Code", "Country", "Usage", "Status"], { primaryAction: "Add ID type" }),
      feature("school-levels", "School Levels", "Education levels used in farmer profiles.", ["Level", "Code", "Order", "Usage", "Status"], { primaryAction: "Add level" }),
      feature("legal-statuses", "Legal Statuses", "Legal structures used for farms and organizations.", ["Status", "Code", "Description", "Usage", "Active"], { primaryAction: "Add legal status" }),
    ],
  },
  {
    slug: "locations",
    label: "Geographical Locations",
    description: "Tanzania location hierarchy and address reference data.",
    features: [
      feature("countries", "Countries", "Supported countries and country codes.", ["Country", "ISO code", "Regions", "Usage", "Status"], { primaryAction: "Add country" }),
      feature("regions", "Regions", "Administrative regions within a country.", ["Region", "Country", "Districts", "Usage", "Status"], { primaryAction: "Add region" }),
      feature("districts", "Districts", "District registry and regional relationships.", ["District", "Region", "Wards", "Usage", "Status"], { primaryAction: "Add district" }),
      feature("divisions", "Divisions", "Administrative divisions inside districts.", ["Division", "District", "Wards", "Usage", "Status"], { primaryAction: "Add division" }),
      feature("wards", "Wards", "Ward registry and district relationships.", ["Ward", "District", "Villages", "Usage", "Status"], { primaryAction: "Add ward" }),
      feature("villages", "Villages", "Village registry and ward relationships.", ["Village", "Ward", "Streets", "Usage", "Status"], { primaryAction: "Add village" }),
      feature("streets", "Streets", "Street registry and local relationships.", ["Street", "Village", "Ward", "Usage", "Status"], { primaryAction: "Add street" }),
    ],
  },
  {
    slug: "system",
    label: "System & Security",
    description: "Security, migrations, upgrades and platform controls.",
    features: [
      feature("otp-verifications", "OTP Verifications", "Authentication verification attempts and delivery state.", ["Recipient", "Channel", "Purpose", "Expires", "Status"], { primaryAction: "View policy" }),
      feature("ledger-migration", "Ledger Migration", "Legacy event-family migration and reconciliation controls.", ["Family", "Authority", "Records", "Reconciled", "State"], { status: "migration", primaryAction: "Run reconciliation" }),
      feature("upgrade-runs", "Upgrade Runs", "Platform upgrade execution, progress and results.", ["Upgrade", "Version", "Started", "Duration", "Status"], { status: "new", primaryAction: "Check upgrades" }),
    ],
  },
];

export const accountGroup: FeatureGroup = {
  slug: "account",
  label: "Account",
  description: "Personal details, access protection and communication preferences.",
  features: [
    feature("profile", "My Profile", "Personal identity, contact details and administrator profile.", ["Field", "Current value", "Visibility", "Updated", "Status"], { primaryAction: "Edit profile" }),
    feature("security", "Account & Security", "Password, active sessions, sign-in protection and recovery options.", ["Security control", "Method", "Last checked", "Device", "Status"], { primaryAction: "Review security" }),
    feature("notifications", "Notifications", "Email, SMS and in-app notification preferences.", ["Notification", "Channel", "Frequency", "Scope", "Status"], { primaryAction: "Save preferences" }),
  ],
};

export const allFeatures = [...featureGroups, accountGroup].flatMap((group) =>
  group.features.map((item) => ({ ...item, groupSlug: group.slug, groupLabel: group.label })),
);

export function getFeature(groupSlug: string, featureSlug: string) {
  const group = [...featureGroups, accountGroup].find((item) => item.slug === groupSlug);
  const featureItem = group?.features.find((item) => item.slug === featureSlug);
  return group && featureItem ? { group, feature: featureItem } : null;
}
