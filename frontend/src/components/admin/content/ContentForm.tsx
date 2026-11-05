'use client';

import { useId, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { RichTextEditor } from '@/components/rich-text/RichTextEditor';
import { errorMessage } from '@/lib/admin/api-error';
import { isMediaItem, type FormValue, type FormValues, type MediaItem } from '@/lib/admin/form-values';
import type { UploadMedia } from '@/lib/admin/media';
import type { FieldConfig } from '@/lib/admin/resources/resource';
import { MediaListField } from '../MediaListField';
import { TechnologyPicker } from '../TechnologyPicker';
import { EmployerSelect } from '../EmployerSelect';
import type { EmployerSummary, TechnologySummary } from '@/lib/api/types';
import { MediaSourceField } from '../MediaSourceField';
import { WriteupField } from '../WriteupField';
import { Button, Checkbox, ErrorBanner, Field, TextArea, TextInput } from '../ui';

interface ContentFormProps {
  fields: FieldConfig[];
  initialValues: FormValues;
  /**
   * 'create': one form with a Create button. 'edit': every tab is its own form that saves only its
   * own fields; Save and Cancel show once that tab has changes, and Cancel puts it back.
   */
  mode: 'create' | 'edit';
  /** Saves the values and resolves to the values as saved (the server may fill some in, e.g. the slug) */
  onSave: (values: FormValues) => Promise<FormValues>;
  /** Leaves without creating (create mode) */
  onCancel: () => void;
  /** Stores an image and resolves to its URL; used by image fields and the editor */
  onUpload: UploadMedia;
  /** Shared lists some fields pick from, loaded by the container */
  lookups?: FormLookups;
}

export interface FormLookups {
  technologies?: TechnologySummary[];
  createTechnology?: (name: string) => Promise<TechnologySummary>;
  employers?: EmployerSummary[];
  createEmployer?: (name: string) => Promise<EmployerSummary>;
}

/** Fields saved together: one tab, or the fields outside the tabs. */
interface FieldGroup {
  key: string;
  fields: FieldConfig[];
}

interface GroupStatus {
  saving?: boolean;
  error?: string;
}

const UNTABBED = '';

/** Form for any content type, built from its field configuration. */
export function ContentForm({
  fields,
  initialValues,
  mode,
  onSave,
  onCancel,
  onUpload,
  lookups = {},
}: ContentFormProps) {
  // Edits on every tab live here, so switching tabs never loses them
  const [values, setValues] = useState<FormValues>(initialValues);
  // What the server has; a group is "changed" when its values differ from these
  const [saved, setSaved] = useState<FormValues>(initialValues);
  const [status, setStatus] = useState<Record<string, GroupStatus>>({});
  // Bumped to remount a group's inputs when its values are replaced (editors keep their own state)
  const [versions, setVersions] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState(0);
  const tabsId = useId();

  const tabs = [...new Set(fields.flatMap((field) => (field.tab ? [field.tab] : [])))];
  const groups: FieldGroup[] = [
    ...tabs.map((tab) => ({ key: tab, fields: fields.filter((field) => field.tab === tab) })),
    { key: UNTABBED, fields: fields.filter((field) => !field.tab) },
  ].filter((group) => group.fields.length > 0);
  const untabbed = groups.find((group) => group.key === UNTABBED);

  function set(name: string, value: FormValue) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function isChanged(group: FieldGroup): boolean {
    return group.fields.some((field) => !sameValue(values[field.name], saved[field.name]));
  }

  function replaceGroup(group: FieldGroup, source: FormValues) {
    setValues((current) => ({ ...current, ...pick(source, group.fields) }));
    setVersions((current) => ({ ...current, [group.key]: (current[group.key] ?? 0) + 1 }));
  }

  async function save(group: FieldGroup | undefined, event: FormEvent) {
    event.preventDefault();
    const key = group?.key ?? 'all';
    setStatus((current) => ({ ...current, [key]: { saving: true } }));
    // Tabs without edits take the values exactly as saved below, so anything the server
    // normalises (e.g. the key order of stored JSON) can't make them look edited afterwards
    const untouched = groups.filter((other) => other !== group && !isChanged(other));
    try {
      // Only this group's edits; other tabs keep their unsaved changes for their own Save
      const next = await onSave(group ? { ...saved, ...pick(values, group.fields) } : values);
      setSaved(next);
      if (group) {
        replaceGroup(group, next);
        setValues((current) => ({ ...current, ...pick(next, untouched.flatMap((other) => other.fields)) }));
      }
      setStatus((current) => ({ ...current, [key]: {} }));
    } catch (error) {
      setStatus((current) => ({ ...current, [key]: { error: errorMessage(error) } }));
    }
  }

  function reset(group: FieldGroup) {
    replaceGroup(group, saved);
    setStatus((current) => ({ ...current, [group.key]: {} }));
  }

  // Create mode is one form across tabs. A required or malformed field on a hidden tab can't be
  // focused, so the browser would block the save without saying why: show its tab first.
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

  function renderFields(group: FieldGroup) {
    const visible = group.fields.filter((field) => field.visibleWhen?.(values) ?? true);
    const inputs = visible.filter((field) => field.kind !== 'checkbox');
    const checkboxes = visible.filter((field) => field.kind === 'checkbox');
    return (
      <div key={versions[group.key] ?? 0} className="grid gap-6">
        {inputs.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {inputs.map((field) => (
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
        )}
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
      </div>
    );
  }

  /** In edit mode each group is its own form; in create mode the one outer form holds them all. */
  function renderGroup(group: FieldGroup) {
    if (mode === 'create') return renderFields(group);
    const groupStatus = status[group.key] ?? {};
    return (
      <form onSubmit={(event) => save(group, event)} className="grid gap-6">
        {renderFields(group)}
        <ErrorBanner message={groupStatus.error} />
        {isChanged(group) && (
          <ActionBar>
            <Button type="submit" variant="primary" disabled={groupStatus.saving}>
              {groupStatus.saving ? 'Saving…' : 'Save changes'}
            </Button>
            <Button onClick={() => reset(group)} disabled={groupStatus.saving}>
              Cancel
            </Button>
          </ActionBar>
        )}
      </form>
    );
  }

  const body = (
    <>
      {tabs.length > 0 && (
        <div className="grid gap-6">
          {/* The bottom line is an inset shadow, not a border, so the active underline can sit on it
              without the tabs overflowing (which would add a scrollbar to this scroll container) */}
          <div
            role="tablist"
            aria-label="Editor sections"
            className="flex overflow-x-auto shadow-[inset_0_-1px_0_var(--border)]"
          >
            {groups
              .filter((group) => group.key !== UNTABBED)
              .map((group, index) => {
                const changed = mode === 'edit' && isChanged(group);
                return (
                  <button
                    key={group.key}
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
                    {group.key}
                    {changed && (
                      <>
                        <span aria-hidden="true" className="ml-1.5 text-accent">
                          •
                        </span>
                        <span className="sr-only"> (unsaved changes)</span>
                      </>
                    )}
                  </button>
                );
              })}
          </div>
          {/* Every panel stays mounted so editors keep their state when switching tabs */}
          {groups
            .filter((group) => group.key !== UNTABBED)
            .map((group, index) => (
              <div
                key={group.key}
                id={`${tabsId}-panel-${index}`}
                role="tabpanel"
                aria-labelledby={`${tabsId}-tab-${index}`}
                data-tab-index={index}
                hidden={index !== activeTab}
              >
                {renderGroup(group)}
              </div>
            ))}
        </div>
      )}
      {untabbed && renderGroup(untabbed)}
    </>
  );

  if (mode === 'edit') return <div className="grid gap-6">{body}</div>;

  const createStatus = status.all ?? {};
  return (
    <form onSubmit={(event) => save(undefined, event)} onInvalidCapture={revealInvalid} className="grid gap-6">
      {body}
      <ErrorBanner message={createStatus.error} />
      <ActionBar>
        <Button type="submit" variant="primary" disabled={createStatus.saving}>
          {createStatus.saving ? 'Saving…' : 'Create'}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </ActionBar>
    </form>
  );
}

/** Save/Cancel row; sticks to the bottom of the window so it's reachable from a long tab. */
function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-1 flex gap-2 border-t border-border bg-background px-1 py-3">
      {children}
    </div>
  );
}

function pick(values: FormValues, fields: FieldConfig[]): FormValues {
  return Object.fromEntries(fields.flatMap((field) => (field.name in values ? [[field.name, values[field.name]]] : [])));
}

/** Equal by content: object key order doesn't matter, and null is the same as a missing key. */
function sameValue(a: FormValue | undefined, b: FormValue | undefined): boolean {
  return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
}

/** Objects with sorted keys and no null/undefined entries, recursively; arrays keep their order. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== null && entry !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, entry]) => [key, canonical(entry)]),
  );
}

function isWide(field: FieldConfig): boolean {
  return ['richtext', 'writeup', 'textarea', 'tags', 'media', 'image', 'technologies'].includes(field.kind);
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
    case 'employer':
      return (
        <Field {...common}>
          <EmployerSelect
            id={id}
            required={field.required}
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            employers={lookups.employers ?? []}
            onCreate={lookups.createEmployer}
          />
        </Field>
      );
    case 'richtext':
      return (
        <Field {...common} htmlFor={undefined}>
          <RichTextEditor label={field.label} value={value} onChange={onChange} onUpload={onUpload} />
        </Field>
      );
    case 'writeup':
      return (
        <Field {...common} htmlFor={undefined}>
          <WriteupField label={field.label} value={value} onChange={onChange} onUpload={onUpload} />
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
