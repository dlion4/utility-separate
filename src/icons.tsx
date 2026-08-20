import type { ReactNode } from "react";

export type IconName =
  | "home"
  | "grid"
  | "bolt"
  | "droplet"
  | "tv"
  | "wifi"
  | "flame"
  | "sun"
  | "phone"
  | "smartphone"
  | "wallet"
  | "bank"
  | "card"
  | "receipt"
  | "users"
  | "chart"
  | "shield"
  | "settings"
  | "lifebuoy"
  | "logout"
  | "menu"
  | "x"
  | "search"
  | "bell"
  | "chevron-down"
  | "chevron-right"
  | "chevron-left"
  | "chevron-up"
  | "arrow-right"
  | "arrow-up-right"
  | "arrow-down"
  | "plus"
  | "check"
  | "check-circle"
  | "copy"
  | "download"
  | "upload"
  | "share"
  | "printer"
  | "filter"
  | "calendar"
  | "clock"
  | "refresh"
  | "star"
  | "alert"
  | "info"
  | "eye"
  | "eye-off"
  | "edit"
  | "trash"
  | "external"
  | "lock"
  | "key"
  | "sliders"
  | "trend-up"
  | "trend-down"
  | "repeat"
  | "mail"
  | "map-pin"
  | "user"
  | "more"
  | "sparkle"
  | "send"
  | "tag"
  | "help"
  | "gauge"
  | "file"
  | "sort"
  | "target"
  | "list"
  | "building"
  | "play"
  | "pause"
  | "pause-circle";

const P: Record<IconName, ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5M9.5 20v-6h5v6" />,
  grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
  bolt: <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" />,
  droplet: <path d="M12 3s6 6.2 6 10.4A6 6 0 0 1 6 13.4C6 9.2 12 3 12 3z" />,
  tv: (
    <>
      <rect x="2.5" y="6" width="19" height="12.5" rx="2" />
      <path d="M8 3l4 3 4-3M9 21.5h6" />
    </>
  ),
  wifi: (
    <>
      <path d="M2.5 9a14 14 0 0 1 19 0M5.8 12.4a9.3 9.3 0 0 1 12.4 0M9 15.8a4.6 4.6 0 0 1 6 0" />
      <circle cx="12" cy="19.3" r="1.1" />
    </>
  ),
  flame: <path d="M12 2.5c4 4.2 6.5 6.7 6.5 10.3A6.5 6.5 0 0 1 5.5 12.8c0-1.5.6-2.8 1.6-4 .2 1.3 1 2.2 2 2.2 1.2 0 2-1 2-2.6 0-1.8-.7-3.5-2.1-5.9z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
    </>
  ),
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z" />,
  smartphone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  wallet: (
    <>
      <path d="M3.5 8.5A2 2 0 0 1 5.5 6.5h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
      <path d="M3.5 10.5h17M16 14.5h1.5" />
    </>
  ),
  bank: (
    <>
      <path d="M3.5 9.5 12 4l8.5 5.5M5.5 10.5V19h13v-8.5M9 19v-5h6v5M3 19h18" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19M6 14.5h3.5" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 2.5h12v19l-3-1.8-3 1.8-3-1.8-3 1.8z" />
      <path d="M9.5 8h5M9.5 12h5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 5.2a3.2 3.2 0 0 1 0 6M18 20c0-2.3-.7-3.9-2-5" />
    </>
  ),
  chart: <path d="M4 20V9M10 20V4M16 20v-7M22 20H2" />,
  shield: <path d="M12 2.8 4.5 5.8v6c0 4.4 3.1 8.1 7.5 9.4 4.4-1.3 7.5-5 7.5-9.4v-6z" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.4 7.8l1.9 1.1M17.7 15.1l1.9 1.1M4.4 16.2l1.9-1.1M17.7 8.9l1.9-1.1" />
    </>
  ),
  lifebuoy: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M5.6 5.6l3.8 3.8M14.6 14.6l3.8 3.8M18.4 5.6l-3.8 3.8M9.4 14.6l-3.8 3.8" />
    </>
  ),
  logout: <path d="M15 4.5H19a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 19 19.5h-4M10 8l-4 4 4 4M6 12h10" />,
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  bell: <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10zM10 19a2.2 2.2 0 0 0 4 0" />,
  "chevron-down": <path d="M6 9.5l6 6 6-6" />,
  "chevron-right": <path d="M9.5 6l6 6-6 6" />,
  "chevron-left": <path d="M14.5 6l-6 6 6 6" />,
  "chevron-up": <path d="M6 14.5l6-6 6 6" />,
  "arrow-right": <path d="M4 12h15M13 6l6 6-6 6" />,
  "arrow-up-right": <path d="M7 17 17 7M9 7h8v8" />,
  "arrow-down": <path d="M12 4v15M6 13l6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.8 2.8L16.3 9.5" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 6.5A2.5 2.5 0 0 0 12.5 4H6.5A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15" />
    </>
  ),
  download: <path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15" />,
  upload: <path d="M12 15.5v-11M7.5 8.5 12 4l4.5 4.5M4.5 19.5h15" />,
  share: (
    <>
      <path d="M12 3.5v11M8 7l4-3.5L16 7" />
      <path d="M5 13v6.5h14V13" />
    </>
  ),
  printer: (
    <>
      <path d="M7 8.5V3.5h10v5M7 17.5H5a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 5 9.5h14a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-2" />
      <rect x="7" y="14" width="10" height="6.5" rx="1" />
    </>
  ),
  filter: <path d="M3.5 5.5h17l-6.5 8v6l-4-2.5v-3.5z" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.3l3.5 2" />
    </>
  ),
  refresh: <path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" />,
  star: <path d="m12 3.5 2.7 5.6 6 .9-4.4 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.3 10l6-.9z" />,
  alert: (
    <>
      <path d="M12 3.8 2.8 19.5h18.4z" />
      <path d="M12 9.5v4.2M12 16.6v.4" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.8v.4" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "eye-off": <path d="M4 4l16 16M9.9 5.9A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.7 3.5M6.3 8.2A17 17 0 0 0 2.5 12S6 18.5 12 18.5c.8 0 1.5-.1 2.2-.3M9.9 9.9a3 3 0 0 0 4.2 4.2" />,
  edit: <path d="M4.5 19.5h4L20 8a2.1 2.1 0 0 0-3-3L5.5 16.5zM15 5.5 18.5 9" />,
  trash: <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 10.5v6M14 10.5v6" />,
  external: <path d="M14 4.5h5.5V10M19 5l-8 8M18 14v5.5H4.5V6H10" />,
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="3.5" />
      <path d="M10.5 10.5 20 20M16 16l-2 2M18 14l-2 2" />
    </>
  ),
  sliders: <path d="M4 7h10M18 7h2M4 17h2M10 17h10M16 4.5v5M8 14.5v5" />,
  "trend-up": <path d="M3.5 16.5 9 11l3.5 3.5L20 7M20 12V7h-5" />,
  "trend-down": <path d="M3.5 7.5 9 13l3.5-3.5L20 17M20 12V17h-5" />,
  repeat: <path d="M4 9V7.5A2.5 2.5 0 0 1 6.5 5H19l-3-3M20 15v1.5a2.5 2.5 0 0 1-2.5 2.5H5l3 3" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.8 6.5 8.2 6 8.2-6" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M12 21.5s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z" />
      <circle cx="12" cy="10.3" r="2.6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5" />
    </>
  ),
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18.5" cy="12" r="1.4" />
    </>
  ),
  sparkle: <path d="M12 3.5 13.8 9l5.7 1.8L13.8 12.6 12 18.5l-1.8-5.9L4.5 10.8 10.2 9zM18.5 16l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />,
  send: <path d="M21 3.5 10.5 14M21 3.5l-6.5 17-4-6.5-6.5-4z" />,
  tag: (
    <>
      <path d="M4 11 11 4l9 .5.5 9-7 7z" />
      <circle cx="15.5" cy="8.5" r="1.4" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.3A2.6 2.6 0 0 1 14.6 10c0 1.8-2.6 2-2.6 3.8M12 17v.4" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 17a8.5 8.5 0 1 1 16 0" />
      <path d="M12 17l4-5" />
    </>
  ),
  file: (
    <>
      <path d="M6 3.5h7l5 5v12H6z" />
      <path d="M13 3.5v5h5M9 13h6M9 16.5h4" />
    </>
  ),
  sort: <path d="M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l3 3M17 20l-3-3" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  list: <path d="M8 6.5h12M8 12h12M8 17.5h12M4 6.5h.4M4 12h.4M4 17.5h.4" />,
  building: (
    <>
      <path d="M4 20.5V5.5l8-2.5v17.5M12 20.5h8V9l-8-2.5" />
      <path d="M7 9h2M7 13h2M7 17h2M15 12h2M15 16h2" />
    </>
  ),
  play: <path d="M7 4.5 19 12 7 19.5z" />,
  pause: <path d="M9 5v14M15 5v14" />,
  "pause-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.8v6.4M14 8.8v6.4" />
    </>
  ),
};

export function Icon({ name, size = 18, className, strokeWidth = 1.7 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {P[name]}
    </svg>
  );
}

export const iconNames = Object.keys(P) as IconName[];
