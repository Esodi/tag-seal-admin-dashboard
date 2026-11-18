import { eventTypes } from "@/features/events/event-types";

export type FeatureStatus = "stable" | "new" | "migration";

export type FeatureDefinition = {
  slug: string;
  label: string;
  description: string;
  columns: string[];
  status?: FeatureStatus;
  primaryAction?: string;
  /** Still reachable by URL, but left out of the sidebar and section overview. */
  hidden?: boolean;
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
  options: Pick<FeatureDefinition, "status" | "primaryAction" | "hidden"> = {},
): FeatureDefinition => ({
  slug,
  label,
  description,
  columns,
  primaryAction: "Add new",
  ...options,
});

export const featureGroups: FeatureGroup[] = [
  {
    slug: "people",
    label: "People & Organization",
    description: "Farms, people, accounts and access relationships.",
    features: [
      feature(
        "farms",
        "Farms",
        "Farm registry, ownership and geographical coverage.",
        ["Farm", "Owner", "Location", "Animals", "Status"],
        { primaryAction: "Add farm" },
      ),
      feature(
        "farmers",
        "Farmers",
        "Farmer profiles, identity and contact information.",
        ["Farmer", "Farmer no.", "Phone", "Farms", "Status"],
        { primaryAction: "Add farmer" },
      ),
      feature(
        "extension-officers",
        "Extension Officers",
        "Field officers supporting farms and farmers.",
        ["Officer", "Email", "Phone", "District", "Status"],
        { primaryAction: "Add officer" },
      ),
      feature(
        "farm-workers",
        "Farm Workers",
        "Farm staff, manual worker registrations and Career hires with approved duties and farm access.",
        ["Worker", "Farm", "Role", "Source", "Status", "Farm Access"],
        { status: "new", primaryAction: "Register pending worker" },
      ),
      feature(
        "farm-invites",
        "Farm Invites",
        "Extension-officer invitations and acceptance status.",
        ["Invitee", "Farm", "Invited by", "Expires", "Status"],
        { primaryAction: "Send invite" },
      ),
      feature(
        "system-user-profiles",
        "System User Profiles",
        "Administrative staff profiles and operational scope.",
        ["Profile", "User account", "Region", "Role", "Status"],
        { primaryAction: "Add profile" },
      ),
      feature(
        "user-accounts",
        "User Accounts",
        "Authentication accounts, roles and account state.",
        ["Username", "Email", "Role", "Last active", "Status"],
        { primaryAction: "Create account" },
      ),
    ],
  },
  {
    slug: "events",
    label: "Events & Logs",
    description:
      "Unified animal event history, lifecycle workflows and operational activity.",
    features: eventTypes
      .filter((eventType) => eventType.slug !== "all-events")
      .map((eventType) => {
        const isId = eventType.slug === "identification-events";
        const columns = isId
          ? [
              "Farm",
              "Livestock Tag",
              "Identification No.",
              "Event Date",
              "Remarks",
              "Created At",
            ]
          : [
              "Animal / Group",
              "Farm",
              ...eventType.fields.map((f) => f.label),
              "Date Recorded",
              "Status",
            ];

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
    description: "Livestock registry, identification tags, breeds, and lifecycle status.",
    features: [
      feature(
        "legacy-livestock",
        "Livestocks",
        "Registered livestock records, identification tags, breeds, and lifecycle status.",
        [
          "Livestock Name",
          "ID Number",
          "Farm",
          "Species",
          "Breed",
          "Type",
          "Gender",
          "DOB",
          "Weight",
          "Stage",
          "Identified",
          "Status",
        ],
        { primaryAction: "Add livestock" },
      ),
      feature(
        "animals",
        "Animals",
        "Dynamic animal subjects, identifiers and timelines.",
        ["Animal", "Species", "Primary ID", "Farm", "Status"],
        { hidden: true },
      ),
      feature(
        "animal-types",
        "Animal Types",
        "High-level livestock usage classifications.",
        ["Type", "Code", "Species", "Animals", "Status"],
        { primaryAction: "Add type" },
      ),
      feature(
        "species",
        "Species",
        "Legacy species catalogue and type mappings.",
        ["Species", "Animal type", "Breeds", "Animals", "Status"],
        { primaryAction: "Add species", hidden: true },
      ),
      feature(
        "breeds",
        "Breeds",
        "Breed catalogue associated with species.",
        ["Breed", "Species", "Code", "Animals", "Status"],
        { primaryAction: "Add breed" },
      ),
      feature(
        "acquisition-methods",
        "Acquisition Methods",
        "Ways animals enter a farm or herd.",
        ["Method", "Code", "Description", "Usage", "Status"],
        { primaryAction: "Add method" },
      ),
      feature(
        "stages",
        "Stages",
        "Growth and developmental stages per animal type with tagging requirement policy.",
        ["Stage", "Livestock type", "Tagging requirement", "Animals", "Created at"],
        { primaryAction: "Add stage" },
      ),
    ],
  },
  {
    slug: "career",
    label: "Career & Jobs",
    description:
      "Farm recruitment portal, agricultural job listings, candidate profiles and applications.",
    features: [
      feature(
        "jobs",
        "Job Postings",
        "Active and closed agricultural job advertisements across farms.",
        [
          "Title",
          "Category",
          "Employer / Farm",
          "Location",
          "Deadline",
          "Applications",
          "Status",
        ],
        { status: "new", primaryAction: "View vacancies" },
      ),
      feature(
        "applications",
        "Job Applications",
        "Candidate applications, applicant profiles, and review workflow.",
        [
          "Candidate",
          "Applied Job",
          "Employer",
          "Experience",
          "Readiness",
          "Submitted At",
          "Status",
        ],
        { status: "new", primaryAction: "Review applications" },
      ),
      feature(
        "job-seekers",
        "Job Seekers",
        "Registered farm worker CV profiles, qualifications and availability.",
        [
          "Candidate",
          "NIDA",
          "Phone",
          "Location",
          "Qualifications",
          "Readiness",
          "Status",
        ],
        { status: "new", primaryAction: "View profiles" },
      ),
      feature(
        "employers",
        "Farm Employers",
        "Registered farm owners, hiring organizations and employer access.",
        [
          "Organization",
          "Owner",
          "Registration No.",
          "Active Jobs",
          "Applications",
          "Status",
        ],
        { status: "new", primaryAction: "View employers" },
      ),
      feature(
        "memberships",
        "Feature Memberships",
        "Account memberships, verified identities and explicit farmer relationships.",
        ["Member", "Feature", "Organization", "Verified phone", "Status"],
      ),
      feature(
        "onboardings",
        "Joining & Onboarding",
        "Joining terms, applicant replies, arrival and owner approval.",
        ["Worker", "Farm", "Role", "Joining status", "Response date"],
      ),
      feature(
        "job-types",
        "Job Categories",
        "Standardized agricultural career specializations and job categories.",
        ["Category", "Code", "Name (EN)", "Name (SW)", "Active Jobs", "Status"],
        { status: "new", primaryAction: "Add job type" },
      ),
      feature(
        "job-options",
        "Career Options",
        "Controlled form choices for employment type, workplace and requirements.",
        ["Group", "Code", "Name (EN)", "Name (SW)", "Status"],
        { status: "new", primaryAction: "Add option" },
      ),
    ],
  },
  {
    slug: "blueprints",
    label: "Animal Setup",
    description: "The events farmers record for each animal type, and the options they choose from.",
    features: [
      feature(
        "animal-types-events",
        "Animal Type & Event Blueprints",
        "Choose the events farmers record for each animal type and the details each event asks for.",
        ["Animal type", "Events", "Version", "Status"],
        { status: "new", primaryAction: "Set up animal type" },
      ),
      feature(
        "lookup-sets",
        "Event Field Options",
        "Approved answers for choice fields, such as diseases, medicines, birth types and animal stages.",
        ["Option list", "Code", "Options", "Depends on", "Status"],
        { primaryAction: "Create option list" },
      ),
      // Internal building blocks managed through Animal Type & Event Blueprints.
      feature(
        "animal-blueprints",
        "Animal Blueprints",
        "Versioned animal workflows, identity and capability settings.",
        ["Blueprint", "Species", "Version", "Events", "Status"],
        { hidden: true },
      ),
      feature(
        "event-definitions",
        "Event Definitions",
        "Map event forms to behaviors, eligibility and subject modes.",
        ["Event", "Behavior", "Form", "Version", "Status"],
        { hidden: true },
      ),
      feature(
        "form-definitions",
        "Form Definitions",
        "Reusable registration and event form schemas.",
        ["Form", "Purpose", "Version", "Fields", "Status"],
        { hidden: true },
      ),
      feature(
        "dynamic-species",
        "Dynamic Species",
        "Species enabled for blueprint-driven registration.",
        ["Species", "Code", "Blueprints", "Published version", "Status"],
        { hidden: true },
      ),
    ],
  },
  {
    slug: "finance",
    label: "Finance & Billing",
    description: "Bills, income, expenditure and financial reporting.",
    features: [
      feature(
        "bills",
        "Bills",
        "Farm and animal-related bills and payment state.",
        ["Bill no.", "Farmer", "Farm", "Amount", "Status"],
        { primaryAction: "Create bill" },
      ),
      feature(
        "income",
        "Income",
        "Manual and event-linked income records.",
        ["Reference", "Farm", "Source", "Amount", "Date"],
        { primaryAction: "Record income" },
      ),
      feature(
        "expenditure",
        "Expenditure",
        "Manual and event-linked expense records.",
        ["Reference", "Farm", "Category", "Amount", "Date"],
        { primaryAction: "Record expense" },
      ),
      feature(
        "income-expenditure",
        "Income & Expenditure",
        "Financial summaries, comparisons and exports.",
        ["Period", "Farm", "Income", "Expenditure", "Balance"],
        { primaryAction: "Generate report" },
      ),
    ],
  },
  {
    slug: "commerce",
    label: "Livestock Commerce",
    description:
      "Marketplace listings, anti-double-sale reservations and purchase orders.",
    features: [
      feature(
        "listings",
        "Marketplace Listings",
        "Advertised animals for public trading.",
        ["Title", "Seller", "Farm", "Asking Price", "Status"],
        { status: "new", primaryAction: "Create listing" },
      ),
      feature(
        "reservations",
        "Commercial Holds",
        "Active exclusive holds locking animals from double sales.",
        ["Animal", "Hold Type", "Held By", "Expires", "Status"],
        { status: "new", primaryAction: "View holds" },
      ),
      feature(
        "orders",
        "Purchase Orders",
        "Negotiated orders, settlement and physical tag handover.",
        ["Order Code", "Seller", "Buyer", "Amount", "Status"],
        { status: "new", primaryAction: "View orders" },
      ),
    ],
  },
  {
    slug: "auction",
    label: "Livestock Auctions",
    description:
      "Auction centres and their people, officer approvals, and scheduled, live and past auctions.",
    features: [
      feature(
        "centres",
        "Auction Centres",
        "Livestock markets where auctions are held, and their members.",
        ["Centre", "Location", "Members", "Auctions", "Status"],
        { status: "new", primaryAction: "Add centre" },
      ),
      feature(
        "officers",
        "Auction Officers",
        "Auctioneer applications to approve, and officers added here.",
        ["Officer", "Phone", "Requested Centre", "Approval", "Status"],
        { status: "new", primaryAction: "Add officer" },
      ),
      feature(
        "sessions",
        "Auction Sessions",
        "Scheduled, live and past auctions with their lots.",
        ["Auction", "Centre", "Officer", "Scheduled", "Status"],
        { status: "new", primaryAction: "View auctions" },
      ),
    ],
  },
  {
    slug: "vet",
    label: "Veterinary Services",
    description:
      "Veterinarian approvals and the service requests farmers send them.",
    features: [
      feature(
        "vets",
        "Veterinarians",
        "Vet applications to approve, and vets added here.",
        ["Vet", "Phone", "Licence", "Approval", "Status"],
        { status: "new", primaryAction: "Add vet" },
      ),
      feature(
        "requests",
        "Service Requests",
        "Visits farmers request from vets, and their progress.",
        ["Reference", "Farmer", "Vet", "Service", "Status"],
        { status: "new", primaryAction: "View requests" },
      ),
    ],
  },
  {
    slug: "dairy",
    label: "Cooperative Operations",
    description:
      "Unions, cooperatives, centres and factories, and milk from farmer intake to factory receipt.",
    features: [
      feature(
        "unions",
        "Cooperative Unions (MCU)",
        "Register and manage cooperative unions.",
        ["Name", "Registration", "Contact", "Status"],
        { primaryAction: "Register union" },
      ),
      feature(
        "cooperatives",
        "Cooperatives (AMCOS)",
        "Register cooperatives linked to a union or operating independently.",
        ["Name", "Union", "Contact", "Status"],
        { primaryAction: "Register cooperative" },
      ),
      feature(
        "centres",
        "Collection Centres",
        "View centres, their cooperatives, locations and milk stock balance.",
        ["Name", "Cooperative", "Location", "Contact", "Status"],
        { primaryAction: "View centres" },
      ),
      feature(
        "factories",
        "Factories",
        "Processing factories that receive milk from collection centres.",
        ["Factory", "Code", "Location", "Capacity", "Approval"],
        { status: "new", primaryAction: "Register factory" },
      ),
      feature(
        "intakes",
        "Milk Intakes",
        "Milk each farmer delivers to a centre: litres, quality tests and temperature, accepted and rejected quantities.",
        ["Intake ID", "Centre", "Farmer", "Volume", "Timestamp"],
        { status: "new" },
      ),
      feature(
        "dispatches",
        "Milk Dispatches",
        "Milk sent from a collection centre to a factory: batch, loading time and temperature, seals, driver and vehicle.",
        ["Dispatch Code", "Centre", "Factory", "Volume", "Status"],
        { status: "new" },
      ),
      feature(
        "trips",
        "Driver Trips",
        "Journeys a driver creates from dispatches assigned to them and drives to the factory.",
        ["Trip No.", "Transporter", "Plate", "Total Liters", "Status"],
        { status: "new" },
      ),
      feature(
        "deliveries",
        "Factory Receipts & Reconciliation",
        "Milk a factory receives, compared with what was dispatched: shortages, spillages and quality rejections.",
        ["Delivery Note", "Trip", "Received Vol", "Variance", "Date"],
        { status: "new" },
      ),
      feature(
        "transporters",
        "Transporters & Fleet",
        "Milk transport companies, their permits, vehicles and drivers.",
        ["Company", "License", "Vehicles", "Drivers", "Approval"],
        { status: "new", primaryAction: "Register transporter" },
      ),
      feature(
        "transport-vehicles",
        "Transport Vehicles",
        "Milk vehicles registered by transporters and their assigned drivers.",
        ["Plate", "Company", "Type", "Capacity", "Driver"],
        { status: "new" },
      ),
      feature(
        "transport-drivers",
        "Transport Drivers",
        "Drivers registered by transporters, their licences and vehicles.",
        ["Driver", "Phone", "Company", "Licence", "Vehicle"],
        { status: "new" },
      ),
    ],
  },
  {
    slug: "reference",
    label: "Reference Master Data",
    description: "Controlled values shared across operational forms.",
    features: [
      feature(
        "vaccines",
        "Vaccines",
        "Vaccine products and manufacturer information.",
        ["Vaccine", "Type", "Manufacturer", "Usage", "Status"],
        { primaryAction: "Add vaccine" },
      ),
      feature(
        "vaccine-types",
        "Vaccine Types",
        "Classification of vaccine products.",
        ["Type", "Code", "Vaccines", "Description", "Status"],
        { primaryAction: "Add type" },
      ),
      feature(
        "medicine-types",
        "Medicine Types",
        "Classification of treatments and medicines.",
        ["Type", "Code", "Medicines", "Description", "Status"],
        { primaryAction: "Add type" },
      ),
      feature(
        "marking-types",
        "Marking Types",
        "Supported livestock marking methods.",
        ["Method", "Code", "Species", "Usage", "Status"],
        { primaryAction: "Add method" },
      ),
      feature(
        "tail-docking-methods",
        "Tail Docking Methods",
        "Approved tail docking methods.",
        ["Method", "Code", "Species", "Usage", "Status"],
        { primaryAction: "Add method" },
      ),
      feature(
        "teeth-clipping-methods",
        "Teeth Clipping Methods",
        "Approved teeth clipping methods.",
        ["Method", "Code", "Species", "Usage", "Status"],
        { primaryAction: "Add method" },
      ),
      feature(
        "id-card-types",
        "ID Card Types",
        "Supported personal identification documents.",
        ["ID type", "Code", "Country", "Usage", "Status"],
        { primaryAction: "Add ID type" },
      ),
      feature(
        "school-levels",
        "School Levels",
        "Education levels used in farmer profiles.",
        ["Level", "Code", "Order", "Usage", "Status"],
        { primaryAction: "Add level" },
      ),
      feature(
        "legal-statuses",
        "Legal Statuses",
        "Legal structures used for farms and organizations.",
        ["Status", "Code", "Description", "Usage", "Active"],
        { primaryAction: "Add legal status" },
      ),
    ],
  },
  {
    slug: "locations",
    label: "Geographical Locations",
    description: "Tanzania location hierarchy and address reference data.",
    features: [
      feature(
        "countries",
        "Countries",
        "Supported countries and country codes.",
        ["Country", "ISO code", "Regions", "Usage", "Status"],
        { primaryAction: "Add country" },
      ),
      feature(
        "regions",
        "Regions",
        "Administrative regions within a country.",
        ["Region", "Country", "Districts", "Usage", "Status"],
        { primaryAction: "Add region" },
      ),
      feature(
        "districts",
        "Districts",
        "District registry and regional relationships.",
        ["District", "Region", "Wards", "Usage", "Status"],
        { primaryAction: "Add district" },
      ),
      feature(
        "divisions",
        "Divisions",
        "Administrative divisions inside districts.",
        ["Division", "District", "Wards", "Usage", "Status"],
        { primaryAction: "Add division" },
      ),
      feature(
        "wards",
        "Wards",
        "Ward registry and district relationships.",
        ["Ward", "District", "Villages", "Usage", "Status"],
        { primaryAction: "Add ward" },
      ),
      feature(
        "villages",
        "Villages",
        "Village registry and ward relationships.",
        ["Village", "Ward", "Streets", "Usage", "Status"],
        { primaryAction: "Add village" },
      ),
      feature(
        "streets",
        "Streets",
        "Street registry and local relationships.",
        ["Street", "Village", "Ward", "Usage", "Status"],
        { primaryAction: "Add street" },
      ),
    ],
  },
  {
    slug: "security",
    label: "Security",
    description: "Security, migrations, upgrades and platform controls.",
    features: [
      feature(
        "platform-permissions",
        "Platform Permissions",
        "Review and manage platform access for user accounts.",
        ["Account", "Role", "Permissions"],
        { primaryAction: "Manage permissions" },
      ),
      feature(
        "otp-verifications",
        "OTP Verifications",
        "Authentication verification attempts and delivery state.",
        ["Recipient", "Channel", "Purpose", "Expires", "Status"],
        { primaryAction: "Create OTP" },
      ),
      feature(
        "ledger-migration",
        "Ledger Migration",
        "Legacy event-family migration and reconciliation controls.",
        ["Family", "Authority", "Records", "Reconciled", "State"],
        { status: "migration", primaryAction: "Run reconciliation" },
      ),
      feature(
        "upgrade-runs",
        "Upgrade Runs",
        "Platform upgrade execution, progress and results.",
        ["Upgrade", "Version", "Started", "Duration", "Status"],
        { status: "new", primaryAction: "Check upgrades" },
      ),
    ],
  },
];

export const accountGroup: FeatureGroup = {
  slug: "account",
  label: "Account",
  description:
    "Personal details, access protection and communication preferences.",
  features: [
    feature(
      "profile",
      "My Profile",
      "Personal identity, contact details and administrator profile.",
      ["Field", "Current value", "Visibility", "Updated", "Status"],
      { primaryAction: "Edit profile" },
    ),
    feature(
      "security",
      "Account & Security",
      "Password, active sessions, sign-in protection and recovery options.",
      ["Security control", "Method", "Last checked", "Device", "Status"],
      { primaryAction: "Review security" },
    ),
    feature(
      "notifications",
      "Notifications",
      "Email, SMS and in-app notification preferences.",
      ["Notification", "Channel", "Frequency", "Scope", "Status"],
      { primaryAction: "Save preferences" },
    ),
  ],
};

export const allFeatures = [...featureGroups, accountGroup].flatMap((group) =>
  group.features.map((item) => ({
    ...item,
    groupSlug: group.slug,
    groupLabel: group.label,
  })),
);

export function getFeature(groupSlug: string, featureSlug: string) {
  if (groupSlug === "system") groupSlug = "security";
  const group = [...featureGroups, accountGroup].find(
    (item) => item.slug === groupSlug,
  );
  const featureItem = group?.features.find((item) => item.slug === featureSlug);
  return group && featureItem ? { group, feature: featureItem } : null;
}
