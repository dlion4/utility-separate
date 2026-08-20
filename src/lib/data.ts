import type { IconName } from "../components/ui/icons";
import type { Tone } from "../components/ui";

/* ============================ helpers ============================ */

export const kes = (n: number, dp = 0) => `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
export const num = (n: number, dp = 1) => n.toLocaleString("en-KE", { minimumFractionDigits: dp, maximumFractionDigits: dp });
export const TARIFF = 14.1;

/* ============================ utilities ============================ */

export type UtilityId = "electricity" | "water" | "tv" | "internet" | "airtime" | "gas" | "solar" | "health";

export type Bundle = { id: string; name: string; price: number; note: string; badge?: string };

export type Utility = {
  id: UtilityId;
  name: string;
  short: string;
  icon: IconName;
  tone: Tone;
  color: string;
  soft: string;
  accountLabel: string;
  mode: "meter" | "account" | "phone" | "bundle";
  unitLabel?: string;
  min: number;
  max: number;
  quick: number[];
  providers: { id: string; name: string; note: string; fee: number }[];
  bundles?: Bundle[];
  successMode: "token" | "credit" | "bundle";
  blurb: string;
};

export const UTILITIES: Utility[] = [
  {
    id: "electricity",
    name: "Electricity",
    short: "KPLC tokens & bills",
    icon: "bolt",
    tone: "warning",
    color: "#f79009",
    soft: "warn-soft",
    accountLabel: "Meter number",
    mode: "meter",
    unitLabel: "kWh",
    min: 100,
    max: 35000,
    quick: [500, 1000, 2000, 3000, 5000],
    providers: [
      { id: "kplc", name: "KPLC", note: "Prepaid & postpaid · instant token", fee: 0 },
      { id: "kplc-post", name: "KPLC Postpaid", note: "Monthly bill settlement", fee: 25 },
    ],
    successMode: "token",
    blurb: "Tokens land in under 8 seconds, 24/7. Postpaid bills cleared same day.",
  },
  {
    id: "water",
    name: "Water",
    short: "NCWSC & county water",
    icon: "droplet",
    tone: "info",
    color: "#2e90fa",
    soft: "pmblue-soft",
    accountLabel: "Account number",
    mode: "account",
    min: 100,
    max: 60000,
    quick: [500, 1000, 2000, 3200, 5000],
    providers: [
      { id: "ncwsc", name: "NCWSC", note: "Nairobi Water & Sewerage", fee: 0 },
      { id: "county", name: "County Water", note: "Kiambu · Machakos · Nakuru", fee: 22 },
    ],
    successMode: "credit",
    blurb: "Settle Nairobi Water and county bills with instant receipt validation.",
  },
  {
    id: "tv",
    name: "TV & Streaming",
    short: "DSTV, GOtv, Showmax",
    icon: "tv",
    tone: "violet",
    color: "#7a5af8",
    soft: "pmviolet-soft",
    accountLabel: "Smartcard / account",
    mode: "bundle",
    min: 200,
    max: 30000,
    quick: [900, 1650, 3600, 6500, 11500],
    providers: [
      { id: "dstv", name: "DSTV", note: "MultiChoice Kenya", fee: 0 },
      { id: "gotv", name: "GOtv", note: "MultiChoice Kenya", fee: 0 },
      { id: "startimes", name: "Startimes", note: "Digital terrestrial", fee: 15 },
      { id: "showmax", name: "Showmax", note: "Streaming subscription", fee: 0 },
    ],
    bundles: [
      { id: "gotv-lite", name: "GOtv Lite", price: 900, note: "40+ channels · 1 month" },
      { id: "gotv-plus", name: "GOtv Plus", price: 1650, note: "60+ channels · 1 month", badge: "Popular" },
      { id: "dstv-access", name: "DSTV Access", price: 3600, note: "90+ channels · 1 month" },
      { id: "dstv-compact", name: "DSTV Compact", price: 6500, note: "Sports + series · 1 month", badge: "Best value" },
      { id: "dstv-premium", name: "DSTV Premium", price: 11500, note: "All channels + SuperSport · 1 month" },
    ],
    successMode: "bundle",
    blurb: "Renew DSTV, GOtv, Startimes or Showmax and keep the living room live.",
  },
  {
    id: "internet",
    name: "Internet",
    short: "Fibre & data plans",
    icon: "wifi",
    tone: "teal",
    color: "#0e9384",
    soft: "pmteal-soft",
    accountLabel: "Account / service ID",
    mode: "bundle",
    min: 100,
    max: 40000,
    quick: [1000, 2500, 4500, 5999, 9500],
    providers: [
      { id: "saf-fibre", name: "Safaricom Fibre", note: "Home fibre monthly", fee: 0 },
      { id: "zuku", name: "Zuku Fibre", note: "Home fibre monthly", fee: 0 },
      { id: "jamii", name: "Jamii Telecom", note: "Faiba home", fee: 0 },
    ],
    bundles: [
      { id: "fibre-5", name: "Fibre 5 Mbps", price: 2500, note: "Unlimited · 1 month" },
      { id: "fibre-10", name: "Fibre 10 Mbps", price: 4500, note: "Unlimited · 1 month", badge: "Popular" },
      { id: "fibre-20", name: "Fibre 20 Mbps", price: 5999, note: "Unlimited · router included" },
      { id: "fibre-40", name: "Fibre 40 Mbps", price: 9500, note: "Gaming grade · static IP" },
    ],
    successMode: "bundle",
    blurb: "Never lose a work call — renew home fibre before the deadline hits.",
  },
  {
    id: "airtime",
    name: "Airtime & Data",
    short: "Safaricom, Airtel, Telkom",
    icon: "phone",
    tone: "success",
    color: "#12b76a",
    soft: "pmgreen-soft",
    accountLabel: "Phone number",
    mode: "phone",
    min: 10,
    max: 20000,
    quick: [50, 100, 200, 500, 1000],
    providers: [
      { id: "safaricom", name: "Safaricom", note: "M-Pesa linked · 2% bonus", fee: 0 },
      { id: "airtel", name: "Airtel", note: "Instant top-up", fee: 0 },
      { id: "telkom", name: "Telkom", note: "Instant top-up", fee: 0 },
    ],
    bundles: [
      { id: "at-100", name: "KES 100 airtime", price: 100, note: "No expiry · calls & SMS" },
      { id: "dt-500", name: "5GB + 300min", price: 500, note: "30 days validity", badge: "Popular" },
      { id: "dt-1000", name: "12GB + 600min", price: 1000, note: "30 days validity" },
      { id: "dt-2000", name: "25GB unlimited nights", price: 2000, note: "30 days validity", badge: "Best value" },
    ],
    successMode: "bundle",
    blurb: "Top up any line, or buy data bundles with bonus airtime on Safaricom.",
  },
  {
    id: "gas",
    name: "LPG Gas",
    short: "Cylinder refills",
    icon: "flame",
    tone: "danger",
    color: "#f04438",
    soft: "danger-soft",
    accountLabel: "Cylinder / customer ID",
    mode: "bundle",
    min: 200,
    max: 12000,
    quick: [1400, 2200, 2850, 3600, 5200],
    providers: [
      { id: "kgas", name: "K-Gas", note: "Free delivery Nairobi", fee: 0 },
      { id: "pro-gas", name: "Pro Gas", note: "Same-day delivery", fee: 0 },
      { id: "total", name: "Total Energies", note: "6kg · 13kg · 50kg", fee: 0 },
    ],
    bundles: [
      { id: "g6", name: "6 kg refill", price: 1400, note: "Delivery included" },
      { id: "g13", name: "13 kg refill", price: 2850, note: "Most popular size", badge: "Popular" },
      { id: "g50", name: "50 kg refill", price: 7200, note: "Commercial grade" },
    ],
    successMode: "bundle",
    blurb: "Order refills with free delivery and track the rider to your gate.",
  },
  {
    id: "solar",
    name: "Solar & PAYG",
    short: "M-KOPA, d.light",
    icon: "sun",
    tone: "warning",
    color: "#f79009",
    soft: "warn-soft",
    accountLabel: "Device / paygo ID",
    mode: "account",
    min: 50,
    max: 10000,
    quick: [150, 300, 500, 1000, 2000],
    providers: [
      { id: "mkopa", name: "M-KOPA", note: "Solar home system", fee: 0 },
      { id: "dlight", name: "d.light", note: "Pay-as-you-go solar", fee: 0 },
    ],
    successMode: "credit",
    blurb: "Keep the lights and the pay-as-you-go solar unit unlocked daily.",
  },
  {
    id: "health",
    name: "Health & Insurance",
    short: "SHA, insurance premiums",
    icon: "shield",
    tone: "info",
    color: "#2e90fa",
    soft: "pmblue-soft",
    accountLabel: "Member / policy number",
    mode: "account",
    min: 150,
    max: 80000,
    quick: [500, 1500, 3000, 6000, 12000],
    providers: [
      { id: "sha", name: "SHA (formerly NHIF)", note: "Monthly contribution", fee: 0 },
      { id: "jubilee", name: "Jubilee Health", note: "Premium settlement", fee: 30 },
    ],
    successMode: "credit",
    blurb: "Pay SHA contributions and insurance premiums with instant cover confirmation.",
  },
];

export const utilityOf = (id: UtilityId) => UTILITIES.find((u) => u.id === id)!;

/* ============================ saved accounts ============================ */

export type Account = {
  id: string;
  utility: UtilityId;
  providerId: string;
  provider: string;
  nickname: string;
  ref: string;
  holder?: string;
  lastAmount: number;
  lastDate: string;
  lastUnits?: string;
  autopay: boolean;
  dueInDays?: number;
  dueAmount?: number;
  favourite?: boolean;
};

export const ACCOUNTS: Account[] = [
  {
    id: "acc-1",
    utility: "electricity",
    providerId: "kplc",
    provider: "KPLC",
    nickname: "Home · Karen",
    ref: "14825739",
    holder: "J. Mwangi",
    lastAmount: 3000,
    lastDate: "27 Jun 2025",
    lastUnits: "141.8 kWh",
    autopay: true,
    dueInDays: 4,
    dueAmount: 2500,
    favourite: true,
  },
  {
    id: "acc-2",
    utility: "electricity",
    providerId: "kplc",
    provider: "KPLC",
    nickname: "Shop · Westlands",
    ref: "22901847",
    holder: "PayMo Hardware",
    lastAmount: 8400,
    lastDate: "15 Jun 2025",
    lastUnits: "595.7 kWh",
    autopay: false,
    dueInDays: 2,
    dueAmount: 6000,
  },
  {
    id: "acc-3",
    utility: "water",
    providerId: "ncwsc",
    provider: "NCWSC",
    nickname: "Home water",
    ref: "290081",
    holder: "J. Mwangi",
    lastAmount: 3200,
    lastDate: "25 Jun 2025",
    autopay: true,
    dueInDays: 9,
    dueAmount: 2800,
  },
  {
    id: "acc-4",
    utility: "tv",
    providerId: "dstv",
    provider: "DSTV",
    nickname: "Family TV",
    ref: "20491867421",
    lastAmount: 11500,
    lastDate: "24 Jun 2025",
    autopay: false,
    dueInDays: 6,
    dueAmount: 11500,
  },
  {
    id: "acc-5",
    utility: "internet",
    providerId: "saf-fibre",
    provider: "Safaricom Fibre",
    nickname: "Office fibre",
    ref: "SF-40812",
    lastAmount: 5999,
    lastDate: "20 Jun 2025",
    autopay: true,
    dueInDays: 3,
    dueAmount: 5999,
    favourite: true,
  },
  {
    id: "acc-6",
    utility: "airtime",
    providerId: "safaricom",
    provider: "Safaricom",
    nickname: "Personal line",
    ref: "0712***890",
    lastAmount: 1000,
    lastDate: "22 Jun 2025",
    autopay: true,
  },
  {
    id: "acc-7",
    utility: "solar",
    providerId: "mkopa",
    provider: "M-KOPA",
    nickname: "Ushago solar",
    ref: "MK-44821",
    lastAmount: 150,
    lastDate: "08 Jun 2025",
    autopay: false,
    dueInDays: 1,
    dueAmount: 150,
  },
  {
    id: "acc-8",
    utility: "gas",
    providerId: "kgas",
    provider: "K-Gas",
    nickname: "Kitchen 13kg",
    ref: "13KG-2201",
    lastAmount: 2850,
    lastDate: "18 Jun 2025",
    autopay: false,
  },
];

/* ============================ payment methods ============================ */

export type PayMethod = { id: string; name: string; sub: string; fee: number; icon: IconName; tone: Tone; balance?: number; primary?: boolean };

export const PAY_METHODS: PayMethod[] = [
  { id: "mpesa", name: "M-Pesa", sub: "STK Push to 0712 *** 890", fee: 0, icon: "smartphone", tone: "success", primary: true },
  { id: "wallet", name: "PayMo Wallet", sub: "Instant · no charge", fee: 0, icon: "wallet", tone: "info", balance: 24500 },
  { id: "bank", name: "Bank Transfer", sub: "Equity ····4521", fee: 25, icon: "bank", tone: "violet" },
  { id: "card", name: "Visa Card", sub: "···· 4417 · 3D Secure", fee: 32.5, icon: "card", tone: "muted" },
];

/* ============================ transactions ============================ */

export type Txn = {
  id: string;
  date: string;
  iso: string;
  time: string;
  utility: UtilityId;
  provider: string;
  account: string;
  nickname: string;
  amount: number;
  fee: number;
  method: string;
  ref: string;
  status: "Success" | "Pending" | "Failed";
  units?: string;
  token?: string;
  note?: string;
};

export const TXNS: Txn[] = [
  { id: "t1", date: "27 Jun", iso: "2025-06-27", time: "14:32", utility: "electricity", provider: "KPLC", account: "14825739", nickname: "Home · Karen", amount: 3000, fee: 0, method: "M-Pesa", ref: "TXN-8834", status: "Success", units: "141.8 kWh", token: "4729-8301-5624-9173-8402" },
  { id: "t2", date: "25 Jun", iso: "2025-06-25", time: "09:14", utility: "water", provider: "NCWSC", account: "290081", nickname: "Home water", amount: 3200, fee: 0, method: "Wallet", ref: "TXN-7721", status: "Success", note: "Bill cleared · receipt emailed" },
  { id: "t3", date: "24 Jun", iso: "2025-06-24", time: "19:02", utility: "tv", provider: "DSTV", account: "20491867421", nickname: "Family TV", amount: 11500, fee: 0, method: "M-Pesa", ref: "TXN-6609", status: "Success", note: "Premium package · 30 days" },
  { id: "t4", date: "22 Jun", iso: "2025-06-22", time: "07:48", utility: "airtime", provider: "Safaricom", account: "0712***890", nickname: "Personal line", amount: 1000, fee: 0, method: "M-Pesa", ref: "TXN-5501", status: "Success", note: "12GB + 600min bundle" },
  { id: "t5", date: "20 Jun", iso: "2025-06-20", time: "12:20", utility: "internet", provider: "Safaricom Fibre", account: "SF-40812", nickname: "Office fibre", amount: 5999, fee: 25, method: "Bank", ref: "TXN-4490", status: "Pending", note: "Awaiting bank confirmation" },
  { id: "t6", date: "18 Jun", iso: "2025-06-18", time: "16:41", utility: "gas", provider: "K-Gas", account: "13KG-2201", nickname: "Kitchen 13kg", amount: 2850, fee: 0, method: "M-Pesa", ref: "TXN-3382", status: "Success", note: "Delivered 18 Jun · 17:10" },
  { id: "t7", date: "15 Jun", iso: "2025-06-15", time: "11:05", utility: "electricity", provider: "KPLC", account: "22901847", nickname: "Shop · Westlands", amount: 8400, fee: 25, method: "Bank", ref: "TXN-2274", status: "Success", units: "595.7 kWh", token: "1188-4420-9937-2210-6675" },
  { id: "t8", date: "12 Jun", iso: "2025-06-12", time: "20:26", utility: "tv", provider: "GOtv", account: "GOT-7712", nickname: "Dining room", amount: 1650, fee: 0, method: "M-Pesa", ref: "TXN-1168", status: "Success", note: "GOtv Plus · 30 days" },
  { id: "t9", date: "10 Jun", iso: "2025-06-10", time: "08:15", utility: "electricity", provider: "KPLC", account: "14825739", nickname: "Home · Karen", amount: 3000, fee: 0, method: "M-Pesa", ref: "TXN-0054", status: "Success", units: "141.8 kWh", token: "5510-2298-7412-0093-3384" },
  { id: "t10", date: "08 Jun", iso: "2025-06-08", time: "13:55", utility: "solar", provider: "M-KOPA", account: "MK-44821", nickname: "Ushago solar", amount: 150, fee: 0, method: "M-Pesa", ref: "TXN-9948", status: "Success", note: "7 days unlocked" },
  { id: "t11", date: "05 Jun", iso: "2025-06-05", time: "10:32", utility: "health", provider: "SHA", account: "SHA-33021", nickname: "Family cover", amount: 1500, fee: 0, method: "Wallet", ref: "TXN-9801", status: "Success", note: "Cover active to 05 Jul" },
  { id: "t12", date: "03 Jun", iso: "2025-06-03", time: "18:07", utility: "water", provider: "NCWSC", account: "290081", nickname: "Home water", amount: 1800, fee: 0, method: "M-Pesa", ref: "TXN-9650", status: "Failed", note: "Insufficient M-Pesa balance" },
  { id: "t13", date: "01 Jun", iso: "2025-06-01", time: "07:22", utility: "internet", provider: "Safaricom Fibre", account: "SF-40812", nickname: "Office fibre", amount: 5999, fee: 0, method: "Wallet", ref: "TXN-9512", status: "Success", note: "Fibre 20 · 30 days" },
  { id: "t14", date: "29 May", iso: "2025-05-29", time: "15:44", utility: "airtime", provider: "Airtel", account: "0733***211", nickname: "Team line", amount: 500, fee: 0, method: "M-Pesa", ref: "TXN-9377", status: "Success", note: "Airtime top-up" },
];

/* ============================ analytics ============================ */

export const MONTHLY: { month: string; electricity: number; water: number; tv: number; internet: number; other: number }[] = [
  { month: "Nov", electricity: 6200, water: 2400, tv: 8600, internet: 5999, other: 2100 },
  { month: "Dec", electricity: 8400, water: 3100, tv: 11500, internet: 5999, other: 3400 },
  { month: "Jan", electricity: 9100, water: 2900, tv: 11500, internet: 5999, other: 1900 },
  { month: "Feb", electricity: 7600, water: 2600, tv: 6500, internet: 5999, other: 2300 },
  { month: "Mar", electricity: 6900, water: 2500, tv: 6500, internet: 5999, other: 1500 },
  { month: "Apr", electricity: 7200, water: 2800, tv: 8600, internet: 5999, other: 2850 },
  { month: "May", electricity: 8100, water: 3000, tv: 11500, internet: 5999, other: 1650 },
  { month: "Jun", electricity: 14400, water: 3200, tv: 13150, internet: 5999, other: 4500 },
];

export const SPEND_BY_UTILITY = [
  { label: "Electricity", value: 14400, color: "#f79009" },
  { label: "TV", value: 13150, color: "#7a5af8" },
  { label: "Internet", value: 5999, color: "#0e9384" },
  { label: "Water", value: 3200, color: "#2e90fa" },
  { label: "Other", value: 4500, color: "#98a2b3" },
];

export const UNITS_TREND = [138, 152, 141, 126, 133, 148, 144, 168];
export const SPEND_TREND = [31200, 34800, 33900, 27600, 25400, 30400, 33600, 41249];

/* ============================ schedules & autopay ============================ */

export type Schedule = { id: string; account: Account; label: string; date: string; amount: number; dueInDays: number; method: string };

export const SCHEDULES: Schedule[] = [
  { id: "s1", account: ACCOUNTS[6], label: "M-KOPA daily unlock", date: "28 Jun", amount: 150, dueInDays: 1, method: "M-Pesa" },
  { id: "s2", account: ACCOUNTS[1], label: "Shop meter top-up", date: "29 Jun", amount: 6000, dueInDays: 2, method: "Bank" },
  { id: "s3", account: ACCOUNTS[4], label: "Office fibre renewal", date: "30 Jun", amount: 5999, dueInDays: 3, method: "Wallet" },
  { id: "s4", account: ACCOUNTS[0], label: "Home token auto-buy", date: "01 Jul", amount: 2500, dueInDays: 4, method: "M-Pesa" },
  { id: "s5", account: ACCOUNTS[3], label: "DSTV Premium", date: "03 Jul", amount: 11500, dueInDays: 6, method: "M-Pesa" },
  { id: "s6", account: ACCOUNTS[2], label: "Nairobi Water bill", date: "06 Jul", amount: 2800, dueInDays: 9, method: "Wallet" },
];

export const AUTOPAY_RULES = [
  { id: "r1", account: ACCOUNTS[0], trigger: "When units < 10 kWh", amount: 2500, method: "M-Pesa", on: true },
  { id: "r2", account: ACCOUNTS[2], trigger: "Monthly on the 6th", amount: 2800, method: "Wallet", on: true },
  { id: "r3", account: ACCOUNTS[4], trigger: "Monthly on the 30th", amount: 5999, method: "Wallet", on: true },
  { id: "r4", account: ACCOUNTS[5], trigger: "Weekly · Monday 8am", amount: 500, method: "M-Pesa", on: false },
];

/* ============================ notifications ============================ */

export type Notice = { id: string; title: string; body: string; time: string; tone: Tone; icon: IconName; cta?: string };

export const NOTICES: Notice[] = [
  { id: "n1", title: "Units running low", body: "Home · Karen meter 14825739 has 8.4 kWh left — roughly 2 days at your usage.", time: "12 min ago", tone: "warning", icon: "bolt", cta: "Buy tokens" },
  { id: "n2", title: "Bank transfer pending", body: "TXN-4490 for KES 5,999 is awaiting Equity confirmation. Usually clears in 10 min.", time: "1 hr ago", tone: "info", icon: "clock", cta: "View receipt" },
  { id: "n3", title: "Autopay executed", body: "KES 1,000 airtime bought for 0712 *** 890. Bonus 2% applied.", time: "Yesterday", tone: "success", icon: "repeat" },
  { id: "n4", title: "Tariff update", body: "ERC index pass-through changed to KES 14.10/kWh for Jul–Sep 2025.", time: "2 days ago", tone: "muted", icon: "info", cta: "See tariff" },
  { id: "n5", title: "Payment failed", body: "NCWSC KES 1,800 failed — insufficient M-Pesa balance. Retry from wallet?", time: "3 Jun", tone: "danger", icon: "alert", cta: "Retry payment" },
];

/* ============================ module registry (sidebar) ============================ */

export type NavItem = { key: string; label: string; icon: IconName; badge?: string; target?: string; to?: string };

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { key: "home", label: "Dashboard", icon: "home", to: "/utility" },
      { key: "insights", label: "Spend insights", icon: "chart", to: "/utility", target: "sec-insights" },
      { key: "history", label: "Transactions", icon: "receipt", to: "/utility", target: "sec-history" },
      { key: "autopay", label: "Autopay rules", icon: "repeat", to: "/utility", target: "sec-autopay" },
      { key: "bills", label: "Bill reminders", icon: "bell", to: "/utility", target: "sec-alerts" },
    ],
  },
  {
    title: "Utilities",
    items: [
      { key: "electricity", label: "Electricity", icon: "bolt", to: "/utility/electricity" },
      { key: "water", label: "Water", icon: "droplet", to: "/utility/water" },
      { key: "internet", label: "Internet", icon: "wifi", to: "/utility/internet" },
      { key: "mobile-money", label: "Mobile Money", icon: "phone", to: "/utility/mobile-money" },
      { key: "recurring", label: "Household bills", icon: "building", to: "/utility/recurring" },
    ],
  },
  {
    title: "Settings",
    items: [
      { key: "utilities", label: "Settings", icon: "settings", to: "/utility/settings", badge: "3.6" },
    ],
  },
];

export const MODULES: Record<string, { title: string; icon: IconName; blurb: string; points: string[] }> = {
  wallet: { title: "Wallet & top-up", icon: "wallet", blurb: "Hold funds in PayMo Wallet and pay utilities with zero fees.", points: ["Free top-up from M-Pesa or bank", "Zero-fee utility payments", "Instant refunds on failed payments"] },
  cards: { title: "Cards", icon: "card", blurb: "Issue virtual and physical KES / USD cards for team spend.", points: ["Instant virtual cards", "Per-card limits & merchants", "3D Secure on every charge"] },
  bank: { title: "Bank accounts", icon: "bank", blurb: "Link bank accounts for direct debit and higher limits.", points: ["Equity, KCB, NCBA, Co-op", "Verify in 2 minutes", "Direct debit mandates"] },
  team: { title: "Team & roles", icon: "users", blurb: "Invite staff, set approval limits and audit every utility payment.", points: ["Role-based permissions", "Maker–checker approvals", "Full activity trail"] },
  invoices: { title: "Invoices", icon: "file", blurb: "Bill tenants for utilities and reconcile collections automatically.", points: ["Auto-split by meter", "Send via SMS & email", "Reconcile to the shilling"] },
  support: { title: "Help centre", icon: "lifebuoy", blurb: "Guides, tariff explainers and 24/7 human support on WhatsApp.", points: ["Live chat in 60 seconds", "Tariff & token guides", "Dispute resolution SLA"] },
  utilities: { title: "Utilities", icon: "bolt", blurb: "The command centre you are viewing right now.", points: ["8 utility categories", "Autopay & reminders", "Full receipt history"] },
};

/* ============================ FAQ ============================ */

export const FAQ = [
  { q: "How fast do KPLC tokens arrive?", a: "Tokens are generated the moment M-Pesa or wallet settlement clears — median delivery is 6 seconds. Every token is SMS'd and stored in your receipt history." },
  { q: "What happens if a payment fails?", a: "Nothing is lost. Failed amounts are reversed automatically to the source (M-Pesa instantly, bank within 24 hrs) and you get a reversal reference you can track in the transaction drawer." },
  { q: "Can I set a spending cap per meter?", a: "Yes. Open Autopay rules, choose the account and set a monthly cap. PayMo will pause the rule and notify you when 80% of the cap is reached." },
  { q: "Do you support postpaid KPLC bills?", a: "Yes — choose KPLC Postpaid in the electricity flow, enter the account number and we pull the outstanding balance before you pay." },
  { q: "How is the estimated unit count calculated?", a: "We use the current ERC pass-through tariff of KES 14.10/kWh plus fixed charges. The final units on your token are set by KPLC and may differ slightly." },
];
