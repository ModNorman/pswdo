
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

const translations = {
  en: {
    // Public
    submitRequest: "Submit Request",
    checkStatus: "Check Status",
    landingTitle: "Assistance to Individuals in Crisis Situation",
    landingWho: "Who can apply?",
    landingWhat: "What to prepare?",
    landingProcess: "Processing timeline",
    // Staff Nav
    dashboard: "Dashboard",
    reports: "Reports",
    profile: "Profile",
    // Case Officer Tabs
    'New': 'New',
    'Screening': 'Screening',
    'Returned': 'Returned',
    'Approved': 'Approved',
    'Completed': 'Completed',
    // Head Tabs
    'For Approval': 'For Approval',
    'Budget': 'Budget',
    // General
    actions: "Actions",
    beneficiary: "Beneficiary",
    controlNo: "Control #",
    type: "Type",
    municipality: "Municipality",
    requestDate: "Request Date",
    status: "Status",
    amount: "Amount",
    caseDetail: "Case Detail",
    details: "Details",
    documents: "Documents",
    recommendation: "Recommendation",
    notes: "Notes",
    audit: "Audit",
    forwardToHead: "Forward to Head",
    returnToOfficer: "Return to Officer",
    markCompleted: "Mark Completed",
    approve: "Approve",
    return: "Return",
    fundSource: "Funding Source",
    mainBudget: "Main Budget (Appropriation)",
    cashAdvance: "Cash Advance (CA)",
    logout: "Logout",
    selectRole: "Select Your Role",
    caseOfficer: "Case Officer",
    pswdoHead: "PSWDO Head",
    viewDashboard: "View Dashboard",
    recommendedAmount: "Recommended Amount"
  },
  fil: {
    // Public
    submitRequest: "Mag-sumite ng Kahilingan",
    checkStatus: "Suriin ang Katayuan",
    landingTitle: "Tulong sa mga Indibidwal sa Panahon ng Krisis",
    landingWho: "Sino ang maaaring mag-apply?",
    landingWhat: "Ano ang mga ihahanda?",
    landingProcess: "Proseso at haba ng panahon",
    // Staff Nav
    dashboard: "Dashboard",
    reports: "Mga Ulat",
    profile: "Profile",
    // Case Officer Tabs
    'New': 'Bago',
    'Screening': 'Sinusuri',
    'Returned': 'Ibinalik',
    'Approved': 'Aprubado',
    'Completed': 'KUMPLETO',
    // Head Tabs
    'For Approval': 'Para Aprobalan',
    'Budget': 'Badyet',
    // General
    actions: "Mga Aksyon",
    beneficiary: "Benepisyaryo",
    controlNo: "Control #",
    type: "Uri",
    municipality: "Munisipalidad",
    requestDate: "Petsa ng Kahilingan",
    status: "Katayuan",
    amount: "Halaga",
    caseDetail: "Detalye ng Kaso",
    details: "Mga Detalye",
    documents: "Mga Dokumento",
    recommendation: "Rekomendasyon",
    notes: "Mga Tala",
    audit: "Audit",
    forwardToHead: "Ipasa sa Head",
    returnToOfficer: "Ibalik sa Officer",
    markCompleted: "Markahan bilang Kumpleto",
    approve: "Aprubahan",
    return: "Ibalik",
    fundSource: "Source ng Pondo",
    mainBudget: "Pangunahing Badyet (Appropriation)",
    cashAdvance: "Cash Advance (CA)",
    logout: "Mag-logout",
    selectRole: "Piliin ang Iyong Tungkulin",
    caseOfficer: "Case Officer",
    pswdoHead: "PSWDO Head",
    viewDashboard: "Tingnan ang Dashboard",
    recommendedAmount: "Inirekumendang Halaga"
  },
};

type Language = 'en' | 'fil';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const detectLanguage = (): Language => {
    const storedLang = localStorage.getItem('aics-lang') as Language;
    if (storedLang && ['en', 'fil'].includes(storedLang)) {
      return storedLang;
    }
    return (navigator.language.startsWith('tl') || navigator.language === 'fil') ? 'fil' : 'en';
  };

  const [language, setLanguage] = useState<Language>(detectLanguage);

  useEffect(() => {
    localStorage.setItem('aics-lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key];
  };

  return React.createElement(I18nContext.Provider, { value: { language, setLanguage, t } }, children);
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
