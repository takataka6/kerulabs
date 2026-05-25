import type { ReactNode } from "react";

function BaseIcon({
  children,
  className = "",
  viewBox = "0 0 24 24",
  strokeWidth = 1.8,
}: {
  children: ReactNode;
  className?: string;
  viewBox?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function GlossaryPageIcon({ className = "" }: { className?: string }) {
  return (
    <BaseIcon className={className} viewBox="0 0 64 64">
      <path d="M18 14h24a6 6 0 0 1 6 6v26a4 4 0 0 0-4-4H20a6 6 0 0 0-6 6V20a6 6 0 0 1 6-6Z" />
      <path d="M20 42h24" opacity="0.55" />
      <path d="M24 24h14M24 30h10" opacity="0.8" />
      <path d="M40 23h8v10h-8l-4 4V27l4-4Z" />
      <path d="M42.5 26.5h3M42.5 29.5h2" opacity="0.8" />
    </BaseIcon>
  );
}

export function TacticsPageIcon({ className = "" }: { className?: string }) {
  return (
    <BaseIcon className={className} viewBox="0 0 64 64">
      <rect x="10" y="12" width="44" height="40" rx="6" opacity="0.9" />
      <path d="M32 12v40M10 32h44" opacity="0.55" />
      <circle cx="20" cy="22" r="2.5" />
      <circle cx="26" cy="40" r="2.5" />
      <circle cx="44" cy="24" r="2.5" />
      <circle cx="40" cy="42" r="2.5" />
      <path d="M22.5 22h10l9.5 2" opacity="0.8" />
      <path d="M28.5 40 35 34l5 8" opacity="0.8" />
      <path d="m35 34 4-1-1 4" opacity="0.8" />
    </BaseIcon>
  );
}

export function ManualPageIcon({ className = "" }: { className?: string }) {
  return (
    <BaseIcon className={className} viewBox="0 0 64 64">
      <path d="M18 16h18a6 6 0 0 1 6 6v28H22a6 6 0 0 0-6 6V22a6 6 0 0 1 6-6Z" />
      <path d="M42 22h4a4 4 0 0 1 4 4v24H30a6 6 0 0 0-6 6" opacity="0.8" />
      <path d="M24 26h10M24 32h12M24 38h8" opacity="0.75" />
      <path d="m38 18 7 7" opacity="0.55" />
    </BaseIcon>
  );
}

export function CodeLabPageIcon({ className = "" }: { className?: string }) {
  return (
    <BaseIcon className={className} viewBox="0 0 64 64">
      <path d="M20 18 10 32l10 14" />
      <path d="M44 18 54 32 44 46" />
      <path d="m36 14-8 36" opacity="0.9" />
      <path d="M24 24h18" opacity="0.45" />
      <path d="M22 40h18" opacity="0.45" />
      <circle cx="46" cy="24" r="3" opacity="0.8" />
    </BaseIcon>
  );
}

export function ImportIcon({ className = "" }: { className?: string }) {
  return (
    <BaseIcon className={className}>
      <path d="M12 20V10" />
      <path d="m8.5 16.5 3.5 3.5 3.5-3.5" />
      <path d="M5 9.5V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3.5" opacity="0.7" />
    </BaseIcon>
  );
}

export function CreateIcon({ className = "" }: { className?: string }) {
  return (
    <BaseIcon className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
      <path d="M7 19h10" opacity="0.5" />
    </BaseIcon>
  );
}

export function ExportIcon({ className = "" }: { className?: string }) {
  return (
    <BaseIcon className={className}>
      <path d="M12 4v10" />
      <path d="m8.5 7.5 3.5-3.5 3.5 3.5" />
      <path d="M5 14.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5" opacity="0.7" />
    </BaseIcon>
  );
}

export function EditIcon({ className = "" }: { className?: string }) {
  return (
    <BaseIcon className={className}>
      <path d="m15 6 3 3" />
      <path d="M6 18l3.5-.7L18 8.8 15.2 6 6.7 14.5 6 18Z" />
      <path d="M13.5 7.5 16.5 10.5" opacity="0.7" />
    </BaseIcon>
  );
}

export function DeleteIcon({ className = "" }: { className?: string }) {
  return (
    <BaseIcon className={className}>
      <path d="M6 7h12" />
      <path d="M9 7V5.5h6V7" opacity="0.7" />
      <path d="M8 7.5v10a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 17.5v-10" />
      <path d="M10.5 10.5v5M13.5 10.5v5" opacity="0.7" />
    </BaseIcon>
  );
}

export function PluginIcon({ className = "" }: { className?: string }) {
  return (
    <BaseIcon className={className}>
      <path d="M9 4.5v3" />
      <path d="M15 4.5v3" />
      <path d="M8 8.5H7a2 2 0 0 0-2 2v2h4v7h6v-7h4v-2a2 2 0 0 0-2-2h-1" />
      <path d="M9 8.5h6" opacity="0.75" />
    </BaseIcon>
  );
}
