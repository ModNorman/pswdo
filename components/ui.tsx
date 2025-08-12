import React, { ReactNode } from 'react';
import { STATUS_COLORS } from '../constants';
import { CaseStatus } from '../types';
import { InfoIcon, ChevronDownIcon } from './icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, className, ...props }) => {
  const baseClasses = 'rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';
  const variantClasses = {
    primary: 'bg-brand-blue text-white hover:bg-brand-blue-dark focus:ring-brand-blue',
    secondary: 'bg-brand-gray-200 text-brand-gray-800 hover:bg-brand-gray-300 focus:ring-brand-gray-400',
    danger: 'bg-brand-red text-white hover:bg-red-700 focus:ring-brand-red',
    link: 'text-brand-blue hover:underline focus:ring-brand-blue',
  };
  const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
  };
  
  const sizeClass = sizeClasses[size];

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${size ? sizeClass : ''} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  const hoverClass = onClick ? 'hover:shadow-md hover:border-brand-blue cursor-pointer' : '';
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-brand-gray-200 p-4 transition-all duration-200 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} flex flex-col`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-brand-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

interface TabsProps<T extends string> {
  tabs: readonly T[];
  activeTab: T;
  onTabClick: (tab: T) => void;
  counts?: Record<T, number>;
}

export const Tabs = <T extends string>({ tabs, activeTab, onTabClick, counts }: TabsProps<T>) => {
  return (
    <div className="border-b border-gray-200">
      <div className="w-full max-w-full min-w-0 overflow-x-hidden">
        <nav
          className="flex-nowrap flex space-x-2 overflow-x-auto scrollbar-hide py-2 px-1 w-full max-w-full min-w-0"
          style={{ scrollSnapType: 'x mandatory' }}
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabClick(tab)}
              className={
                `${activeTab === tab
                  ? 'bg-brand-blue text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-brand-blue/10'} rounded-full px-3 py-1 font-medium text-sm transition-colors duration-200 flex items-center gap-2`
              }
              style={{ scrollSnapAlign: 'start', minWidth: 'max-content' }}
              type="button"
            >
              <span>{tab}</span>
              {counts && counts[tab] > 0 && (
                <span className={
                  `px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab ? 'bg-white text-brand-blue' : 'bg-brand-blue/10 text-brand-blue'}`
                }>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      {/* Hide scrollbar cross-browser */}
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export const StatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};

export const Tooltip: React.FC<{ content: string; children: ReactNode }> = ({ content, children }) => {
    return (
        <div className="relative flex items-center group">
            {children}
            <div className="absolute bottom-full mb-2 w-max max-w-xs bg-brand-gray-800 text-white text-sm rounded-md p-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" id="tooltip-content" role="tooltip">
                {content}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-brand-gray-800"></div>
            </div>
        </div>
    );
};


const FormFieldWrapper: React.FC<{ label: string; tooltip?: string; htmlFor: string; children: ReactNode }> = ({ label, tooltip, htmlFor, children }) => (
    <div>
        <label htmlFor={htmlFor} className="flex items-center text-sm font-medium text-brand-gray-700 mb-1">
            <span>{label}</span>
            {tooltip && (
                <Tooltip content={tooltip}>
                    <button type="button" aria-describedby="tooltip-content" className="ml-1.5 leading-none">
                        <InfoIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                </Tooltip>
            )}
        </label>
        {children}
    </div>
);


export const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; tooltip?: string }> = ({ label, tooltip, id, ...props }) => {
  const inputId = id || label.toLowerCase().replace(/\s/g, '-');
  return (
    <FormFieldWrapper label={label} tooltip={tooltip} htmlFor={inputId}>
      <input id={inputId} {...props} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100 text-brand-gray-900" />
    </FormFieldWrapper>
  );
};

export const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; tooltip?: string, children: ReactNode }> = ({ label, tooltip, id, children, ...props }) => {
    const selectId = id || label.toLowerCase().replace(/\s/g, '-');
    return (
        <FormFieldWrapper label={label} tooltip={tooltip} htmlFor={selectId}>
            <div className="relative">
                <select id={selectId} {...props} className="block w-full appearance-none px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm text-brand-gray-900">
                    {children}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDownIcon className="h-4 w-4"/>
                </div>
            </div>
        </FormFieldWrapper>
    );
};

export const TextareaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; tooltip?: string }> = ({ label, tooltip, id, ...props }) => {
    const textareaId = id || label.toLowerCase().replace(/\s/g, '-');
    return (
        <FormFieldWrapper label={label} tooltip={tooltip} htmlFor={textareaId}>
            <textarea id={textareaId} {...props} rows={4} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm text-brand-gray-900" />
        </FormFieldWrapper>
    );
};

export const KpiCard: React.FC<{ label: string; value: number | string, icon?: ReactNode, className?: string, children?: ReactNode }> = ({ label, value, icon, className, children }) => {
    return (
        <Card className={`flex-1 ${className}`}>
            <div className="flex items-center">
                {icon && <div className="p-3 rounded-full bg-brand-blue-light mr-4">{icon}</div>}
                <div className="flex-1">
                    <p className="text-sm text-brand-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-brand-gray-800">{value}</p>
                </div>
            </div>
            {children && <div className="mt-4">{children}</div>}
        </Card>
    );
}

export const LanguageToggle: React.FC<{
    language: 'en' | 'fil',
    setLanguage: (lang: 'en' | 'fil') => void
}> = ({ language, setLanguage }) => {
    return (
        <div className="flex items-center p-1 bg-brand-gray-200 rounded-full">
            <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm font-semibold rounded-full ${language === 'en' ? 'bg-white shadow' : 'text-brand-gray-600'}`}>EN</button>
            <button onClick={() => setLanguage('fil')} className={`px-3 py-1 text-sm font-semibold rounded-full ${language === 'fil' ? 'bg-white shadow' : 'text-brand-gray-600'}`}>FIL</button>
        </div>
    );
};