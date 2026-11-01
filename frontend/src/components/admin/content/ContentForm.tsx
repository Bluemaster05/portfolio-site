'use client';

import { useState, type FormEvent } from 'react';
import { RichTextEditor } from '@/components/rich-text/RichTextEditor';
import type { FormValue, FormValues } from '@/lib/admin/form-values';
import type { FieldConfig } from '@/lib/admin/resources/resource';
import { Button, Checkbox, ErrorBanner, Field, TextArea, TextInput } from '../ui';

interface ContentFormProps {
  fields: FieldConfig[];
  initialValues: FormValues;
  submitLabel: string;
  submitting: boolean;
  error?: string;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
}

/** Form for any content type, built from its field configuration. */
export function ContentForm({ fields, initialValues, submitLabel, submitting, error, onSubmit, onCancel }: ContentFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);

  function set(name: string, value: FormValue) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(values);
  }

  const checkboxes = fields.filter((field) => field.kind === 'checkbox');

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <ErrorBanner message={error} />
      <div className="grid gap-5 sm:grid-cols-2">
        {fields
          .filter((field) => field.kind !== 'checkbox')
          .map((field) => (
            <div key={field.name} className={isWide(field) ? 'sm:col-span-2' : undefined}>
              <FieldInput field={field} value={values[field.name]} onChange={(value) => set(field.name, value)} />
            </div>
          ))}
      </div>
      {checkboxes.length > 0 && (
        <div className="flex flex-wrap gap-6">
          {checkboxes.map((field) => (
            <Checkbox
              key={field.name}
              id={`field-${field.name}`}
              label={field.label}
              checked={values[field.name] === true}
              onChange={(checked) => set(field.name, checked)}
            />
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function isWide(field: FieldConfig): boolean {
  return field.kind === 'richtext' || field.kind === 'textarea' || field.kind === 'tags';
}

interface FieldInputProps {
  field: FieldConfig;
  value: FormValue | undefined;
  onChange: (value: FormValue) => void;
}

function FieldInput({ field, value, onChange }: FieldInputProps) {
  const id = `field-${field.name}`;
  const common = { label: field.label, htmlFor: id, help: field.help, required: field.required };

  switch (field.kind) {
    case 'richtext':
      return (
        <Field {...common} htmlFor={undefined}>
          <RichTextEditor label={field.label} value={value} onChange={onChange} />
        </Field>
      );
    case 'textarea':
      return (
        <Field {...common}>
          <TextArea id={id} value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(event.target.value)} />
        </Field>
      );
    case 'tags':
      return (
        <Field {...common} help={field.help ?? 'Separate with commas'}>
          <TagsInput id={id} value={Array.isArray(value) ? value : []} onChange={onChange} placeholder={field.placeholder} />
        </Field>
      );
    default:
      return (
        <Field {...common}>
          <TextInput
            id={id}
            type={field.kind === 'url' ? 'url' : 'text'}
            required={field.required}
            placeholder={field.placeholder ?? (field.kind === 'date' ? '2024-06' : undefined)}
            pattern={field.kind === 'date' ? '\\d{4}(-\\d{2}(-\\d{2})?)?' : field.kind === 'slug' ? '[a-z0-9]+(-[a-z0-9]+)*' : undefined}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => onChange(event.target.value)}
            className={field.kind === 'slug' || field.kind === 'date' ? 'font-mono' : undefined}
          />
        </Field>
      );
  }
}

/** Comma-separated text that becomes a list when the field loses focus. */
function TagsInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value.join(', '));

  function commit(text: string) {
    onChange([...new Set(text.split(',').map((tag) => tag.trim()).filter(Boolean))]);
  }

  return (
    <TextInput
      id={id}
      value={draft}
      placeholder={placeholder}
      onChange={(event) => {
        setDraft(event.target.value);
        commit(event.target.value);
      }}
      onBlur={() => setDraft(value.join(', '))}
    />
  );
}
