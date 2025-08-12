

import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import { useI18n } from '../i18n';
import { initialData } from '../data';
import { AppState, Beneficiary, Case, CaseStatus, FundSource, Role, Document as DocType, LedgerEntryType, LedgerEntry, AssistanceType, Profile, Modality } from '../types';
import { Button, Card, LanguageToggle, Modal, StatusBadge, Tabs, KpiCard, InputField, SelectField, TextareaField } from '../components/ui';
import { HEAD_CASE_TABS, HEAD_TABS, ROLE_TABS, STATUS_COLORS, DOC_CHECKLIST, LOGOS } from '../constants';
import { DashboardIcon, ProfileIcon, ReportsIcon, CheckCircleIcon, BuildingOfficeIcon, MoneyIcon, TrendingUpIcon } from '../components/icons';
import { BarChart, PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// --- LOGIN & NAVIGATION ---

const LoginScreen: React.FC<{ onLogin: (role: Role) => void }> = ({ onLogin }) => {
  const { t } = useI18n();
  return (
    <div className="bg-brand-gray-100 min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-sm w-full text-center p-8">
        <div className="flex justify-center items-center space-x-4 mb-6">
            <img src={LOGOS.national} alt="National Government Logo" className="h-12" />
            <img src={LOGOS.province} alt="Province of Albay Logo" className="h-12" />
            <img src={LOGOS.pswdo} alt="PSWDO Logo" className="h-12" />
        </div>
        <h1 className="text-2xl font-bold text-brand-gray-800 mb-2">{t('selectRole')}</h1>
        <p className="text-brand-gray-500 mb-6">Select a role to access the staff dashboard.</p>
        <div className="space-y-4">
          <Button onClick={() => onLogin(Role.CaseOfficer)} className="w-full" size="lg">{t('caseOfficer')}</Button>
          <Button onClick={() => onLogin(Role.Head)} className="w-full" size="lg">{t('pswdoHead')}</Button>
        </div>
      </Card>
    </div>
  );
};

const StaffHeader: React.FC<{
    role: Role;
    onLogout: () => void;
    activeView: string;
    setActiveView: (view: string) => void;
}> = ({ role, onLogout, activeView, setActiveView }) => {
    const { t, language, setLanguage } = useI18n();
    const navItems = [
        { id: 'dashboard', label: t('dashboard'), icon: <DashboardIcon />, roles: [Role.CaseOfficer, Role.Head] },
        { id: 'reports', label: t('reports'), icon: <ReportsIcon />, roles: [Role.Head] },
        { id: 'profile', label: t('profile'), icon: <ProfileIcon />, roles: [Role.CaseOfficer, Role.Head] },
    ];
    const visibleItems = navItems.filter(item => item.roles.includes(role));

    return (
        <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Branding */}
                <div className="flex items-center space-x-3">
                    <img src={LOGOS.national} alt="National Government Logo" className="h-10" />
                    <img src={LOGOS.province} alt="Province of Albay Logo" className="h-10" />
                    <img src={LOGOS.pswdo} alt="PSWDO Logo" className="h-10" />
                    <div className="hidden sm:block">
                        <h1 className="text-xl font-bold text-brand-blue">AICS Dashboard</h1>
                        <p className="text-sm text-brand-gray-500">{role}</p>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-2">
                    {visibleItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`flex items-center p-2 rounded-md font-semibold transition-colors duration-200 ${
                                activeView === item.id
                                    ? 'bg-brand-blue-light text-brand-blue'
                                    : 'text-brand-gray-500 hover:bg-brand-gray-100 hover:text-brand-gray-800'
                            }`}
                            aria-current={activeView === item.id ? 'page' : undefined}
                        >
                            {React.cloneElement(item.icon, { className: 'h-5 w-5 mr-2' })}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                
                <div className="flex items-center space-x-4">
                    <LanguageToggle language={language} setLanguage={setLanguage} />
                    <Button onClick={onLogout} variant="secondary" size="sm">{t('logout')}</Button>
                </div>
            </div>
        </header>
    );
};


const BottomNav: React.FC<{ activeView: string, setActiveView: (view: string) => void, role: Role }> = ({ activeView, setActiveView, role }) => {
    const {t} = useI18n();
    const navItems = [
        { id: 'dashboard', label: t('dashboard'), icon: <DashboardIcon />, roles: [Role.CaseOfficer, Role.Head] },
        { id: 'reports', label: t('reports'), icon: <ReportsIcon />, roles: [Role.Head] },
        { id: 'profile', label: t('profile'), icon: <ProfileIcon />, roles: [Role.CaseOfficer, Role.Head] },
    ];
    
    const visibleItems = navItems.filter(item => item.roles.includes(role));

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around z-30">
            {visibleItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex flex-col items-center justify-center p-2 w-full text-sm ${activeView === item.id ? 'text-brand-blue' : 'text-gray-500'}`}
                >
                    {React.cloneElement(item.icon, { className: 'h-6 w-6 mb-1' })}
                    <span>{t(item.label as any)}</span>
                </button>
            ))}
        </nav>
    );
}

// --- DASHBOARD & CASE VIEWS ---

const CaseCard: React.FC<{ aCase: Case; beneficiary: Beneficiary; onClick: () => void }> = ({ aCase, beneficiary, onClick }) => {
    const {t} = useI18n();
    return (
        <Card onClick={onClick} className="mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-brand-gray-800">{beneficiary.name}</p>
                    <p className="text-sm text-brand-gray-500">{t('controlNo')}: {aCase.controlNo}</p>
                </div>
                <StatusBadge status={aCase.status} />
            </div>
             {aCase.status === CaseStatus.Returned && aCase.subReason && (
                <div className="mt-2 p-2 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 text-sm">
                    <strong>Reason for Return:</strong> {aCase.subReason}
                </div>
            )}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                    <p className="text-brand-gray-500">{t('type')}</p>
                    <p className="font-medium text-brand-gray-700">{aCase.assistanceType}</p>
                </div>
                <div>
                    <p className="text-brand-gray-500">{t('municipality')}</p>
                    <p className="font-medium text-brand-gray-700">{beneficiary.address.municipality}</p>
                </div>
                <div>
                    <p className="text-brand-gray-500">{t('requestDate')}</p>
                    <p className="font-medium text-brand-gray-700">{new Date(aCase.createdAt).toLocaleDateString()}</p>
                </div>
                 <div>
                    <p className="text-brand-gray-500">{aCase.status === CaseStatus.ForApproval ? t('recommendedAmount') : t('amount')}</p>
                    <p className="font-medium text-brand-gray-700">{aCase.amount ? `₱${aCase.amount.toLocaleString()}` : 'N/A'}</p>
                </div>
            </div>
        </Card>
    );
};

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';

const DashboardView: React.FC<{ role: Role, data: AppState, onCaseSelect: (c: Case) => void }> = ({ role, data, onCaseSelect }) => {
    const tabs = useMemo(() => ROLE_TABS[role] || [], [role]);
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [sortBy, setSortBy] = useState<SortOption>('date-desc');
    const [searchTerm, setSearchTerm] = useState('');

    const caseCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const tab of tabs) {
            if (tab === 'Budget') continue;
            counts[tab] = data.cases.filter(c => c.status === tab).length;
        }
        return counts;
    }, [data.cases, tabs]);

    const sortedCases = useMemo(() => {
        if (activeTab === 'Budget') return [];
        
        const statusToFilter = activeTab as CaseStatus;
        let filtered = data.cases.filter(c => c.status === statusToFilter);

        if (searchTerm) {
            filtered = filtered.filter(c => {
                const beneficiary = data.beneficiaries.find(b => b.id === c.beneficiaryId);
                const search = searchTerm.toLowerCase();
                return beneficiary?.name.toLowerCase().includes(search) || c.controlNo.toLowerCase().includes(search);
            });
        }

        return filtered.sort((a, b) => {
            const benA = data.beneficiaries.find(ben => ben.id === a.beneficiaryId);
            const benB = data.beneficiaries.find(ben => ben.id === b.beneficiaryId);

            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'date-asc':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'name-asc':
                    return benA?.name.localeCompare(benB?.name || '') || 0;
                case 'name-desc':
                    return benB?.name.localeCompare(benA?.name || '') || 0;
                default:
                    return 0;
            }
        });
    }, [activeTab, sortBy, data.cases, data.beneficiaries, searchTerm]);
    
    return (
        <div>
            <div className="p-4 sticky top-[73px] bg-brand-gray-50 z-20">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                                        <div className="w-full max-w-full min-w-0 overflow-x-hidden">
                                            <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} counts={caseCounts as any} />
                                        </div>
                    {activeTab !== 'Budget' && (
                        <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                             <InputField 
                                label=""
                                id="search-cases"
                                placeholder="Search Name/Control..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="text-sm"
                            />
                            <SelectField 
                                label=""
                                id="sort-cases"
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="text-sm"
                            >
                                <option value="date-desc">Newest</option>
                                <option value="date-asc">Oldest</option>
                                <option value="name-asc">Name A-Z</option>
                                <option value="name-desc">Name Z-A</option>
                            </SelectField>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4">
                {activeTab === 'Budget' && role === Role.Head ? (
                    <BudgetView data={data} />
                ) : (
                    sortedCases.length > 0 ? (
                        sortedCases.map(c => {
                            const beneficiary = data.beneficiaries.find(b => b.id === c.beneficiaryId);
                            if (!beneficiary) return null;
                            return <CaseCard key={c.id} aCase={c} beneficiary={beneficiary} onClick={() => onCaseSelect(c)} />;
                        })
                    ) : (
                        <Card className="text-center py-12">
                            <p className="text-brand-gray-500">No cases found.</p>
                        </Card>
                    )
                )}
            </div>
        </div>
    );
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => {
    const {t} = useI18n();
    return (
        <div className={className}>
            <p className="text-sm text-brand-gray-500">{t(label as any) || label}</p>
            <p className="font-medium text-brand-gray-800">{value || 'N/A'}</p>
        </div>
    )
};

const CaseDetailView: React.FC<{ aCase: Case; data: AppState, role: Role, onClose: () => void }> = ({ aCase, data, role, onClose }) => {
    const detailTabs = ['Details', 'Documents', 'Recommendation', 'Notes', 'Audit'];
    const [activeDetailTab, setActiveDetailTab] = useState(detailTabs[0]);
    const {t} = useI18n();

    // State for interactive elements during screening
    const [editableRecommendation, setEditableRecommendation] = useState({
        amount: aCase.amount || '',
        modality: aCase.modality || Modality.GL,
        basisLink: aCase.basisLink || ''
    });
    const [verifiedDocs, setVerifiedDocs] = useState<Record<string, boolean>>({});

    const beneficiary = data.beneficiaries.find(b => b.id === aCase.beneficiaryId);
    
    if (!beneficiary) return <p>Beneficiary not found.</p>;

    const requiredDocs = DOC_CHECKLIST[aCase.assistanceType as AssistanceType]?.filter(d => d.required) || [];
    const submittedDocs = data.documents.filter(d => d.caseId === aCase.id);
    const allRequiredDocsSubmitted = requiredDocs.every(rd => submittedDocs.some(sd => sd.docType === rd.name));
    const allRequiredDocsVerified = requiredDocs.every(rd => verifiedDocs[rd.name]);
    
    const canForward = role === Role.CaseOfficer && aCase.status === CaseStatus.Screening && allRequiredDocsVerified && !!editableRecommendation.amount;
    const canReturn = role === Role.Head && aCase.status === CaseStatus.ForApproval;
    const canMarkComplete = role === Role.CaseOfficer && aCase.status === CaseStatus.Approved && aCase.flags.financeCleared;
    const canApprove = role === Role.Head && aCase.status === CaseStatus.ForApproval;
    
    const renderContent = () => {
        switch(activeDetailTab) {
            case 'Details':
                return (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                        <DetailItem label="beneficiary" value={beneficiary.name} className="col-span-full" />
                        <DetailItem label="Address" value={`${beneficiary.address.street}, ${beneficiary.address.barangay}, ${beneficiary.address.municipality}`} className="col-span-full"/>
                        <DetailItem label="Sex" value={beneficiary.sex} />
                        <DetailItem label="Birthdate" value={new Date(beneficiary.birthdate).toLocaleDateString()} />
                        <DetailItem label="Civil Status" value={beneficiary.civilStatus} />
                        <DetailItem label="Contact #" value={beneficiary.contact} />
                        <DetailItem label="Email" value={beneficiary.email} />
                    </div>
                );
            case 'Documents':
                const checklist = DOC_CHECKLIST[aCase.assistanceType as AssistanceType] || [];
                return (
                    <ul className="space-y-3">
                        {checklist.map(reqDoc => {
                            const submitted = submittedDocs.find(sd => sd.docType === reqDoc.name);
                            const isVerified = !!submitted?.verifiedAt;
                            const isScreening = role === Role.CaseOfficer && aCase.status === CaseStatus.Screening && submitted;
                            return (
                                <li key={reqDoc.name} className="p-3 bg-gray-50 rounded-lg border flex items-start justify-between">
                                    <div className="flex-grow">
                                        <p className="font-semibold">{reqDoc.name} {reqDoc.required && <span className="text-red-500">*</span>}</p>
                                        {submitted ? (
                                            <div className="text-xs text-gray-500 mt-1">
                                                <span>Filename: {submitted.filename}</span> | <span>Issued: {submitted.issuedDate}</span>
                                                {submitted.notes && <p className="italic">Note: {submitted.notes}</p>}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 mt-1">Missing</p>
                                        )}
                                    </div>
                                    <div className="text-right text-xs ml-4 flex-shrink-0">
                                        {isScreening ? (
                                             <label className="flex items-center font-semibold cursor-pointer">
                                                 <input 
                                                    type="checkbox" 
                                                    className="h-4 w-4 mr-2"
                                                    checked={!!verifiedDocs[reqDoc.name]}
                                                    onChange={(e) => setVerifiedDocs(prev => ({ ...prev, [reqDoc.name]: e.target.checked }))}
                                                />
                                                 Verify
                                             </label>
                                        ) : submitted ? (
                                            isVerified ? 
                                            <div>
                                                <span className="flex items-center text-green-600 font-semibold"><CheckCircleIcon className="w-4 h-4 mr-1"/> Verified</span>
                                                <p className="text-gray-500">by {submitted.verifiedBy}</p>
                                                <p className="text-gray-500">on {new Date(submitted.verifiedAt!).toLocaleDateString()}</p>
                                            </div> : 
                                            <span className="text-yellow-600 font-semibold">Pending Verification</span>
                                        ) : null}
                                    </div>
                                </li>
                            )
                        })}
                         {!allRequiredDocsSubmitted && role === Role.CaseOfficer && aCase.status === CaseStatus.Screening &&
                            <p className="text-sm text-red-600 p-2 bg-red-50 rounded-md">Missing required documents. Cannot forward for approval.</p>}
                    </ul>
                );
            case 'Recommendation':
                 if (role === Role.CaseOfficer && aCase.status === CaseStatus.Screening) {
                     return <div className="space-y-4">
                         <InputField label="Recommended Amount" type="number" value={editableRecommendation.amount} onChange={e => setEditableRecommendation(p => ({...p, amount: e.target.value}))} required/>
                         <SelectField label="Modality" value={editableRecommendation.modality} onChange={e => setEditableRecommendation(p => ({...p, modality: e.target.value as Modality}))}>
                            {Object.values(Modality).map(m => <option key={m}>{m}</option>)}
                         </SelectField>
                         <InputField label="Basis/Quotation Link" value={editableRecommendation.basisLink} onChange={e => setEditableRecommendation(p => ({...p, basisLink: e.target.value}))} />
                     </div>
                 }
                return (
                     <div className="space-y-4">
                        <DetailItem label="assistanceType" value={aCase.assistanceType} />
                        <DetailItem label="recommendedAmount" value={aCase.amount ? `₱${aCase.amount.toLocaleString()}` : 'N/A'} />
                        <DetailItem label="Amount in Words" value={aCase.amountInWords || 'N/A'} />
                        <DetailItem label="Modality" value={aCase.modality} />
                        <DetailItem label="Basis/Quotation Link" value={aCase.basisLink ? <a href={aCase.basisLink} className="text-brand-blue hover:underline">View Link</a> : 'N/A'} />
                        <DetailItem label="fundSource" value={aCase.fundSource ? t(aCase.fundSource === FundSource.Main ? 'mainBudget' : 'cashAdvance') : 'Not yet assigned'} />
                        {aCase.flags.financeCleared && <div className="flex items-center text-green-600"><CheckCircleIcon className="h-5 w-5 mr-2" /> Finance Cleared</div>}
                    </div>
                );
            case 'Notes':
                 return (aCase.internalNotes && aCase.internalNotes.length > 0) ? (
                    <ul className="space-y-4">
                        {aCase.internalNotes.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((note, i) => (
                            <li key={i} className="p-3 bg-yellow-50 border-l-4 border-yellow-300 rounded-r-lg">
                                <p className="text-sm text-gray-800">"{note.note}"</p>
                                <p className="text-xs text-right text-gray-500 mt-2">- {note.author} on {new Date(note.date).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-center text-brand-gray-500 py-8">No internal notes for this case.</p>;
            case 'Audit':
                return (
                    <ul className="space-y-4">
                        {aCase.history.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((h, i) => (
                            <li key={i} className="flex space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-brand-gray-200 flex items-center justify-center">
                                        <ProfileIcon className="h-5 w-5 text-brand-gray-500" />
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-brand-gray-900">{h.actor}</p>
                                    <p className="text-sm text-brand-gray-500">
                                        Changed status to <span className="font-semibold">{t(h.status as any)}</span> on {new Date(h.date).toLocaleString()}
                                    </p>
                                    {h.notes && <p className="text-sm mt-1 italic text-brand-gray-600 bg-brand-gray-100 p-2 rounded-md">"{h.notes}"</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="p-4 bg-brand-gray-50 rounded-lg mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-xl text-brand-gray-800">{beneficiary.name}</p>
                        <p className="text-sm text-brand-gray-500">{t('controlNo')}: {aCase.controlNo}</p>
                    </div>
                    <StatusBadge status={aCase.status} />
                </div>
            </div>

                        <div className="w-full max-w-full min-w-0 overflow-x-hidden">
                            <Tabs tabs={detailTabs.map(t => t)} activeTab={activeDetailTab} onTabClick={(tab) => setActiveDetailTab(tab)} />
                        </div>
            <div className="py-6">
                {renderContent()}
            </div>
            
            <div className="border-t pt-4 mt-4 flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>Close</Button>
                {canForward && <Button disabled={!canForward}>{t('forwardToHead')}</Button>}
                {canApprove && <Button variant="secondary">{t('return')}</Button>}
                {canApprove && <Button>{t('approve')}</Button>}
                {canReturn && <Button>{t('returnToOfficer')}</Button>}
                {canMarkComplete && <Button>{t('markCompleted')}</Button>}
            </div>
        </div>
    );
};

// --- REPORTS VIEW & CHARTS ---

const CHART_COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  gray: '#6B7280',
};

const STATUS_CHART_COLORS: Record<string, string> = {
  [CaseStatus.Screening]: CHART_COLORS.cyan,
  [CaseStatus.Returned]: CHART_COLORS.yellow,
  [CaseStatus.Approved]: CHART_COLORS.green,
  [CaseStatus.Completed]: CHART_COLORS.gray,
};

const PIE_CHART_COLORS = [CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.yellow, CHART_COLORS.red, CHART_COLORS.cyan];

const CustomTooltip = ({ active, payload, label, formatter }: { active?: boolean, payload?: any[], label?: string, formatter?: (value: any) => string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-3 border border-brand-gray-200 rounded-lg shadow-lg text-sm">
        <p className="font-bold text-brand-gray-800 mb-1">{label}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color }} className="font-medium">
            {`${pld.name}: ${formatter ? formatter(pld.value) : pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const NoDataView = () => (
    <div className="flex items-center justify-center h-full w-full text-brand-gray-500">
        No data available
    </div>
);

const ChartCard: React.FC<{title: string, children: ReactNode}> = ({title, children}) => (
    <Card className="w-full max-w-xs mx-auto p-2 sm:p-4">
        <h3 className="font-semibold mb-2 text-brand-gray-800 text-base sm:text-lg">{title}</h3>
        <div className="h-[220px] sm:h-[300px] overflow-x-auto">
            {children}
        </div>
    </Card>
);


const OfficerPerformanceChart: React.FC<{data: any[]}> = ({data}) => (
    <ChartCard title="Case Outcomes by Officer">
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    <Bar dataKey="Screening" stackId="a" fill={STATUS_CHART_COLORS[CaseStatus.Screening]} />
                    <Bar dataKey="Returned" stackId="a" fill={STATUS_CHART_COLORS[CaseStatus.Returned]} />
                    <Bar dataKey="Approved" stackId="a" fill={STATUS_CHART_COLORS[CaseStatus.Approved]} />
                    <Bar dataKey="Completed" stackId="a" fill={STATUS_CHART_COLORS[CaseStatus.Completed]} />
                </BarChart>
            </ResponsiveContainer>
        ) : <NoDataView />}
    </ChartCard>
);

const ReturnReasonsChart: React.FC<{data: any[]}> = ({data}) => (
    <ChartCard title="Top Return Reasons">
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" aspect={1.2}>
                 <BarChart data={data} layout="vertical" margin={{ left: window.innerWidth > 640 ? 120 : 40, right: 10 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                     <XAxis type="number" allowDecimals={false} fontSize={window.innerWidth > 640 ? 12 : 10} />
                     <YAxis type="category" dataKey="name" width={window.innerWidth > 640 ? 120 : 60} tick={{fontSize: window.innerWidth > 640 ? 12 : 10, width: window.innerWidth > 640 ? 120 : 60, textOverflow: 'ellipsis'}}/>
                     <RechartsTooltip content={<CustomTooltip />} />
                     <Bar dataKey="count" name="Count" fill={CHART_COLORS.red} />
                 </BarChart>
            </ResponsiveContainer>
        ) : <NoDataView />}
    </ChartCard>
);

const RADIAN = Math.PI / 180;
const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const sin = Math.sin(-midAngle * RADIAN);
    const cos = Math.cos(-midAngle * RADIAN);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 20) * cos;
    const my = cy + (outerRadius + 20) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={"#9ca3af"} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={"#9ca3af"} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 5} y={ey} textAnchor={textAnchor} fill="#374151" fontSize={12}>
                {`${name} (${(percent * 100).toFixed(0)}%)`}
            </text>
        </g>
    );
};


const ApprovalsByTypeChart: React.FC<{data: any[]}> = ({data}) => (
    <ChartCard title="Approvals by Assistance Type">
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" aspect={1}>
                <PieChart margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
                    <Pie 
                        data={data} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={60} 
                        labelLine={window.innerWidth > 640}
                        label={({ name, percent }) => window.innerWidth > 640 ? `${name} (${(percent * 100).toFixed(0)}%)` : `${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        ) : <NoDataView />}
    </ChartCard>
);

const DisbursementsBySourceChart: React.FC<{data: any[]}> = ({data}) => (
    <ChartCard title="Disbursed by Funding Source">
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(entry) => `${(entry.percent * 100).toFixed(0)}%`}>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={[CHART_COLORS.blue, CHART_COLORS.green][index % 2]} />)}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip formatter={(value: number) => `₱${value.toLocaleString()}`}/>} />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                </PieChart>
            </ResponsiveContainer>
        ) : <NoDataView />}
    </ChartCard>
);


const CasesByMunicipalityChart: React.FC<{data: any[]}> = ({data}) => (
    <ChartCard title="Cases by Municipality">
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" aspect={1.2}>
                <BarChart data={data} layout="vertical" margin={{ left: window.innerWidth > 640 ? 60 : 20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} fontSize={window.innerWidth > 640 ? 12 : 10}/>
                    <YAxis type="category" dataKey="name" width={window.innerWidth > 640 ? 60 : 40} tick={{fontSize: window.innerWidth > 640 ? 10 : 8, width: window.innerWidth > 640 ? 60 : 40, textOverflow: 'ellipsis'}}/>
                    <RechartsTooltip wrapperStyle={{fontSize: window.innerWidth > 640 ? '14px' : '11px'}} content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Cases" fill={CHART_COLORS.blue} />
                </BarChart>
            </ResponsiveContainer>
        ) : <NoDataView />}
    </ChartCard>
);

const ReportsView: React.FC<{ data: AppState }> = ({ data }) => {
    const { t } = useI18n();

    const reportData = useMemo(() => {
        // Processing Time
        const completedCases = data.cases.filter(c => c.status === CaseStatus.Completed);
        let totalProcTime = 0;
        let totalApprovalTime = 0;
        completedCases.forEach(c => {
            const startDate = c.history.find(h => h.status === CaseStatus.New)?.date;
            const approvedDate = c.history.find(h => h.status === CaseStatus.Approved)?.date;
            const completedDate = c.history.find(h => h.status === CaseStatus.Completed)?.date;
            if(startDate && completedDate) {
                totalProcTime += new Date(completedDate).getTime() - new Date(startDate).getTime();
            }
            if(startDate && approvedDate) {
                totalApprovalTime += new Date(approvedDate).getTime() - new Date(startDate).getTime();
            }
        });
        const avgProcDays = completedCases.length > 0 ? (totalProcTime / completedCases.length / (1000 * 3600 * 24)).toFixed(1) : 0;
        const avgApprovalDays = completedCases.length > 0 ? (totalApprovalTime / completedCases.length / (1000 * 3600 * 24)).toFixed(1) : 0;

        // Top Return Reasons
        const returnReasons = data.cases.filter(c => c.status === CaseStatus.Returned && c.subReason).reduce((acc, c) => {
            acc[c.subReason!] = (acc[c.subReason!] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const topReturnReasons = Object.entries(returnReasons).map(([name, count]) => ({name, count})).sort((a,b) => b.count - a.count);

        // Cases by Municipality
        const casesByMuni = data.cases.reduce((acc, c) => {
            const bene = data.beneficiaries.find(b => b.id === c.beneficiaryId);
            if(bene) {
                acc[bene.address.municipality] = (acc[bene.address.municipality] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        const topMunicipalities = Object.entries(casesByMuni).map(([name, count]) => ({name, count})).sort((a,b) => b.count - a.count).slice(0, 10);
        
        const mainRemaining = data.mainBudget.allocated - data.mainBudget.precommitted - data.mainBudget.disbursed;

        // Approvals by Type
        const approvalsByType = data.cases
            .filter(c => c.status === CaseStatus.Approved || c.status === CaseStatus.Completed)
            .reduce((acc, c) => {
                acc[c.assistanceType] = (acc[c.assistanceType] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        const approvalsByTypeData = Object.entries(approvalsByType).map(([name, value]) => ({ name, value }));
        
        // Disbursed by Source
        const disbursedBySource = data.ledger
            .filter(l => l.entry === LedgerEntryType.Disburse)
            .reduce((acc, c) => {
                const sourceName = c.source === FundSource.Main ? 'Main Budget' : 'Cash Advance';
                acc[sourceName] = (acc[sourceName] || 0) + c.amount;
                return acc;
            }, {} as Record<string, number>);
        const disbursedBySourceData = Object.entries(disbursedBySource).map(([name, value]) => ({ name, value }));

        // Outcomes by Officer
        const outcomesByOfficer = data.cases
            .filter(c => c.officerName)
            .reduce((acc, c) => {
                if (!acc[c.officerName!]) {
                    acc[c.officerName!] = { [CaseStatus.Screening]: 0, [CaseStatus.Returned]: 0, [CaseStatus.Approved]: 0, [CaseStatus.Completed]: 0 };
                }
                const status = c.status;
                if(status === CaseStatus.Screening || status === CaseStatus.Returned || status === CaseStatus.Approved || status === CaseStatus.Completed) {
                    acc[c.officerName!][status]++;
                }
                return acc;
            }, {} as Record<string, { [key in CaseStatus]?: number }>);

        const outcomesByOfficerData = Object.entries(outcomesByOfficer).map(([name, values]) => ({ name, ...values }));

        return { avgProcDays, avgApprovalDays, topReturnReasons, topMunicipalities, mainRemaining, approvalsByTypeData, disbursedBySourceData, outcomesByOfficerData };
    }, [data]);

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">{t('reports')}</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Remaining Main Budget" value={`₱${reportData.mainRemaining.toLocaleString()}`} />
                <KpiCard label="Cash Advance Balance" value={`₱${data.cashAdvance.currentBalance.toLocaleString()}`} />
                <KpiCard label="Avg. Approval Time" value={`${reportData.avgApprovalDays} days`} />
                <KpiCard label="Avg. Completion Time" value={`${reportData.avgProcDays} days`} />
            </div>

            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                <OfficerPerformanceChart data={reportData.outcomesByOfficerData} />
                <ReturnReasonsChart data={reportData.topReturnReasons} />
                <ApprovalsByTypeChart data={reportData.approvalsByTypeData} />
                <DisbursementsBySourceChart data={reportData.disbursedBySourceData} />
                <div className="lg:col-span-2">
                    <CasesByMunicipalityChart data={reportData.topMunicipalities} />
                </div>
            </div>

             <Card>
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold mb-2">Export Data</h3>
                    <Button variant="secondary">Export All to CSV</Button>
                </div>
            </Card>
        </div>
    )
}

// --- BUDGET & PROFILE VIEWS ---

const BudgetView: React.FC<{ data: AppState }> = ({ data }) => {
    const { t } = useI18n();
    const { mainBudget, cashAdvance, ledger } = data;
    const [filters, setFilters] = useState({ source: 'all', entry: 'all', controlNo: '' });
    
    const mainRemaining = mainBudget.allocated - mainBudget.precommitted - mainBudget.disbursed;
    const needsReplenishment = cashAdvance.currentBalance < (cashAdvance.ceiling * cashAdvance.thresholdPercent);

    const filteredLedger = useMemo(() => {
        return ledger.filter(item => {
            const sourceMatch = filters.source === 'all' || item.source === filters.source;
            const entryMatch = filters.entry === 'all' || item.entry === filters.entry;
            const controlNoMatch = !filters.controlNo || item.controlNo?.includes(filters.controlNo);
            return sourceMatch && entryMatch && controlNoMatch;
        });
    }, [ledger, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <KpiCard label={t('mainBudget')} value={`₱${mainRemaining.toLocaleString()}`} icon={<BuildingOfficeIcon className="text-brand-blue" />}>
                            <div className="text-sm space-y-1 mt-2">
                                <p>Allocated: ₱{mainBudget.allocated.toLocaleString()}</p>
                                <p>Pre-committed: ₱{mainBudget.precommitted.toLocaleString()}</p>
                                <p>Disbursed: ₱{mainBudget.disbursed.toLocaleString()}</p>
                            </div>
                        </KpiCard>
                        <KpiCard label={t('cashAdvance')} value={`₱${cashAdvance.currentBalance.toLocaleString()}`} icon={<MoneyIcon className="text-brand-green" />}>
                             {needsReplenishment && <p className="text-xs font-bold text-red-500 bg-red-100 px-2 py-1 rounded-full inline-block mt-2">NEEDS REPLENISHMENT</p>}
                             <div className="text-sm space-y-1 mt-2">
                                <p>Ceiling: ₱{cashAdvance.ceiling.toLocaleString()}</p>
                                <p>Pre-committed: ₱{cashAdvance.precommitted.toLocaleString()}</p>
                                <p>Disbursed: ₱{cashAdvance.disbursed.toLocaleString()}</p>
                            </div>
                        </KpiCard>
                    </div>
                    <Card>
                        <h3 className="font-bold text-lg mb-4">Ledger</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            <SelectField label="Source" name="source" value={filters.source} onChange={handleFilterChange}>
                                <option value="all">All Sources</option>
                                <option value={FundSource.Main}>Main</option>
                                <option value={FundSource.CA}>CA</option>
                            </SelectField>
                            <SelectField label="Entry Type" name="entry" value={filters.entry} onChange={handleFilterChange}>
                                <option value="all">All Entries</option>
                                <option value={LedgerEntryType.Precommit}>Pre-commit</option>
                                <option value={LedgerEntryType.Disburse}>Disburse</option>
                                <option value={LedgerEntryType.Replenish}>Replenish</option>
                            </SelectField>
                            <InputField label="Control #" name="controlNo" value={filters.controlNo} onChange={handleFilterChange} placeholder="Search Control #"/>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2">Date</th><th>Control #</th><th>Source</th><th>Entry</th><th className="text-right">Amount</th><th>Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLedger.map(item => (
                                        <tr key={item.id} className="border-b">
                                            <td className="p-2 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                                            <td className="p-2">{item.controlNo}</td>
                                            <td className="p-2"><span className={`px-2 py-0.5 text-xs rounded-full ${item.source === FundSource.Main ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{item.source}</span></td>
                                            <td className="p-2">{item.entry}</td>
                                            <td className="p-2 text-right font-mono">₱{item.amount.toLocaleString()}</td>
                                            <td className="p-2 text-gray-500">{item.note}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                 <Card className="lg:col-span-1 h-fit">
                    <h3 className="font-bold text-lg mb-4">CA Rules</h3>
                     <div className="space-y-4">
                        <DetailItem label="Threshold" value={`${cashAdvance.thresholdPercent * 100}% of Ceiling`} />
                        <DetailItem label="Replenish-To Value" value={`₱${cashAdvance.replenishTo.toLocaleString()}`} />
                        <DetailItem label="Post-Audit Policy" value="A post-audit is required for all CA replenishments exceeding ₱1,000,000." />
                     </div>
                </Card>
            </div>
        </div>
    );
}

const ProfileView: React.FC<{ profile: Profile }> = ({ profile }) => {
    return (
        <div className="p-4">
            <Card className="max-w-md mx-auto p-8 text-center">
                 <ProfileIcon className="mx-auto h-24 w-24 text-brand-gray-300" />
                 <h2 className="mt-4 text-2xl font-bold text-brand-gray-800">{profile.name}</h2>
                 <p className="text-brand-gray-500">{profile.role}</p>
                 <div className="mt-6 text-left space-y-2">
                     <p><span className="font-semibold">Email:</span> {profile.email}</p>
                     <p><span className="font-semibold">Phone:</span> {profile.phone}</p>
                     <p><span className="font-semibold">Last Login:</span> {profile.lastLogin}</p>
                 </div>
            </Card>
        </div>
    );
};


// --- MAIN STAFF VIEW ---

export const StaffView: React.FC<{
  role: Role | null;
  onRoleSelect: (role: Role) => void;
  onLogout: () => void;
}> = ({ role, onRoleSelect, onLogout }) => {
  const [data] = useState<AppState>(initialData);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const {t} = useI18n();
  
  if (!role) {
    return <LoginScreen onLogin={onRoleSelect} />;
  }
  
  const handleCloseModal = () => setSelectedCase(null);
  const userProfile = data.profiles[role];

  const renderActiveView = () => {
    switch(activeView) {
        case 'reports': 
            return role === Role.Head ? <ReportsView data={data} /> : null;
        case 'profile': return <ProfileView profile={userProfile} />;
        case 'dashboard':
        default:
            return <DashboardView role={role} data={data} onCaseSelect={setSelectedCase} />;
    }
  }

  return (
    <div className="bg-brand-gray-50 min-h-screen pb-16 md:pb-0">
      <StaffHeader
        role={role}
        onLogout={onLogout}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <main>
          {renderActiveView()}
      </main>
      
      <Modal isOpen={!!selectedCase} onClose={handleCloseModal} title={t('caseDetail')} size="4xl">
          {selectedCase && role && <CaseDetailView aCase={selectedCase} data={data} role={role} onClose={handleCloseModal} />}
      </Modal>

      <BottomNav activeView={activeView} setActiveView={setActiveView} role={role} />
    </div>
  );
};