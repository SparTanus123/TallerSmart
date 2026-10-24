"use client"

import type { ReactNode, SVGProps } from "react"

export type IconName = "dashboard" | "board" | "car" | "catalog" | "spark" | "code" | "search" | "bell" | "plus" | "x" | "check" | "arrowRight" | "clock" | "part" | "dots" | "columns" | "list" | "alert" | "refresh" | "sidebar" | "user"

const ICONS: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="9" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
      <rect x="3.5" y="15.5" width="7" height="5" rx="1.5" />
    </>
  ),
  board: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M9.5 3.5v17M15 3.5v17" />
    </>
  ),
  car: (
    <>
      <path d="m4 15 1-4 3-4h8l3 4 1 4v3h-2m-12 0H4v-3Z" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  catalog: (
    <>
      <path d="m12 3 8 4v10l-8 4-8-4V7z" />
      <path d="m4 7 8 4 8-4M12 11v10" />
    </>
  ),
  spark: (
    <>
      <path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7z" />
      <path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
    </>
  ),
  code: (
    <>
      <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 5l-4 14" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  part: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="8" />
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
    </>
  ),
  dots: (
    <>
      <circle cx="6" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="18" cy="12" r="1" />
    </>
  ),
  columns: (
    <>
      <rect x="3.5" y="4.5" width="5" height="15" rx="1.5" />
      <rect x="10.5" y="4.5" width="5" height="10" rx="1.5" />
      <rect x="17.5" y="4.5" width="3" height="7" rx="1.5" />
    </>
  ),
  list: (
    <path d="M8.5 6.5h12m-12 5.5h12m-12 5.5h12M4 6.5h.5M4 12h.5M4 17.5h.5" />
  ),
  alert: (
    <>
      <path d="M12 3.5 21.5 20h-19z" />
      <path d="M12 10v4.5m0 2.7v.3" />
    </>
  ),
  refresh: (
    <path d="M20 7v5h-5M4 17v-5h5m9-2a6.5 6.5 0 0 0-11-2L4 12m16 0-2 4a6.5 6.5 0 0 1-11 2" />
  ),
  sidebar: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M9.5 4.5v15" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" />
    </>
  ),
}

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName
  size?: number
  duotone?: boolean
  strokeWidth?: number
}

export function Icon({
  name,
  size = 20,
  duotone = false,
  strokeWidth,
  ...rest
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? (size <= 16 ? 1.75 : 1.5)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-duotone={duotone || undefined}
      {...rest}
    >
      {ICONS[name]}
    </svg>
  )
}
