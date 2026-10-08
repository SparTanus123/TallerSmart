import type { ReactNode, SVGProps } from 'react';

/**
 * TallerSmart icon set — 24px grid, 1.5px stroke, round caps.
 * Each icon has a `line` layer and an optional `fill` layer that is
 * rendered at 16% opacity when `duotone` is set (active / selected state).
 */
type IconDef = { line: ReactNode; fill?: ReactNode };

const ICONS = {
  dashboard: {
    line: <><rect x="3.5" y="3.5" width="7" height="9" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="5" rx="1.5" /><rect x="13.5" y="11.5" width="7" height="9" rx="1.5" /><rect x="3.5" y="15.5" width="7" height="5" rx="1.5" /></>,
    fill: <><rect x="3.5" y="3.5" width="7" height="9" rx="1.5" /><rect x="13.5" y="11.5" width="7" height="9" rx="1.5" /></>,
  },
  board: {
    line: <><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="M9.5 3.5v17M15 3.5v17" /><path d="M5.8 7h1.6M11.4 7h1.6M11.4 10h1.6M17 7h1.6" /></>,
    fill: <path d="M3.5 6a2.5 2.5 0 0 1 2.5-2.5h3.5v17H6A2.5 2.5 0 0 1 3.5 18z" />,
  },
  car: {
    line: <><path d="M3.5 16.5v-3.1c0-.5.3-.9.8-1.1l2.4-.8 2.3-3.1c.4-.5 1-.9 1.7-.9h3.9c.6 0 1.2.3 1.6.8l2.6 3.2 1.4.4c.6.2 1 .7 1 1.3v3.3" /><path d="M9 16.5h6M3.5 16.5h1.4M19.1 16.5h1.4" /><circle cx="7" cy="16.5" r="2" /><circle cx="17" cy="16.5" r="2" /></>,
    fill: <path d="M6.7 11.5l2.3-3.1c.4-.5 1-.9 1.7-.9h3.9c.6 0 1.2.3 1.6.8l2.6 3.2z" />,
  },
  pickup: {
    line: <><path d="M3 16.5V13h8.5V8.5h4.2c.4 0 .8.2 1 .5l2.6 3.7h1.2c.6 0 1 .4 1 1v2.8" /><path d="M9 16.5h6M19.1 16.5h1.4M3 16.5h1.9" /><circle cx="7" cy="16.5" r="2" /><circle cx="17" cy="16.5" r="2" /></>,
    fill: <path d="M11.5 8.5h4.2c.4 0 .8.2 1 .5l2.6 3.7h-7.8z" />,
  },
  users: {
    line: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5" /><path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c1.9.7 3.2 2.5 3.5 5.2" /></>,
    fill: <circle cx="9" cy="8" r="3.5" />,
  },
  catalog: {
    line: <><path d="M12 3.5 20 7.5v9L12 20.5 4 16.5v-9z" /><path d="M4 7.5 12 11.5 20 7.5M12 11.5v9" /></>,
    fill: <path d="M4 7.5 12 11.5v9L4 16.5z" />,
  },
  spark: {
    // Spark plug + spark — TallerSmart AI glyph
    line: <><path d="M11 1.75h2v2h-2z" /><path d="M10 3.75h4l.6 5.25H9.4z" /><path d="M8.5 9h7v3h-7z" /><path d="M10 12h4v3.5h-4z" /><path d="M12 15.5V18h2.5" /><path d="M17.5 16.25l2-1M18 18.75h2.5M17.5 21.25l2 1" /></>,
    fill: <><path d="M10 3.75h4l.6 5.25H9.4z" /><path d="M8.5 9h7v3h-7z" /></>,
  },
  code: {
    line: <><path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15" /></>,
  },
  search: { line: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.4-4.4" /></> },
  bell: {
    line: <><path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
    fill: <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z" />,
  },
  plus: { line: <path d="M12 5v14M5 12h14" /> },
  x: { line: <path d="M6 6l12 12M18 6 6 18" /> },
  check: { line: <path d="m5 12.5 4.5 4.5L19 7.5" /> },
  chevronLeft: { line: <path d="m14.5 6-6 6 6 6" /> },
  chevronRight: { line: <path d="m9.5 6 6 6-6 6" /> },
  chevronDown: { line: <path d="m6 9.5 6 6 6-6" /> },
  arrowRight: { line: <path d="M5 12h14M13 6l6 6-6 6" /> },
  arrowUpRight: { line: <path d="M7 17 17 7M8 7h9v9" /> },
  trendUp: { line: <path d="m3.5 16.5 6-6 4 4 7-7M15 7.5h5.5V13" /> },
  trendDown: { line: <path d="m3.5 7.5 6 6 4-4 7 7M15 16.5h5.5V11" /> },
  clock: { line: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>, fill: <circle cx="12" cy="12" r="8.5" /> },
  wrench: {
    line: <path d="M14.5 4a5 5 0 0 0-4.6 6.9l-6 6a1.9 1.9 0 0 0 2.7 2.7l6-6A5 5 0 0 0 19.5 9l-3 1.5-2.4-.6-.6-2.4L15 4.5z" />,
  },
  part: {
    // gear
    line: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1 5.3 5.3" /><circle cx="12" cy="12" r="6.5" /></>,
  },
  dots: { line: <><circle cx="6" cy="12" r=".9" /><circle cx="12" cy="12" r=".9" /><circle cx="18" cy="12" r=".9" /></> },
  columns: { line: <><rect x="3.5" y="4.5" width="5" height="15" rx="1.5" /><rect x="10.5" y="4.5" width="5" height="10" rx="1.5" /><rect x="17.5" y="4.5" width="3" height="7" rx="1.5" /></> },
  list: { line: <path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12M4 6.5h.5M4 12h.5M4 17.5h.5" /> },
  alert: { line: <><path d="M12 3.5 21.5 20h-19z" /><path d="M12 10v4.5M12 17.2v.3" /></>, fill: <path d="M12 3.5 21.5 20h-19z" /> },
  mic: { line: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></> },
  refresh: { line: <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4" /> },
  play: { line: <path d="M7.5 5v14l11-7z" />, fill: <path d="M7.5 5v14l11-7z" /> },
  pause: { line: <path d="M8.5 5.5v13M15.5 5.5v13" /> },
  camera: { line: <><path d="M4 8.5h3.5L9 6h6l1.5 2.5H20v10.5H4z" /><circle cx="12" cy="13.5" r="3.2" /></> },
  phone: { line: <path d="M5 4h3.5l1.5 4-2 1.5a10 10 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4z" /> },
  gauge: { line: <><path d="M4.5 17.5a8.5 8.5 0 1 1 15 0" /><path d="m12 13.5 4-4.5" /><circle cx="12" cy="14" r="1.2" /></> },
  thumbUp: { line: <path d="M7.5 20.5h-3v-10h3zM7.5 10.5l3.5-7c1.4 0 2.5 1.1 2.5 2.5v3h5.2a1.8 1.8 0 0 1 1.8 2.1l-1.2 7.4a2 2 0 0 1-2 1.5H7.5" /> },
  thumbDown: { line: <path d="M7.5 3.5h-3v10h3zM7.5 13.5l3.5 7c1.4 0 2.5-1.1 2.5-2.5v-3h5.2a1.8 1.8 0 0 0 1.8-2.1l-1.2-7.4a2 2 0 0 0-2-1.5H7.5" /> },
  file: { line: <><path d="M6 3.5h8l4 4v13H6z" /><path d="M14 3.5v4h4M9 12h6M9 15.5h6" /></> },
  user: { line: <><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" /></> },
  sidebar: { line: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M9.5 4.5v15" /></> },
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  duotone?: boolean;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, duotone = false, strokeWidth, ...rest }: IconProps) {
  const def: IconDef = ICONS[name];
  const sw = strokeWidth ?? (size <= 16 ? 1.75 : 1.5);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {duotone && def.fill && (
        <g fill="currentColor" fillOpacity={0.16} stroke="none">
          {def.fill}
        </g>
      )}
      {def.line}
    </svg>
  );
}
