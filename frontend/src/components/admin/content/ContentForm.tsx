'use client';

import { useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { flushSync } from 'react-dom';
import { RichTextEditor } from '@/components/rich-text/RichTextEditor';
import { isMediaItem, type FormValue, type FormValues, type MediaItem } from '@/lib/admin/form-values';
import type { UploadMedia } from '@/lib/admin/media';
import type { FieldConfig } from '@/lib/admin/resources/resource';
import { MediaListField } from '../MediaListField';
import { TechnologyPicker } from '../TechnologyPicker';
import type { TechnologySummary } from '@/lib/api/types';
import { MediaSourceField } from '../MediaSourceField';
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
  onUpload: UploadMedia;
  /** Shared lists some fields pick from, loaded by the container */
  lookups?: FormLookups;
}

export interface FormLookups {
  technologies?: TechnologySummary[];
  createTechnology?: (name: string) => Promise<TechnologySummary>;
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
  lookups = {},
}: ContentFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [activeTab, setActiveTab] = useState(0);
  const tabsId = useId();

  function set(name: string, value: FormValue) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(values);
  }

  // A required or malformed field on a hidden tab can't be focused, so the browser would block
  // the save without saying why. Show its tab first so the browser can point at it.
  function revealInvalid(event: FormEvent<HTMLFormElement>) {
    const panel = event.currentTarget.querySelector(':invalid')?.closest<HTMLElement>('[data-tab-index]');
    const index = Number(panel?.dataset.tabIndex);
    if (panel && index !== activeTab) flushSync(() => setActiveTab(index));
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (activeTab + step + tabs.length) % tabs.length;
    setActiveTab(next);
    document.getElementById(`${tabsId}-tab-${next}`)?.focus();
  }

  const visible = fields.filter((field) => field.visibleWhen?.(values) ?? true);
  const checkboxes = visible.filter((field) => field.kind === 'checkbox');
  const inputs = visible.filter((field) => field.kind !== 'checkbox');
  const untabbed = inputs.filter((field) => !field.tab);
  const tabs = [...new Set(fields.flatMap((field) => (field.tab ? [field.tab] : [])))];

  function renderFields(list: FieldConfig[]) {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        {list.map((field) => (
          <div key={field.name} className={isWide(field) ? 'sm:col-span-2' : undefined}>
            <FieldInput
              field={field}
              help={field.helpFor?.(values) ?? field.help}
              maxItems={field.maxItemsFor?.(values)}
              value={values[field.name]}
              onChange={(value) => set(field.name, value)}
              onUpload={onUpload}
              lookups={lookups}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onInvalidCapture={revealInvalid} className="grid gap-6">
      <ErrorBanner message={error} />
      {tabs.length > 0 && (
        <div className="grid gap-6">
          {/* The bottom line is an inset shadow, not a border, so the active underline can sit on it
              without the tabs overflowing (which would add a scrollbar to this scroll container) */}
          <div
            role="tablist"
            aria-label="Editor sections"
            className="flex overflow-x-auto shadow-[inset_0_-1px_0_var(--border)]"
          >
            {tabs.map((tab, index) => (
              <button
                key={tab}
                id={`${tabsId}-tab-${index}`}
                role="tab"
                type="button"
                aria-selected={index === activeTab}
                aria-controls={`${tabsId}-panel-${index}`}
                tabIndex={index === activeTab ? 0 : -1}
                onClick={() => setActiveTab(index)}
                onKeyDown={onTabKeyDown}
                className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  index === activeTab
                    ? 'border-accent text-foreground'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Every panel stays mounted so editors keep their state when switching tabs */}
          {tabs.map((tab, index) => (
            <div
              key={tab}
              id={`${tabsId}-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`${tabsId}-tab-${index}`}
              data-tab-index={index}
              hidden={index !== activeTab}
            >
              {renderFields(inputs.filter((field) => field.tab === tab))}
            </div>
          ))}
        </div>
      )}
      {untabbed.length > 0 && renderFields(untabbed)}
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
  return ['richtext', 'textarea', 'tags', 'media', 'image', 'technologies'].includes(field.kind);
}

interface FieldInputProps {
  field: FieldConfig;
  help?: string;
  maxItems?: number;
  value: FormValue | undefined;
  onChange: (value: FormValue) => void;
  onUpload: UploadMedia;
  lookups: FormLookups;
}

function FieldInput({ field, help, maxItems, value, onChange, onUpload, lookups }: FieldInputProps) {
  const id = `field-${field.name}`;
  const common = { label: field.label, htmlFor: id, help, required: field.required };

  switch (field.kind) {
    case 'technologies':
      return (
        <Field {...common} htmlFor={undefined}>
          <TechnologyPicker
            label={field.label}
            value={Array.isArray(value) ? value.filter((item): item is number => typeof item === 'number') : []}
            onChange={onChange}
            technologies={lookups.technologies ?? []}
            onCreate={lookups.createTechnology}
          />
        </Field>
      );
    case 'richtext':
      return (
        <Field {...common} htmlFor={undefined}>
          <RichTextEditor label={field.label} value={value} onChange={onChange} onUpload={onUpload} />
        </Field>
      );
    case 'image':
      return (
        <Field {...common} htmlFor={undefined}>
          <MediaSourceField
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            onUpload={onUpload}
          />
        </Field>
      );
    case 'media':
      return (
        <Field {...common} htmlFor={undefined}>
          <MediaListField
            label={field.label}
            value={mediaItems(value)}
            onChange={onChange}
            onUpload={onUpload}
            maxItems={maxItems}
          />
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
          <TextArea
            id={id}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => onChange(event.target.value)}
          />
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
            pattern={
              field.kind === 'date'
                ? '\\d{4}(-\\d{2}(-\\d{2})?)?'
                : field.kind === 'slug'
                  ? '[a-z0-9]+(-[a-z0-9]+)*'
                  : undefined
            }
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

function mediaItems(value: FormValue | undefined): MediaItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isMediaItem);
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
    onChange([
      ...new Set(
        text
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    ]);
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
