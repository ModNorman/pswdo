
import { CaseStatus, Role, AssistanceType } from './types';

export const CASE_OFFICER_TABS: CaseStatus[] = [
  CaseStatus.New,
  CaseStatus.Screening,
  CaseStatus.Returned,
  CaseStatus.Approved,
  CaseStatus.Completed,
];

export const HEAD_TABS = ['For Approval', 'Returned', 'Approved', 'Budget'];
export const HEAD_CASE_TABS: CaseStatus[] = [CaseStatus.ForApproval, CaseStatus.Returned, CaseStatus.Approved];


export const STATUS_COLORS: { [key in CaseStatus]?: string } = {
  [CaseStatus.New]: 'bg-blue-100 text-blue-800',
  [CaseStatus.Screening]: 'bg-cyan-100 text-cyan-800',
  [CaseStatus.Returned]: 'bg-yellow-100 text-yellow-800',
  [CaseStatus.ForApproval]: 'bg-purple-100 text-purple-800',
  [CaseStatus.Approved]: 'bg-green-100 text-green-800',
  [CaseStatus.Completed]: 'bg-gray-100 text-gray-800',
};

export const ROLE_TABS: { [key in Role]?: (string | CaseStatus)[] } = {
    [Role.CaseOfficer]: CASE_OFFICER_TABS,
    [Role.Head]: HEAD_TABS,
}

export const DOC_CHECKLIST: Record<AssistanceType, { name: string; required: boolean; tooltip?: string }[]> = {
    [AssistanceType.Medical]: [
        { name: "Valid ID", required: true },
        { name: "Barangay Indigency", required: true },
        { name: "Medical Abstract (≤3 months)", required: true },
        { name: "SOA/Certificate of Balance", required: true },
        { name: "Prescription/Quotation", required: false },
        { name: "Provider Contact", required: false },
    ],
    [AssistanceType.Burial]: [
        { name: "Valid ID", required: true },
        { name: "Death Certificate", required: true },
        { name: "Funeral Contract/Quotation", required: true },
        { name: "Cause of Death", required: false },
        { name: "Transfer Permit", required: false },
    ],
    [AssistanceType.Education]: [
        { name: "Valid ID", required: true },
        { name: "COR/Assessment", required: true },
        { name: "Statement of Account/Fees", required: true },
        { name: "School ID", required: false },
    ],
    [AssistanceType.Transport]: [{ name: "Valid ID", required: true }, { name: "Travel Itinerary/Ticket", required: true }],
    [AssistanceType.Food]: [{ name: "Valid ID", required: true }, { name: "Barangay Indigency", required: true }],
    [AssistanceType.Financial]: [{ name: "Valid ID", required: true }, { name: "Barangay Indigency", required: true }],
};

export const LOGOS = {
  national: 'https://sofia.static.domains/Logos/BBMlogo.png',
  province: 'https://sofia.static.domains/Logos/ALBAYgov.png',
  pswdo: 'https://sofia.static.domains/Logos/pswdologo.jpg',
};
