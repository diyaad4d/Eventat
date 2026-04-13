// ─────────────────────────────────────────────────────────────
//  SkeletonCard
//  A shimmer placeholder that matches the dimensions of a
//  ServiceCard for use during list loading states.
//
//  variant : card | list | detail | avatar-row
// ─────────────────────────────────────────────────────────────

function Bone({ className = '' }) {
  return (
    <div
      className={[
        'rounded-md bg-gray-200',
        'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
        'bg-[length:200%_100%]',
        'animate-[shimmer_1.6s_ease-in-out_infinite]',
        className,
      ].join(' ')}
      aria-hidden="true"
    />
  );
}

// ── Variants ─────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-[var(--shadow-card)]">
      {/* Image area */}
      <Bone className="w-full h-48" />
      <div className="p-4 space-y-3">
        {/* Category badge */}
        <Bone className="h-5 w-20 rounded-full" />
        {/* Title */}
        <Bone className="h-5 w-4/5" />
        {/* Vendor */}
        <Bone className="h-4 w-3/5" />
        {/* Rating row */}
        <div className="flex items-center gap-2">
          <Bone className="h-4 w-24" />
          <Bone className="h-4 w-12" />
        </div>
        {/* Price + button row */}
        <div className="flex items-center justify-between pt-1">
          <Bone className="h-6 w-28" />
          <Bone className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-[var(--shadow-card)] flex">
      {/* Thumbnail */}
      <Bone className="w-48 shrink-0 h-36" />
      <div className="flex-1 p-4 space-y-3">
        <Bone className="h-5 w-1/3 rounded-full" />
        <Bone className="h-5 w-3/4" />
        <Bone className="h-4 w-1/2" />
        <div className="flex items-center gap-4 pt-1">
          <Bone className="h-4 w-20" />
          <Bone className="h-4 w-16" />
        </div>
      </div>
      <div className="p-4 flex flex-col items-end justify-between shrink-0">
        <Bone className="h-6 w-24" />
        <Bone className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

function AvatarRowSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Bone className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Bone className="h-4 w-32" />
        <Bone className="h-3 w-24" />
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────

function SkeletonCard({ variant = 'card', count = 1 }) {
  const Skeleton =
    variant === 'list'       ? ListSkeleton       :
    variant === 'avatar-row' ? AvatarRowSkeleton  :
    CardSkeleton;

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} />
      ))}
    </>
  );
}

export default SkeletonCard;
