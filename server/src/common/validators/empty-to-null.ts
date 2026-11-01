import { Transform } from 'class-transformer';

/**
 * Turns `''` into `null` before validation, so clients clear an optional text field by sending an
 * empty string (`@IsOptional` then skips the other validators and null is stored).
 */
export const EmptyToNull = () =>
  Transform(({ value }: { value: unknown }) => (value === '' ? null : value));
