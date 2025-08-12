
export enum Role {
  CaseOfficer = 'Case Officer',
  Head = 'PSWDO Head',
  Public = 'Public'
}

export enum CaseStatus {
  New = 'New',
  Screening = 'Screening',
  Returned = 'Returned',
  ForApproval = 'For Approval',
  Approved = 'Approved',
  Completed = 'Completed',
  Draft = 'Draft', // For intake
}

export enum AssistanceType {
  Medical = 'Medical',
  Burial = 'Burial',
  Education = 'Education',
  Transport = 'Transport',
  Food = 'Food',
  Financial = 'Financial'
}

export enum Modality {
  COE = 'COE',
  GL = 'GL',
  Voucher = 'Voucher',
  Cash = 'Cash'
}

export enum FundSource {
  Main = 'MAIN',
  CA = 'CA'
}

export interface Beneficiary {
  id: string;
  name: string;
  sex: 'Male' | 'Female';
  birthdate: string;
  civilStatus: string;
  placeOfBirth: string;
  education: string;
  philId: string;
  contact: string;
  email?: string;
  preferredContact: 'Phone' | 'Email';
  address: {
    municipality: string;
    barangay: string;
    street: string;
  };
}

export interface Case {
  id: string;
  controlNo: string;
  beneficiaryId: string;
  assistanceType: AssistanceType;
  modality?: Modality;
  amount?: number;
  amountInWords?: string;
  basisLink?: string;
  status: CaseStatus;
  subReason?: string; // Reason for return
  fundSource?: FundSource | null;
  officerName?: string;
  flags: {
    financeCleared: boolean;
    requiresRep: boolean;
    confidentialDocsExist: boolean;
  };
  referringParty?: string;
  cluster?: string;
  createdAt: string;
  history: { status: CaseStatus, date: string, actor: Role, notes?: string, subReason?: string }[];
  internalNotes?: { author: string, note: string, date: string }[];
}

export interface Document {
  id: string;
  caseId: string;
  docType: string;
  filename: string;
  issuedDate?: string;
  isCTC: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  confidential: boolean;
  notes?: string;
}

export interface Finance {
  caseId: string;
  orsNo?: string;
  dvNo?: string;
  fundSource?: FundSource;
  precommitAt?: string;
  clearedAt?: string;
}

export enum LedgerEntryType {
  Precommit = 'precommit',
  Disburse = 'disburse',
  Replenish = 'replenish'
}

export interface LedgerEntry {
  id: string;
  date: string;
  caseId?: string | null;
  source: FundSource;
  entry: LedgerEntryType;
  amount: number;
  note?: string;
  controlNo?: string; // Added for display in ledger
}

export interface Budget {
  allocated: number;
  precommitted: number;
  disbursed: number;
}

export interface CashAdvance {
  name: string;
  ceiling: number;
  currentBalance: number;
  thresholdPercent: number;
  replenishTo: number;
  precommitted: number;
  disbursed: number;
}

export interface Profile {
    name: string;
    role: Role;
    email: string;
    phone: string;
    lastLogin: string;
}

export interface AppState {
  beneficiaries: Beneficiary[];
  cases: Case[];
  documents: Document[];
  finances: Finance[];
  ledger: LedgerEntry[];
  mainBudget: Budget;
  cashAdvance: CashAdvance;
  profiles: {
      [Role.CaseOfficer]: Profile;
      [Role.Head]: Profile;
  }
}