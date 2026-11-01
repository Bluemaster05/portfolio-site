'use client';

import { useState, type FormEvent } from 'react';
import type { components } from '@/lib/api/schema';
import type { SiteSettings, SiteLink } from '@/lib/api/types';
import { SECTIONS } from '@/lib/sections';
import { RichTextEditor } from '@/components/rich-text/RichTextEditor';
import { Button, Checkbox, ErrorBanner, Field, TextArea, TextInput } from './ui';

export type SiteSettingsUpdate = components['schemas']['UpdateSiteSettingsDto'];

interface SiteSettingsFormProps {
  settings: SiteSettings;
  saving: boolean;
  saved: boolean;
  error?: string;
  onSubmit: (update: SiteSettingsUpdate) => void;
}

export function SiteSettingsForm({ settings, saving, saved, error, onSubmit }: SiteSettingsFormProps) {
  const [draft, setDraft] = useState<SiteSettingsUpdate>({
    siteTitle: settings.siteTitle,
    siteDescription: settings.siteDescription,
    ownerName: settings.ownerName,
    headline: settings.headline,
    location: settings.location ?? '',
    contactEmail: settings.contactEmail ?? '',
    avatarUrl: settings.avatarUrl ?? '',
    bio: settings.bio,
    links: settings.links,
    sections: settings.sections,
  });
  const sections = draft.sections ?? settings.sections;
  const links = draft.links ?? [];

  function set<K extends keyof SiteSettingsUpdate>(key: K, value: SiteSettingsUpdate[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function setLink(index: number, patch: Partial<SiteLink>) {
    set('links', links.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ ...draft, links: links.filter((link) => link.label.trim() && link.url.trim()) });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10">
      <ErrorBanner message={error} />

      <fieldset className="grid gap-4">
        <legend className="mb-2 text-lg font-semibold">Sections</legend>
        <p className="text-sm text-muted">Hidden sections disappear from the navigation and return 404.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {SECTIONS.map((section) => (
            <Checkbox
              key={section.key}
              id={`section-${section.key}`}
              label={section.label}
              checked={sections[section.key]}
              onChange={(checked) => set('sections', { ...sections, [section.key]: checked })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-2 text-lg font-semibold">Profile</legend>
        <Field label="Your name" htmlFor="ownerName" required>
          <TextInput id="ownerName" required value={draft.ownerName ?? ''} onChange={(e) => set('ownerName', e.target.value)} />
        </Field>
        <Field label="Headline" htmlFor="headline" help="One line under your name">
          <TextInput id="headline" value={draft.headline ?? ''} onChange={(e) => set('headline', e.target.value)} />
        </Field>
        <Field label="Location" htmlFor="location">
          <TextInput id="location" value={draft.location ?? ''} onChange={(e) => set('location', e.target.value)} />
        </Field>
        <Field label="Contact email" htmlFor="contactEmail" help="Shown in the footer">
          <TextInput id="contactEmail" type="email" value={draft.contactEmail ?? ''} onChange={(e) => set('contactEmail', e.target.value)} />
        </Field>
        <Field label="Avatar URL" htmlFor="avatarUrl">
          <TextInput id="avatarUrl" type="url" value={draft.avatarUrl ?? ''} onChange={(e) => set('avatarUrl', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Introduction" help="Shown on the home page">
            <RichTextEditor label="Introduction" value={draft.bio} onChange={(bio) => set('bio', bio)} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-2 text-lg font-semibold">Links</legend>
        {links.map((link, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[12rem_1fr_auto]">
            <TextInput aria-label="Link label" placeholder="GitHub" value={link.label} onChange={(e) => setLink(index, { label: e.target.value })} />
            <TextInput aria-label="Link URL" type="url" placeholder="https://github.com/…" value={link.url} onChange={(e) => setLink(index, { url: e.target.value })} />
            <Button variant="ghost" onClick={() => set('links', links.filter((_, i) => i !== index))}>
              Remove
            </Button>
          </div>
        ))}
        <div>
          <Button onClick={() => set('links', [...links, { label: '', url: '' }])}>Add link</Button>
        </div>
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-2 text-lg font-semibold">Search & sharing</legend>
        <Field label="Site title" htmlFor="siteTitle" required help="Browser tab and search result title">
          <TextInput id="siteTitle" required value={draft.siteTitle ?? ''} onChange={(e) => set('siteTitle', e.target.value)} />
        </Field>
        <Field label="Site description" htmlFor="siteDescription" help="Search result snippet, up to 300 characters">
          <TextArea id="siteDescription" maxLength={300} value={draft.siteDescription ?? ''} onChange={(e) => set('siteDescription', e.target.value)} />
        </Field>
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </Button>
        {saved && <p role="status" className="text-sm text-muted">Saved. The public site updates within a few minutes.</p>}
      </div>
    </form>
  );
}
