import { AppState, Beneficiary, Case, CaseStatus, AssistanceType, FundSource, LedgerEntryType, Modality, Role, LedgerEntry, Document, Profile } from './types';
import {faker} from '@faker-js/faker';
import { DOC_CHECKLIST } from './constants';

// Using faker to generate more realistic mock data
faker.seed(123); // for consistent results

const MUNICIPALITIES_ALBAY = ['Bacacay', 'Camalig', 'Daraga', 'Guinobatan', 'Jovellar', 'Legazpi', 'Libon', 'Ligao', 'Malilipot', 'Malinao', 'Manito', 'Oas', 'Pio Duran', 'Polangui', 'Rapu-Rapu', 'Santo Domingo', 'Tabaco', 'Tiwi'];
const FILIPINO_FEMALE_FIRST_NAMES = ['Althea', 'Andrea', 'Angel', 'Bea', 'Cheska', 'Cristina', 'Daniela', 'Erica', 'Hannah', 'Isabella', 'Jasmine', 'Jenny', 'Katrina', 'Kimberly', 'Lian', 'Maria', 'Mica', 'Nadine', 'Patricia', 'Samantha'];
const FILIPINO_MALE_FIRST_NAMES = ['Adrian', 'Angelo', 'Carl', 'Christian', 'Daniel', 'David', 'Gabriel', 'Ivan', 'James', 'Javier', 'Joaquin', 'John', 'Joshua', 'Kevin', 'Lance', 'Mark', 'Miguel', 'Nathan', 'Paolo', 'Vincent'];
const FILIPINO_LAST_NAMES = ['dela Cruz', 'Garcia', 'Reyes', 'Ramos', 'Mendoza', 'Santos', 'Flores', 'Gonzales', 'Castillo', 'Villanueva', 'Fernandez', 'Cruz', 'Aquino', 'de Leon', 'Pascual', 'Soriano', 'Torres', 'Diaz', 'Gomez', 'Salazar'];
const CASE_OFFICERS = ['Lourdes Panganiban', 'Roberto Valencia', 'Celia Mercado', 'Arturo Bautista'];

const createFilipinoName = (sex: 'Male' | 'Female') => {
    const firstName = sex === 'Male' ? faker.helpers.arrayElement(FILIPINO_MALE_FIRST_NAMES) : faker.helpers.arrayElement(FILIPINO_FEMALE_FIRST_NAMES);
    const lastName = faker.helpers.arrayElement(FILIPINO_LAST_NAMES);
    return `${firstName} ${lastName}`;
}

const createBeneficiaries = (count: number): Beneficiary[] => {
  return Array.from({ length: count }, (_, i) => {
    const sex = faker.helpers.arrayElement(['Male', 'Female'] as const);
    return {
        id: `B${1001 + i}`,
        name: createFilipinoName(sex),
        sex: sex,
        birthdate: faker.date.past({ years: 50, refDate: '2000-01-01' }).toISOString().split('T')[0],
        civilStatus: faker.helpers.arrayElement(['Single', 'Married', 'Widowed', 'Separated']),
        placeOfBirth: faker.helpers.arrayElement(MUNICIPALITIES_ALBAY),
        education: faker.helpers.arrayElement(['High School', 'College Graduate', 'Vocational', 'Elementary']),
        philId: faker.string.numeric(16),
        contact: `09${faker.string.numeric(9)}`,
        email: faker.internet.email(),
        preferredContact: faker.helpers.arrayElement(['Phone', 'Email']),
        address: {
          municipality: faker.helpers.arrayElement(MUNICIPALITIES_ALBAY),
          barangay: `Brgy. ${faker.lorem.word()}`,
          street: faker.location.streetAddress(false),
        },
    }
  });
};

const beneficiaries = createBeneficiaries(30);

const createSequentialHistory = (creationDate: Date, finalStatus: CaseStatus): { history: Case['history'], subReason?: string, fundSource?: FundSource, amount?: number } => {
    const history: Case['history'] = [{ status: CaseStatus.New, date: creationDate.toISOString(), actor: Role.Public, notes: 'Submitted intake form.' }];
    let currentDate = new Date(creationDate);
    let subReason: string | undefined;
    let fundSource: FundSource | undefined;
    let amount: number | undefined;

    const addHistory = (status: CaseStatus, actor: Role, days: number, notes: string, subReason?: string) => {
        currentDate.setDate(currentDate.getDate() + faker.number.int({ min: 1, max: days }));
        history.push({ status, date: currentDate.toISOString(), actor, notes, subReason });
    };

    if (finalStatus === CaseStatus.New) return { history };

    addHistory(CaseStatus.Screening, Role.CaseOfficer, 3, "Initial screening; verifying documents.");

    if (finalStatus === CaseStatus.Screening) return { history };

    if (finalStatus === CaseStatus.Returned) {
        subReason = faker.helpers.arrayElement(['Incomplete documents', 'Exceeds cap', 'Cooldown period not met', 'Requires Social Case Study Report (SCSR) due to high amount requested.']);
        addHistory(CaseStatus.ForApproval, Role.CaseOfficer, 2, 'Forwarded for approval.');
        addHistory(CaseStatus.Returned, Role.Head, 2, `Returned with reason: ${subReason}.`, subReason);
        return { history, subReason };
    }

    amount = faker.number.int({ min: 1000, max: 15000 });
    addHistory(CaseStatus.ForApproval, Role.CaseOfficer, 2, `Recommendation set to P${amount}. Forwarded for approval.`);
    if (finalStatus === CaseStatus.ForApproval) return { history, amount };

    fundSource = faker.helpers.arrayElement([FundSource.Main, FundSource.CA]);
    addHistory(CaseStatus.Approved, Role.Head, 3, `Approved. Fund source: ${fundSource}`);
    if (finalStatus === CaseStatus.Approved) return { history, fundSource, amount };
    
    addHistory(CaseStatus.Completed, Role.CaseOfficer, 4, 'Assistance released and confirmed by beneficiary. Case marked as completed.');
    return { history, fundSource, amount };
}


const createCasesAndDocuments = (beneficiaries: Beneficiary[]): { cases: Case[], documents: Document[] } => {
  const statuses: CaseStatus[] = [CaseStatus.New, CaseStatus.Screening, CaseStatus.Returned, CaseStatus.ForApproval, CaseStatus.Approved, CaseStatus.Completed];
  const cases: Case[] = [];
  const documents: Document[] = [];
  
  for (let i = 0; i < 30; i++) {
    const beneficiary = beneficiaries[i % beneficiaries.length];
    const status = faker.helpers.arrayElement(statuses);
    const assistanceType = faker.helpers.arrayElement(Object.values(AssistanceType));
    const createdAt = faker.date.recent({ days: 60 });
    
    const { history, subReason, fundSource, amount } = createSequentialHistory(createdAt, status);
    const finalHistory = history[history.length-1];

    let caseData: Case = {
      id: `C${2001 + i}`,
      controlNo: `AICS-${createdAt.getFullYear()}-${String(2001 + i).padStart(5, '0')}`,
      beneficiaryId: beneficiary.id,
      assistanceType: assistanceType,
      officerName: faker.helpers.arrayElement(CASE_OFFICERS),
      status: finalHistory?.status || status,
      createdAt: createdAt.toISOString(),
      history: history,
      flags: {
        financeCleared: status === CaseStatus.Approved || status === CaseStatus.Completed,
        requiresRep: false,
        confidentialDocsExist: false,
      },
      modality: faker.helpers.arrayElement(Object.values(Modality)),
      internalNotes: [],
      subReason: subReason,
      fundSource: fundSource,
      amount: amount,
      amountInWords: amount ? numberToWords(amount) : undefined,
    };

    if (status !== CaseStatus.New) {
        const requiredDocs = DOC_CHECKLIST[assistanceType];
        requiredDocs.forEach((docInfo) => {
            if (docInfo.required || faker.datatype.boolean(0.7)) {
                // Documents are considered verified if case has moved past screening
                const isVerified = finalHistory.status !== CaseStatus.Screening;
                documents.push({
                    id: `D${6001 + documents.length}`,
                    caseId: caseData.id,
                    docType: docInfo.name,
                    filename: `${docInfo.name.replace(/\s+/g, '_')}.pdf`,
                    issuedDate: faker.date.past({years: 1}).toISOString().split('T')[0],
                    isCTC: faker.datatype.boolean(),
                    verifiedBy: isVerified ? faker.helpers.arrayElement(CASE_OFFICERS) : undefined,
                    verifiedAt: isVerified ? faker.date.recent({days: 10, refDate: caseData.createdAt}).toISOString() : undefined,
                    confidential: false,
                    notes: faker.datatype.boolean(0.2) ? faker.lorem.sentence() : undefined,
                });
            }
        });
        if(caseData.history[1]) {
            caseData.internalNotes?.push({author: 'System', note: "Case automatically moved to Screening.", date: caseData.history[1].date});
        }
    }

    if(caseData.subReason){
        caseData.internalNotes?.push({author: 'Maria Reyes', note: `Returned by Head. Reason: ${caseData.subReason}. Please address issue and resubmit.`, date: finalHistory!.date});
    }

    if(caseData.amount && (status === CaseStatus.ForApproval || status === CaseStatus.Approved || status === CaseStatus.Completed)) {
       const forApprovalEntry = caseData.history.find(h => h.status === CaseStatus.ForApproval);
       if(forApprovalEntry) {
        caseData.internalNotes?.push({author: caseData.officerName!, note: `Recommendation set to P${caseData.amount}. Forwarding to Head for approval.`, date: forApprovalEntry.date});
       }
    }
    
    cases.push(caseData);
  }
  
  // Add specific cases for demo plan
  const highAmountCaseIndex = cases.findIndex(c => c.assistanceType === AssistanceType.Medical && c.status === CaseStatus.ForApproval);
  if(highAmountCaseIndex > -1) {
    const highAmount = 55000;
    cases[highAmountCaseIndex].amount = highAmount;
    cases[highAmountCaseIndex].amountInWords = numberToWords(highAmount);
    const historyEntry = cases[highAmountCaseIndex].history.find(h => h.status === CaseStatus.ForApproval);
    if(historyEntry) historyEntry.notes = `Recommendation set to P${highAmount}. Forwarded for approval. High amount requires SCSR.`;

  }

  // Ensure there's enough data for "Top Return Reasons" chart
  cases.filter(c => c.status === CaseStatus.ForApproval).slice(0, 2).forEach(c => {
      c.status = CaseStatus.Returned;
      c.subReason = "Requires Social Case Study Report (SCSR) due to high amount requested.";
      const historyEntry = c.history.find(h => h.status === CaseStatus.Returned);
      if(historyEntry) historyEntry.notes = c.subReason; else c.history.push({ status: CaseStatus.Returned, actor: Role.Head, date: new Date().toISOString(), notes: c.subReason });
  });
   cases.filter(c => c.status === CaseStatus.ForApproval).slice(0, 2).forEach(c => {
      c.status = CaseStatus.Returned;
      c.subReason = "Exceeds cap";
      const historyEntry = c.history.find(h => h.status === CaseStatus.Returned);
      if(historyEntry) historyEntry.notes = c.subReason; else c.history.push({ status: CaseStatus.Returned, actor: Role.Head, date: new Date().toISOString(), notes: c.subReason });
  });

  return { cases, documents };
};

function numberToWords(num: number): string {
    const s = String(num);
    const th = ['', 'thousand', 'million', 'billion', 'trillion'];
    const dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    let s_copy = s.toString();
    s_copy = s_copy.replace(/[\, ]/g, '');
    if (isNaN(parseFloat(s_copy))) return 'not a number';
    var x = s_copy.indexOf('.');
    if (x == -1) x = s_copy.length;
    if (x > 15) return 'too big';
    var n = s_copy.split('');
    var str = '';
    var sk = 0;
    for (var i = 0; i < x; i++) {
        if ((x - i) % 3 == 2) {
            if (n[i] === '1') {
                str += tn[Number(n[i + 1])] + ' ';
                i++;
                sk = 1;
            } else if (n[i] !== '0') {
                str += tw[Number(n[i]) - 2] + ' ';
                sk = 1;
            }
        } else if (n[i] !== '0') {
            str += dg[Number(n[i])] + ' ';
            if ((x - i) % 3 == 0) str += 'hundred ';
            sk = 1;
        }
        if ((x - i) % 3 == 1) {
            if (sk) str += th[(x - i - 1) / 3] + ' ';
            sk = 0;
        }
    }
    let result = str.replace(/\s+/g, ' ').trim();
    if(result === 'zero') return 'Zero pesos only';
    return result.charAt(0).toUpperCase() + result.slice(1) + ' pesos only';
}


const { cases: initialCases, documents: initialDocuments } = createCasesAndDocuments(beneficiaries);

const approvedCases = initialCases.filter(c => c.status === CaseStatus.Approved || c.status === CaseStatus.Completed);

const ledgerPrecommits: LedgerEntry[] = approvedCases
  .map((c, i) => ({
    id: `L${3001 + i}`,
    date: c.history.find(h => h.status === CaseStatus.Approved)?.date || new Date().toISOString(),
    caseId: c.id,
    controlNo: c.controlNo,
    source: c.fundSource!,
    entry: LedgerEntryType.Precommit,
    amount: c.amount!,
    note: `Pre-commit for ${c.controlNo}`,
  }));

const ledgerDisbursements: LedgerEntry[] = initialCases.filter(c => c.status === CaseStatus.Completed)
  .map((c, i) => ({
    id: `L${4001 + i}`,
    date: c.history.find(h => h.status === CaseStatus.Completed)?.date || new Date().toISOString(),
    caseId: c.id,
    controlNo: c.controlNo,
    source: c.fundSource!,
    entry: LedgerEntryType.Disburse,
    amount: c.amount!,
    note: `Disbursement for ${c.controlNo}`,
  }));

const caPrecommitTotal = ledgerPrecommits.filter(l => l.source === FundSource.CA).reduce((sum, l) => sum + l.amount, 0);
const caCeiling = 500000;
const thresholdPercent = 0.20;
let replenishEntry: LedgerEntry[] = [];
if ((caCeiling - caPrecommitTotal) < (caCeiling * thresholdPercent)) {
  const replenishAmount = caCeiling * 0.5;
  replenishEntry.push({
    id: 'L9001',
    date: new Date().toISOString(),
    caseId: null,
    controlNo: 'N/A',
    source: FundSource.CA,
    entry: LedgerEntryType.Replenish,
    amount: replenishAmount,
    note: `Auto-replenishment to bring balance above threshold.`,
  });
}

const calculateBudget = (ledger: LedgerEntry[], source: FundSource) => {
    const precommitted = ledger.filter(l => l.source === source && l.entry === LedgerEntryType.Precommit).reduce((sum, l) => sum + l.amount, 0);
    const disbursed = ledger.filter(l => l.source === source && l.entry === LedgerEntryType.Disburse).reduce((sum, l) => sum + l.amount, 0);
    return { precommitted, disbursed };
}

const initialLedger = [...ledgerPrecommits, ...ledgerDisbursements, ...replenishEntry].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
const {precommitted: mainPre, disbursed: mainDis} = calculateBudget(initialLedger, FundSource.Main);
const {precommitted: caPre, disbursed: caDis} = calculateBudget(initialLedger, FundSource.CA);
const caReplenished = initialLedger.filter(l => l.source === FundSource.CA && l.entry === LedgerEntryType.Replenish).reduce((sum, l) => sum + l.amount, 0);


export const initialData: AppState = {
  beneficiaries,
  cases: initialCases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  documents: initialDocuments,
  finances: [],
  ledger: initialLedger,
  mainBudget: {
    allocated: 2000000,
    precommitted: mainPre,
    disbursed: mainDis
  },
  cashAdvance: {
    name: "Regular Cash Advance",
    ceiling: caCeiling,
    currentBalance: caCeiling - caPre - caDis + caReplenished,
    thresholdPercent: thresholdPercent,
    replenishTo: caCeiling * 0.8, // Replenish up to 80%
    precommitted: caPre,
    disbursed: caDis,
  },
  profiles: {
    [Role.CaseOfficer]: {
        name: 'Paolo Soriano',
        role: Role.CaseOfficer,
        email: 'p.soriano@pswdo.albay.gov.ph',
        phone: '09171234567',
        lastLogin: faker.date.recent({days: 1}).toLocaleString()
    },
    [Role.Head]: {
        name: 'Isabella Reyes',
        role: Role.Head,
        email: 'i.reyes@pswdo.albay.gov.ph',
        phone: '09189876543',
        lastLogin: faker.date.recent({days: 1}).toLocaleString()
    }
  }
};