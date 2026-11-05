interface DetailPageSkeletonProps {
  /** The real page's article width, so the content doesn't jump when it arrives */
  className?: string;
  /** Shows a block where the page's media (header image, gallery or cover) will be */
  media?: boolean;
}

/**
 * Placeholder for a detail page (project, job, school, honor, post) while its content loads: grey
 * shapes in the page's layout — back link, title, meta line, media and paragraphs. They pulse gently
 * unless reduced motion is on.
 */
export function DetailPageSkeleton({ className = 'mx-auto max-w-4xl', media = false }: DetailPageSkeletonProps) {
  return (
    <div role="status" className={className}>
      <span className="sr-only">Loading…</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <Bone className="h-4 w-28" />
        <div className="mb-6 mt-3 grid gap-3">
          <Bone className="h-9 w-2/3" />
          <Bone className="h-5 w-48" />
          <Bone className="h-5 w-full max-w-[60ch]" />
        </div>
        {media && <Bone className="mb-8 aspect-video w-full rounded-card" />}
        <div className="grid gap-3">
          {['w-full', 'w-full', 'w-11/12', 'w-4/5', 'w-full', 'w-2/3'].map((width, index) => (
            <Bone key={index} className={`h-4 ${width}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Bone({ className }: { className: string }) {
  return <div className={`rounded bg-border ${className}`} />;
}
