import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

const inputClass =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-[0.95rem] text-foreground placeholder:text-muted focus:border-accent focus:outline-none';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-background hover:opacity-90',
  secondary: 'border border-border bg-surface text-foreground hover:border-accent',
  danger: 'border border-border bg-surface text-red-700 hover:border-red-600 dark:text-red-400',
  ghost: 'text-muted hover:text-foreground',
};

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonVariants[variant]} ${className}`}
    />
  );
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  help?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, help, required, children }: FieldProps) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="text-muted"> (required)</span>}
      </label>
      {children}
      {help && <p className="text-xs text-muted">{help}</p>}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function Checkbox({
  label,
  checked,
  onChange,
  id,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5 text-[0.95rem]">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-[var(--accent)]"
      />
      {label}
    </label>
  );
}

export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      {message}
    </p>
  );
}

export function Badge({ tone, children }: { tone: 'success' | 'muted'; children: ReactNode }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        tone === 'success' ? 'bg-accent-soft text-foreground' : 'border border-border text-muted'
      }`}
    >
      {children}
    </span>
  );
}

export function AdminPageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
