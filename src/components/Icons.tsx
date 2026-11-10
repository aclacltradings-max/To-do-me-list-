import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
};

export const PlusIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);

export const PencilIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);

export const TrashIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>
);

export const SunIcon = (p: IconProps) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);

export const MoonIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
);

export const WalletIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" /><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2Z" /><circle cx="16.5" cy="13.5" r="1.2" /></svg>
);

export const ArrowUpIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 19V5M5 12l7-7 7 7" /></svg>
);

export const ArrowDownIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
);

export const ScaleIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 3v18M7 7l-4 7h8L7 7ZM17 7l-4 7h8l-4-7Z" /><path d="M5 21h14" /></svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 11h18" /></svg>
);

export const TagIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M20.6 13.4 12 22l-9-9V4h9l8.6 8.6a1.4 1.4 0 0 1 0 2Z" /><circle cx="7.5" cy="7.5" r="1.2" /></svg>
);

export const ChartIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M3 3v18h18" /><path d="M7 15v3M12 10v8M17 6v12" /></svg>
);

export const FilterIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z" /></svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="m5 13 4 4L19 7" /></svg>
);

export const AlertIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
);

export const SparkIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8" /></svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);

export const TrendUpIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="m3 17 6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>
);

export const TrendDownIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="m3 7 6 6 4-4 8 8" /><path d="M14 17h7v-7" /></svg>
);

export const InboxIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M3 13h5l1.5 3h5L16 13h5" /><path d="M5 4h14l2 9v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l2-9Z" /></svg>
);
