



import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { Button, Card, LanguageToggle, InputField, SelectField, TextareaField, Tooltip } from '../components/ui';
import { ArrowRightIcon, CheckCircleIcon, TrashIcon, InfoIcon } from '../components/icons';
import { AssistanceType } from '../types';
import { DOC_CHECKLIST, LOGOS } from '../constants';

type PublicView = 'landing' | 'intake' | 'statusCheck' | 'confirmation';

// --- DATA & CONFIG ---
const MUNICIPALITIES_ALBAY = ['Bacacay', 'Camalig', 'Daraga', 'Guinobatan', 'Jovellar', 'Legazpi', 'Libon', 'Ligao', 'Malilipot', 'Malinao', 'Manito', 'Oas', 'Pio Duran', 'Polangui', 'Rapu-Rapu', 'Santo Domingo', 'Tabaco', 'Tiwi'];
const ASSISTANCE_TYPES = Object.values(AssistanceType);

const initialFormData = {
    // Personal
    fullName: '', sex: '', birthdate: '', civilStatus: '', placeOfBirth: '', education: '', philId: '', contact: '', email: '', preferredContact: 'Phone',
    hasRep: false, repName: '', repRelationship: '', repContact: '', repIdType: '', repIdNo: '', repAuthFile: null,
    // Address & Family
    municipality: MUNICIPALITIES_ALBAY[0], barangay: '', street: '',
    household: [{ name: '', relation: '', age: '', incomeSource: '' }],
    // Case Details
    clientCategory: [], is4ps: 'No', referringParty: '', cluster: '', background: '', assistanceType: ASSISTANCE_TYPES[0],
    // Documents
    documents: {},
};

// --- COMPONENTS ---

const PublicHeader: React.FC<{onNav: (view: PublicView) => void}> = ({onNav}) => {
  const { t, language, setLanguage } = useI18n();
    return (
        <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div onClick={() => onNav('landing')} className="flex items-center space-x-3 cursor-pointer">
                    <img src={LOGOS.pswdo} alt="PSWDO Logo" className="h-8 w-auto" />
                    <span className="text-xl font-bold text-brand-blue ml-2">PSWDO AICS</span>
                </div>
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex space-x-4">
            <button onClick={() => onNav('intake')} className="text-brand-gray-600 hover:text-brand-blue">{t('submitRequest')}</button>
            <button onClick={() => onNav('statusCheck')} className="text-brand-gray-600 hover:text-brand-blue">{t('checkStatus')}</button>
          </nav>
          <LanguageToggle language={language} setLanguage={setLanguage} />
        </div>
      </div>
    </header>
  );
};

const LandingPage: React.FC<{onNav: (view: PublicView) => void}> = ({onNav}) => {
  const { t } = useI18n();
  const infoCards = [
    { title: t('landingWho'), content: "Vulnerable and disadvantaged individuals and families in crisis situations." },
    { title: t('landingWhat'), content: "Valid ID, proof of indigency, and other documents depending on the type of assistance needed." },
    { title: t('landingProcess'), content: "From submission to approval, processing may take 3-7 working days, depending on case complexity." },
  ];
  return (
    <div className="text-center py-12 md:py-20">
      <img src={LOGOS.pswdo} alt="PSWDO Logo" className="h-24 mx-auto mb-6" />
      <h2 className="text-3xl md:text-5xl font-extrabold text-brand-gray-800 mb-4">{t('landingTitle')}</h2>
      <p className="text-lg text-brand-gray-600 max-w-2xl mx-auto mb-8">Providing responsive and compassionate service to constituents in need.</p>
      <div className="flex justify-center space-x-4 mb-16">
        <Button onClick={() => onNav('intake')} variant="primary" size="lg" className="px-8 py-3">
            {t('submitRequest')} <ArrowRightIcon className="inline ml-2 h-5 w-5"/>
        </Button>
        <Button onClick={() => onNav('statusCheck')} variant="secondary" size="lg" className="px-8 py-3">{t('checkStatus')}</Button>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {infoCards.map(card => (
          <Card key={card.title}>
            <h3 className="text-xl font-bold text-brand-blue mb-2">{card.title}</h3>
            <p className="text-brand-gray-600">{card.content}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ReviewDetail: React.FC<{ label: string; value: string | React.ReactNode; className?: string; }> = ({ label, value, className }) => (
  <div className={className}>
    <dt className="text-sm font-medium text-brand-gray-500">{label}</dt>
    <dd className="mt-1 text-base text-brand-gray-900">{value || 'N/A'}</dd>
  </div>
);

const ReviewAndConsentView: React.FC<{formData: typeof initialFormData}> = ({formData}) => {
    return (
        <div className="space-y-6">
            <div className="bg-brand-blue-light p-4 rounded-lg"><h4 className="font-semibold text-brand-blue-dark">Please review your information before submitting.</h4></div>
            <section><h5 className="text-lg font-bold text-brand-gray-800 border-b pb-2 mb-3">Personal Information</h5>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                    <ReviewDetail label="Full Name" value={formData.fullName} /><ReviewDetail label="Birthdate" value={formData.birthdate} />
                    <ReviewDetail label="Sex" value={formData.sex} /><ReviewDetail label="Contact Number" value={formData.contact} />
                    {formData.hasRep && <>
                        <ReviewDetail label="Authorized Rep." value={formData.repName} className="col-span-full pt-4 border-t" />
                        <ReviewDetail label="Rep. Relationship" value={formData.repRelationship} />
                        <ReviewDetail label="Rep. Contact" value={formData.repContact} />
                    </>}
                </dl>
            </section>
            <section><h5 className="text-lg font-bold text-brand-gray-800 border-b pb-2 mb-3">Address & Family</h5>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                    <ReviewDetail label="Address" value={`${formData.street}, ${formData.barangay}, ${formData.municipality}`} />
                    <ReviewDetail label="Household Members" value={<ul className="list-disc list-inside">{formData.household.map((m,i)=>(<li key={i}>{m.name} ({m.relation}, {m.age})</li>))}</ul>} />
                </dl>
            </section>
            <section><h5 className="text-lg font-bold text-brand-gray-800 border-b pb-2 mb-3">Case Details</h5>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                     <ReviewDetail label="Assistance Type" value={formData.assistanceType} />
                     <ReviewDetail label="4Ps Member?" value={formData.is4ps} />
                     <ReviewDetail label="Brief Background" value={formData.background} className="col-span-full"/>
                </dl>
            </section>
            <section><h5 className="text-lg font-bold text-brand-gray-800 border-b pb-2 mb-3">Uploaded Documents</h5>
                <ul className="list-disc list-inside text-brand-gray-800 bg-brand-gray-50 p-3 rounded-md">
                    {Object.entries(formData.documents).map(([key, file]) => file && <li key={key}>{(file as File).name}</li>)}
                    {formData.hasRep && formData.repAuthFile && <li>{(formData.repAuthFile as File).name}</li>}
                </ul>
            </section>
        </div>
    );
};

const IntakePage: React.FC<{onNav: (view: PublicView) => void}> = ({onNav}) => {
    const [step, setStep] = useState(1);
    const [accepted, setAccepted] = useState(false);
    const { t } = useI18n();
    const [formData, setFormData] = useState(initialFormData);
    const steps = ["Personal", "Address & Family", "Case Details", "Documents", "Review & Consent"];

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleHouseholdChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newHousehold = [...formData.household];
        newHousehold[index] = { ...newHousehold[index], [name]: value };
        setFormData(prev => ({ ...prev, household: newHousehold }));
    };

    const addHouseholdMember = () => setFormData(prev => ({ ...prev, household: [...prev.household, { name: '', relation: '', age: '', incomeSource: '' }] }));
    const removeHouseholdMember = (index: number) => setFormData(prev => ({ ...prev, household: prev.household.filter((_, i) => i !== index) }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            const file = files[0];
            if (name === 'repAuthFile') {
                setFormData(prev => ({ ...prev, repAuthFile: file as any }));
            } else {
                setFormData(prev => ({ ...prev, documents: { ...prev.documents, [name]: file } }));
            }
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleFormChange} required />
                            <SelectField label="Sex" name="sex" value={formData.sex} onChange={handleFormChange} required>
                                <option value="">Select Sex</option><option>Male</option><option>Female</option>
                            </SelectField>
                            <InputField label="Birthdate" name="birthdate" type="date" value={formData.birthdate} onChange={handleFormChange} required />
                            <InputField label="Place of Birth" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleFormChange} required />
                            <SelectField label="Civil Status" name="civilStatus" value={formData.civilStatus} onChange={handleFormChange} required>
                                <option value="">Select Status</option><option>Single</option><option>Married</option><option>Widowed</option><option>Separated</option>
                            </SelectField>
                            <InputField label="Educational Attainment" name="education" value={formData.education} onChange={handleFormChange} />
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <InputField label="PhilID/ID Number" name="philId" value={formData.philId} onChange={handleFormChange} required />
                            <InputField label="Contact #" name="contact" value={formData.contact} onChange={handleFormChange} required />
                            <InputField label="Email (Optional)" name="email" type="email" value={formData.email} onChange={handleFormChange} />
                        </div>
                        <div className="pt-4 border-t">
                            <div className="flex items-center">
                                <input type="checkbox" id="hasRep" name="hasRep" checked={formData.hasRep} onChange={handleFormChange} className="h-4 w-4" />
                                <label htmlFor="hasRep" className="ml-2">Authorized Representative?</label>
                            </div>
                            {formData.hasRep && (
                                <div className="grid sm:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                                    <InputField label="Rep. Full Name" name="repName" value={formData.repName} onChange={handleFormChange} required={formData.hasRep} />
                                    <InputField label="Rep. Relationship" name="repRelationship" value={formData.repRelationship} onChange={handleFormChange} required={formData.hasRep} />
                                    <InputField label="Rep. Contact #" name="repContact" value={formData.repContact} onChange={handleFormChange} required={formData.hasRep} />
                                    <InputField label="Rep. ID Type & #" name="repIdNo" value={formData.repIdNo} onChange={handleFormChange} required={formData.hasRep} />
                                    <InputField label="Authorization Doc Upload" type="file" name="repAuthFile" onChange={handleFileChange} required={formData.hasRep} />
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Address</h4>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <SelectField label="Municipality" name="municipality" value={formData.municipality} onChange={handleFormChange} required>
                                    {MUNICIPALITIES_ALBAY.map(m => <option key={m}>{m}</option>)}
                                </SelectField>
                                <InputField label="Barangay" name="barangay" value={formData.barangay} onChange={handleFormChange} required />
                                <InputField label="House/Street" name="street" value={formData.street} onChange={handleFormChange} required />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Household Members</h4>
                            {formData.household.map((member, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end mb-2 p-2 bg-gray-50 rounded">
                                    <InputField label={`Name ${index + 1}`} name="name" value={member.name} onChange={e => handleHouseholdChange(index, e as any)} />
                                    <InputField label="Relation" name="relation" value={member.relation} onChange={e => handleHouseholdChange(index, e as any)} />
                                    <InputField label="Age" name="age" type="number" value={member.age} onChange={e => handleHouseholdChange(index, e as any)} />
                                    <div className="flex items-center">
                                        <InputField label="Income Source" name="incomeSource" value={member.incomeSource} onChange={e => handleHouseholdChange(index, e as any)} />
                                        {formData.household.length > 1 && (
                                            <Button type="button" variant="danger" size="sm" onClick={() => removeHouseholdMember(index)} className="ml-2 h-10 w-10 !p-0 flex items-center justify-center">
                                                <TrashIcon className="h-5 w-5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="secondary" size="sm" onClick={addHouseholdMember}>+ Add Member</Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                        <SelectField label="Assistance Type" name="assistanceType" value={formData.assistanceType} onChange={handleFormChange} required tooltip="The type of help you are requesting.">
                            {ASSISTANCE_TYPES.map(a => <option key={a}>{a}</option>)}
                        </SelectField>
                        <div>
                            <label className="flex items-center text-sm font-medium text-brand-gray-700 mb-1">
                                <span>4Ps Member?</span>
                                <Tooltip content="Pantawid Pamilyang Pilipino Program (conditional cash transfer).">
                                    <button type="button" aria-describedby="tooltip-content" className="ml-1"><InfoIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" /></button>
                                </Tooltip>
                            </label>
                            <div className="flex items-center space-x-4 pt-2">
                                <label><input type="radio" name="is4ps" value="Yes" checked={formData.is4ps === 'Yes'} onChange={handleFormChange} /> Yes</label>
                                <label><input type="radio" name="is4ps" value="No" checked={formData.is4ps === 'No'} onChange={handleFormChange} /> No</label>
                            </div>
                        </div>
                        <InputField label="Referring Party (Optional)" name="referringParty" value={formData.referringParty} onChange={handleFormChange} />
                        <InputField label="Cluster (Optional)" name="cluster" value={formData.cluster} onChange={handleFormChange} />
                        <TextareaField label="Brief Background" name="background" value={formData.background} onChange={handleFormChange} required className="sm:col-span-2" />
                    </div>
                );
            case 4:
                const docs = DOC_CHECKLIST[formData.assistanceType as AssistanceType] || [];
                return (
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-4">Please upload the following documents for <span className="font-bold text-brand-blue">{formData.assistanceType}</span> assistance:</h4>
                        <div className="space-y-4">
                            {docs.map(doc => (
                                <InputField key={doc.name} label={`${doc.name} ${doc.required ? '' : '(Optional)'}`} name={doc.name} type="file" onChange={handleFileChange} required={doc.required} />
                            ))}
                        </div>
                    </div>
                );
            case 5:
                return <ReviewAndConsentView formData={formData} />;
            default:
                return null;
        }
    };

    return (
        <Card className="max-w-4xl mx-auto my-8">
                <h2 className="text-2xl font-bold mb-2">{t('submitRequest')}</h2>
                <p className="text-brand-gray-500 mb-6">Please fill out the form completely and accurately.</p>
                <div className="mb-8">
                    <ol className="flex flex-wrap md:flex-nowrap items-center w-full gap-2 md:gap-0">
                        {steps.map((s, i) => (
                            <li
                                key={s}
                                className={`flex items-center min-w-[120px] md:w-full ${i < step ? 'text-brand-blue' : 'text-gray-500'}`}
                                style={{ flex: '1 1 120px', maxWidth: '100%' }}
                            >
                                <span className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 text-sm shrink-0 ${i < step ? 'bg-brand-blue-light' : 'bg-gray-100'}`}>{i + 1}</span>
                                <div className="ml-2"><p className="font-medium whitespace-normal text-xs md:text-base">{s}</p></div>
                            </li>
                        ))}
                    </ol>
                </div>
                <form onSubmit={e => e.preventDefault()}>
                    <div className="border-t pt-6">
                        {renderStepContent()}
                        {step === 5 && (
                            <div className="mt-6 p-4 border border-yellow-300 bg-yellow-50 rounded-md">
                                <div className="flex items-start">
                                    <input id="consent" type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded mt-1" />
                                    <label htmlFor="consent" className="ml-3 text-sm text-yellow-800">
                                        I hereby consent to the processing of my personal data in accordance with the Data Privacy Act. <button type="button" className="font-semibold underline">Read full notice</button>.
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between mt-8 border-t pt-4">
                        <div>
                            <Button variant="secondary" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>Back</Button>
                            <Button variant="link" onClick={() => onNav('landing')} className="ml-2 text-sm">Cancel</Button>
                        </div>
                        {step < 5 ? (
                            <Button onClick={() => setStep(s => Math.min(5, s + 1))}>Next</Button>
                        ) : (
                            <Button onClick={() => onNav('confirmation')} disabled={!accepted}>Submit Application</Button>
                        )}
                    </div>
                </form>
            </Card>
    );
};

const StatusCheckPage: React.FC<{ onNav: (view: PublicView) => void }> = ({onNav}) => {
    const {t} = useI18n();
    return <Card className="max-w-2xl mx-auto my-8">
        <h2 className="text-2xl font-bold mb-6">{t('checkStatus')}</h2>
        <div className="space-y-4">
            <InputField label="Reference Number" id="ref_no" placeholder="AICS-2024-02001" />
            <InputField label="Last Name" id="last_name" placeholder="Dela Cruz" />
        </div>
        <div className="mt-6 flex items-center justify-between">
            <Button className="w-full">{t('checkStatus')}</Button>
        </div>
         <div className="text-center mt-4">
            <Button variant="link" onClick={() => onNav('landing')} className="text-sm">Back to Home</Button>
        </div>
    </Card>;
};

const ConfirmationPage: React.FC<{onNav: (view: PublicView) => void}> = ({onNav}) => {
    return <Card className="max-w-2xl mx-auto my-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-10 w-10 text-brand-green"/>
        </div>
        <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
        <p className="text-brand-gray-600 mb-4">Your application has been received. Your Control Number is:</p>
        <p className="text-2xl font-mono bg-brand-gray-100 p-3 rounded-md text-brand-blue-dark inline-block">AICS-2024-02026</p>
        <p className="text-sm text-yellow-700 mt-4">Please keep this number safe. You will need it to check the status of your request.</p>
        <div className="mt-8">
            <Button onClick={() => onNav('landing')}>Back to Home</Button>
        </div>
    </Card>;
}

export const PublicView: React.FC<{ onStaffLoginClick: () => void }> = ({ onStaffLoginClick }) => {
  const [view, setView] = useState<PublicView>('landing');

  const renderView = () => {
    switch (view) {
      case 'intake':
        return <IntakePage onNav={setView}/>;
      case 'statusCheck':
        return <StatusCheckPage onNav={setView} />;
      case 'confirmation':
        return <ConfirmationPage onNav={setView} />;
      case 'landing':
      default:
        return <LandingPage onNav={setView}/>;
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-50 flex flex-col">
      <PublicHeader onNav={setView} />
      <main className="flex-grow container mx-auto px-4">
        {renderView()}
      </main>
      <footer className="bg-white py-6 text-center text-brand-gray-500 border-t">
        <div className="flex justify-center items-center space-x-6 mb-4">
            <img src={LOGOS.national} alt="National Government Logo" className="h-12" />
            <img src={LOGOS.province} alt="Province of Albay Logo" className="h-12" />
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} PSWDO AICS Demo. All Rights Reserved.</p>
        <button onClick={onStaffLoginClick} className="text-xs text-brand-gray-400 hover:text-brand-blue mt-2">Staff Login</button>
      </footer>
    </div>
  );
};