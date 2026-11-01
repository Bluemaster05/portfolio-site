import type { FormValues } from '../form-values';

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'url'
  | 'date'
  | 'slug'
  | 'tags'
  | 'richtext'
  | 'checkbox'
  /** One image: upload (default) or URL, stored as a URL string */
  | 'image'
  /** One ordered list of images and videos with descriptions; the first is the main one */
  | 'media'
  | 'select'
  /** Technologies picked from the shared list, stored as ids in order */
  | 'technologies'
  /** One employer picked from the shared list (or added inline), stored as its id in a string */
  | 'employer';

export interface FieldConfig {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  help?: string;
  placeholder?: string;
  /** Choices for `select` fields */
  options?: { value: string; label: string }[];
  /** Hide the field unless this returns true for the current form values */
  visibleWhen?: (values: FormValues) => boolean;
  /** Most items a `media` field accepts for the current form values */
  maxItemsFor?: (values: FormValues) => number | undefined;
  /** Overrides `help` from the current form values, e.g. to explain the chosen layout */
  helpFor?: (values: FormValues) => string | undefined;
  /**
   * Editor tab the field sits on; tabs appear in the order their first field is listed. Fields
   * without one (e.g. Published) stay below the tabs. A resource with no tabs is one long form.
   */
  tab?: string;
}

export interface ContentItemBase {
  id: number;
  published: boolean;
  sortOrder: number;
}

/**
 * Everything the generic admin list/editor needs for one content type: its form fields, how to
 * convert between API items and form values, and typed API calls.
 */
export interface ContentResource<Item extends ContentItemBase> {
  /** URL segment under /admin and React Query key */
  key: 'projects' | 'experience' | 'education' | 'honors' | 'blog';
  label: string;
  singular: string;
  fields: FieldConfig[];
  describe(item: Item): { title: string; subtitle?: string };
  toValues(item?: Item): FormValues;
  api: {
    list(): Promise<Item[]>;
    get(id: number): Promise<Item>;
    create(values: FormValues): Promise<Item>;
    update(id: number, values: FormValues): Promise<Item>;
    setPublished(id: number, published: boolean): Promise<Item>;
    remove(id: number): Promise<void>;
    reorder(ids: number[]): Promise<Item[]>;
  };
}

export const DATE_HELP = 'YYYY, YYYY-MM, or YYYY-MM-DD';
