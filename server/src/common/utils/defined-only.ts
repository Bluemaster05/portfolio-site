/**
 * Copies an object without its `undefined` properties. DTO instances declare every field, so
 * fields the client left out are `undefined` and would otherwise overwrite stored values.
 * `null` is kept: it clears an optional field.
 */
export function definedOnly<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as Partial<T>;
}
