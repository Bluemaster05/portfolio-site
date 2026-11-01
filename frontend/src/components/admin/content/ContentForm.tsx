'use client';

import { useState, type FormEvent } from 'react';
import { RichTextEditor } from '@/components/rich-text/RichTextEditor';
import type { FormValue, FormValues, ImageItem } from '@/lib/admin/form-values';
import type { UploadImage } from '@/lib/admin/media';
import type { FieldConfig } from '@/lib/admin/resources/resource';
import { ImageListField } from '../ImageListField';
import { ImageSourceField } from '../ImageSourceField';
import { Button, Checkbox, ErrorBanner, Field, TextArea, TextInput } from '../ui';

interface ContentFormProps {
  fields: FieldConfig[];
  initialValues: FormValues;
  submitLabel: string;
  submitting: boolean;
  error?: string;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  /** Stores an image and resolves to its URL; used by image fields and the editor */
  onUpload: UploadImage;
}

/** Form for any content type, built from its field configuration. */
export function ContentForm({
  fields,
  initialValues,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
  onUpload,
}: ContentFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);

  function set(name: string, value: FormValue) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(values);
  }

  const visible = fields.filter((field) => field.visibleWhen?.(values) ?? true);
  const checkboxes = visible.filter((field) => field.kind === 'checkbox');

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <ErrorBanner message={error} />
      <div className="grid gap-5 sm:grid-cols-2">
        {visible
          .filter((field) => field.kind !== 'checkbox')
          .map((field) => (
            <div key={field.name} className={isWide(field) ? 'sm:col-span-2' : undefined}>
              <FieldInput
                field={field}
                help={field.helpFor?.(values) ?? field.help}
                value={values[field.name]}
                onChange={(value) => set(field.name, value)}
                onUpload={onUpload}
              />
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
  return ['richtext', 'textarea', 'tags', 'images', 'image'].includes(field.kind);
}

interface FieldInputProps {
  field: FieldConfig;
  help?: string;
  value: FormValue | undefined;
  onChange: (value: FormValue) => void;
  onUpload: UploadImage;
}

function FieldInput({ field, help, value, onChange, onUpload }: FieldInputProps) {
  const id = `field-${field.name}`;
  const common = { label: field.label, htmlFor: id, help, required: field.required };

  switch (field.kind) {
    case 'richtext':
      return (
        <Field {...common} htmlFor={undefined}>
          <RichTextEditor label={field.label} value={value} onChange={onChange} onUpload={onUpload} />
        </Field>
      );
    case 'image':
      return (
        <Field {...common} htmlFor={undefined}>
          <ImageSourceField
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            onUpload={onUpload}
          />
        </Field>
      );
    case 'images':
      return (
        <Field {...common} htmlFor={undefined}>
          <ImageListField label={field.label} value={imageItems(value)} onChange={onChange} onUpload={onUpload} />
        </Field>
      );
    case 'select':
      return (
        <Field {...common}>
          <select
            id={id}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[0.95rem] focus:border-accent focus:outline-none"
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
        <Field {...common} help={help ?? 'Separate with commas'}>
          <TagsInput id={id} value={tagItems(value)} onChange={onChange} placeholder={field.placeholder} />
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

function tagItems(value: FormValue | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function imageItems(value: FormValue | undefined): ImageItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ImageItem => typeof item === 'object' && item !== null && 'url' in item);
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
