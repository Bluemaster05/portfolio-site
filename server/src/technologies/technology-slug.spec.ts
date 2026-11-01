import { technologySlug } from './technology-slug.js';

describe('technologySlug', () => {
  it('keeps languages that differ only by a symbol apart', () => {
    expect(['C', 'C#', 'C++', 'F#'].map(technologySlug)).toEqual(['c', 'c-sharp', 'c-plus-plus', 'f-sharp']);
  });

  it('handles dots and ordinary names', () => {
    expect(technologySlug('.NET')).toBe('dot-net');
    expect(technologySlug('ASP.NET Core')).toBe('asp-net-core');
    expect(technologySlug('Node.js')).toBe('node-js');
    expect(technologySlug('TypeScript')).toBe('typescript');
  });
});
