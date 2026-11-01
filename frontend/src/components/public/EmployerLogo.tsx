import { isImageSrc } from '@/lib/images';

/**
 * The employer's optional logo; nothing when it has none. Fixed height and natural width (capped),
 * so wide wordmarks aren't shrunk into a square. Kept on its own (no rich text or server-only
 * imports) so the admin's client components can use it too.
 */
export function EmployerLogo({ src, height = 'h-12', maxWidth = 'max-w-40' }: { src?: string; height?: string; maxWidth?: string }) {
  if (!isImageSrc(src)) return null;
  // Decorative: the employer's name is always shown next to it
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={`${height} ${maxWidth} w-auto shrink-0 rounded-md object-contain`} />;
}
