export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-dark-green/15 pb-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-green sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 font-body text-sm text-ink/60">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
