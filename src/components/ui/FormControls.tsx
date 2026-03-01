import React, { type SelectHTMLAttributes, type InputHTMLAttributes } from 'react';
import { UI_PRESETS } from '../../config/uiPresets';

const baseControlClass = `rounded-full ${UI_PRESETS.borderBase} bg-zinc-950 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none`;

type FormInputProps = InputHTMLAttributes<HTMLInputElement>;

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const FormInput: React.FC<FormInputProps> = ({ className = '', ...props }) => {
  return <input className={`${baseControlClass} ${className}`.trim()} {...props} />;
};

export const FormSelect: React.FC<FormSelectProps> = ({ className = '', ...props }) => {
  return <select className={`${baseControlClass} disabled:opacity-50 ${className}`.trim()} {...props} />;
};
