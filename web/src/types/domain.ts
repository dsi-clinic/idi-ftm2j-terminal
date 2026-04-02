// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

type Source = {
  name: string;
  url: URL;
  lastAccessed: Date;
};

/** Every substantive entity must cite one or more sources. */
type CitedEntity = {
  sources: Source[];
};

// ---------------------------------------------------------------------------
// Temporal patterns
// ---------------------------------------------------------------------------

/** An entity that persists over a date range. `to` is null if still current. */
type LonglivedEntity = {
  from: Date;
  to: Date | null;
};

/** An entity that represents a point-in-time snapshot. */
type SnapshotEntity = {
  asOf: Date;
};

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

type SnapshotAmount = CitedEntity &
  SnapshotEntity & {
    value: number;
  };

// ---------------------------------------------------------------------------
// Identifiers
// ---------------------------------------------------------------------------

/**
 * A lightweight reference to a company by name and permId.
 * permId is null when the company cannot yet be resolved to a known entity.
 */
type CompanyReference = {
  name: string;
  permId: string | null;
};

// ---------------------------------------------------------------------------
// Name
// ---------------------------------------------------------------------------

type NameChangeReason =
  | "Rebrand"
  | "Merger"
  | "Acquisition"
  | "Spinoff"
  | "LegalSettlement";

type Name = CitedEntity & {
  value: string;
  changeReason: NameChangeReason | null;
};

type HistoricName = Name & LonglivedEntity;

// ---------------------------------------------------------------------------
// Leadership
// ---------------------------------------------------------------------------

type Leader = CitedEntity & {
  fullName: string;
  title: string;
};

type HistoricLeader = Leader & LonglivedEntity;

// ---------------------------------------------------------------------------
// Sectors
// ---------------------------------------------------------------------------

type Sector = CitedEntity & {
  name: string;
  code: string;
  system: "SIC" | "NAICS";
};

type HistoricSector = Sector & LonglivedEntity;

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

type Address = CitedEntity & {
  street1: string;
  street2: string | null;
  city: string;
  stateOrCountry: string;
  zipCode: string | null;
  isForeignLocation: boolean;
  foreignStateTerritory: string | null;
  country: string;
  countryCode: string;
};

type HistoricAddress = Address & LonglivedEntity;

// ---------------------------------------------------------------------------
// Corporate structure
// ---------------------------------------------------------------------------

/**
 * A directed parent→child relationship between two companies.
 * Replaces the siblings/subsidiaries arrays on CorporateStructure, making
 * it possible to query all relationships for a company across time without
 * loading every company record.
 */
type CorporateRelationship = CitedEntity &
  LonglivedEntity & {
    parent: CompanyReference;
    child: CompanyReference;
    relationshipType: "Subsidiary" | "Division" | "JointVenture";
    ownershipPercent: number | null;
  };

// ---------------------------------------------------------------------------
// Equity securities
// ---------------------------------------------------------------------------

type HistoricShareholder = CitedEntity &
  SnapshotEntity &
  CompanyReference & {
    sharesOwned: number;
    sharesMarketValue: number;
  };

type HistoricPublicEquityValue = CitedEntity &
  SnapshotEntity & {
    outstandingShares: number;
    shareholders: HistoricShareholder[];
  };

type HistoricPublicEquitySecurity = CitedEntity &
  LonglivedEntity & {
    symbol: string;
    class: string;
    history: HistoricPublicEquityValue[];
  };

// ---------------------------------------------------------------------------
// Debt securities
// ---------------------------------------------------------------------------

type HistoricDebtHolder = CitedEntity &
  SnapshotEntity &
  CompanyReference & {
    debtMarketValue: number;
  };

type HistoricDebtSecurityValue = CitedEntity &
  SnapshotEntity & {
    principalAmount: number;
    debtHolders: HistoricDebtHolder[];
  };

type HistoricDebtSecurity = CitedEntity &
  LonglivedEntity & {
    symbol: string;
    class: string;
    jurisdiction: string | null;
    history: HistoricDebtSecurityValue[];
  };

// ---------------------------------------------------------------------------
// Commercial debt instruments
// ---------------------------------------------------------------------------

type HistoricCommercialDebt = CitedEntity &
  LonglivedEntity & {
    instrumentName: string;
    debtHolder: CompanyReference;
    amount: number;
    interestRate: number;
    maturityDate: Date;
    jurisdiction: string | null;
    type: "Bond" | "Convertible" | "Credit Facility";
  };

// ---------------------------------------------------------------------------
// Flagged projects
// ---------------------------------------------------------------------------

/**
 * A reference to a harmful development project this company is affiliated
 * with. The full project record lives in its own data structure.
 */
type ProjectReference = {
  projectId: string;
  name: string;
  /** The nature of the company's involvement, e.g. "Lead Contractor" */
  role: string;
};

type HistoricProjectAffiliation = CitedEntity &
  LonglivedEntity & {
    project: ProjectReference;
  };

// ---------------------------------------------------------------------------
// Company
// ---------------------------------------------------------------------------

type Company = CitedEntity & {
  // Stable identifiers
  permId: string;
  cik: string | null;
  ein: string | null;
  lei: string | null;

  // Core identity
  name: string;
  aliases: string[];
  description: string;
  foundedOn: Date | null;
  website: URL | null;

  // Current state is always derived from the history arrays below.
  // To get the current CEO, find the HistoricLeader with to === null.

  // History
  historicNames: HistoricName[];
  historicLeadership: HistoricLeader[];
  historicSectors: HistoricSector[];
  historicIncorporationAddresses: HistoricAddress[];
  historicDomicileAddresses: HistoricAddress[];
  historicCorporateRelationships: CorporateRelationship[];
  historicCommercialDebt: HistoricCommercialDebt[];
  historicSecurities: (HistoricPublicEquitySecurity | HistoricDebtSecurity)[];
  historicProjectAffiliations: HistoricProjectAffiliation[];
};
