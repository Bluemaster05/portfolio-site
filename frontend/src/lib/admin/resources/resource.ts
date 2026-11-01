import type { FormValues } from '../form-values';

export type FieldKind = 'text' | 'textarea' | 'url' | 'date' | 'slug' | 'tags' | 'richtext' | 'checkbox';

export interface FieldConfig {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  help?: string;
  placeholder?: string;
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
