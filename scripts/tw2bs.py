#!/usr/bin/env python3
"""Convert Tailwind class strings to Bootstrap 5 + theme utility classes."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"

KEEP = {
    "font-display", "num", "focus-ring", "card-hover", "live-dot", "pm-hero",
    "pm-hero-dots", "thin-scroll", "dark-scroll", "canvas-wash", "side-glow",
    "modal-pop", "overlay-fade", "drawer-in", "drawer-in-left", "toast-in",
    "bar-grow", "card-sheen", "spin-slow", "no-spin", "check-draw", "ring-pop",
    "shake", "group", "flex-1", "flex-none", "min-w-0", "place-items-center",
    "text-ink", "text-ink-2", "text-muted", "text-faint", "text-pmgreen",
    "text-pmblue", "text-pmviolet", "text-warn", "text-danger",
    "bg-ink", "bg-ink-2", "bg-canvas", "bg-pmgreen", "bg-pmgreen-soft",
    "bg-pmgreen-dark", "bg-warn", "bg-warn-soft", "bg-danger", "bg-danger-soft",
    "bg-pmblue", "bg-pmblue-soft", "bg-pmviolet", "bg-pmviolet-soft",
    "bg-pmteal-soft", "bg-line", "bg-white", "bg-transparent", "bg-current",
    "border-line", "border-ink", "border-pmgreen", "border-danger", "border-warn",
    "shadow-pm", "shadow-pm-lg", "tracking-tight", "tracking-wide", "tracking-wider",
    "leading-relaxed", "leading-tight", "rounded-full", "rounded-3xl",
    "divide-line", "text-white", "border", "border-0", "border-2", "border-dashed",
    "overflow-hidden", "overflow-auto", "overflow-x-auto", "overflow-y-auto",
    "overflow-visible", "text-center", "text-uppercase", "text-capitalize",
    "text-truncate", "mx-auto", "shadow-sm", "shadow", "shadow-lg",
    "top-0", "bottom-0", "visible", "invisible", "user-select-none",
    "text-nowrap", "lh-1", "pe-none", "pe-auto", "w-100", "h-100",
    "min-vh-100", "fw-bold", "fw-semibold", "fw-medium", "fw-normal",
    "d-flex", "d-inline-flex", "d-grid", "d-none", "d-block", "d-inline-block",
    "d-inline", "flex-row", "flex-column", "flex-wrap", "flex-nowrap",
    "align-items-center", "align-items-start", "align-items-end",
    "align-items-stretch", "align-items-baseline", "justify-content-between",
    "justify-content-center", "justify-content-end", "justify-content-start",
    "position-relative", "position-absolute", "position-fixed", "position-sticky",
    "ms-auto", "me-auto", "start-0", "end-0", "rounded", "rounded-1", "rounded-2",
    "rounded-3", "rounded-4", "rounded-5", "rounded-circle", "rounded-pill",
    "border-top", "border-bottom", "border-start", "border-end",
    "bg-dark", "text-decoration-underline", "flex-fill", "flex-shrink-0",
    "amber", "red", "in",
}

# Direct token remaps (no variants)
MAP = {
    "flex": "d-flex",
    "inline-flex": "d-inline-flex",
    "inline-block": "d-inline-block",
    "inline": "d-inline",
    "grid": "d-grid",
    "hidden": "d-none",
    "block": "d-block",
    "flex-col": "flex-column",
    "flex-row": "flex-row",
    "flex-wrap": "flex-wrap",
    "flex-nowrap": "flex-nowrap",
    "items-center": "align-items-center",
    "items-start": "align-items-start",
    "items-end": "align-items-end",
    "items-stretch": "align-items-stretch",
    "items-baseline": "align-items-baseline",
    "justify-between": "justify-content-between",
    "justify-center": "justify-content-center",
    "justify-end": "justify-content-end",
    "justify-start": "justify-content-start",
    "justify-around": "justify-content-around",
    "self-center": "align-self-center",
    "self-start": "align-self-start",
    "self-end": "align-self-end",
    "relative": "position-relative",
    "absolute": "position-absolute",
    "fixed": "position-fixed",
    "sticky": "position-sticky",
    "static": "position-static",
    "w-full": "w-100",
    "h-full": "h-100",
    "min-h-screen": "min-vh-100",
    "text-left": "text-start",
    "text-right": "text-end",
    "font-bold": "fw-bold",
    "font-semibold": "fw-semibold",
    "font-medium": "fw-medium",
    "font-normal": "fw-normal",
    "font-extrabold": "fw-extrabold",
    "uppercase": "text-uppercase",
    "capitalize": "text-capitalize",
    "truncate": "text-truncate",
    "whitespace-nowrap": "text-nowrap",
    "leading-none": "lh-1",
    "pointer-events-none": "pe-none",
    "pointer-events-auto": "pe-auto",
    "ml-auto": "ms-auto",
    "mr-auto": "me-auto",
    "ml-0": "ms-0",
    "mr-0": "me-0",
    "pl-0": "ps-0",
    "pr-0": "pe-0",
    "left-0": "start-0",
    "right-0": "end-0",
    "border-t": "border-top",
    "border-b": "border-bottom",
    "border-l": "border-start",
    "border-r": "border-end",
    "rounded-sm": "rounded-1",
    "rounded-md": "rounded-2",
    "rounded-lg": "rounded-3",
    "rounded-xl": "rounded-4",
    "rounded-2xl": "rounded-5",
    "underline": "text-decoration-underline",
    "list-none": "list-unstyled",
}

# Fractional spacing 0.5/1.5/2.5/3.5 → 05/15/25/35
FRAC = {"0.5": "05", "1.5": "15", "2.5": "25", "3.5": "35"}

SP_PREFIXES = (
    "p", "px", "py", "pt", "pb", "ps", "pe", "pl", "pr",
    "m", "mx", "my", "mt", "mb", "ms", "me", "ml", "mr",
    "gap", "gap-x", "gap-y",
    "w", "h",
)

FONT_SIZE = {
    "9.5px": "fs-95", "10px": "fs-10", "10.5px": "fs-105", "11px": "fs-11",
    "11.5px": "fs-115", "12px": "fs-12", "12.5px": "fs-125", "13px": "fs-13",
    "13.5px": "fs-135", "14px": "fs-14", "14.5px": "fs-145", "15px": "fs-15",
    "15.5px": "fs-155", "16px": "fs-16", "17px": "fs-17", "18px": "fs-18",
    "19px": "fs-19", "20px": "fs-20", "21px": "fs-21", "22px": "fs-22",
    "23px": "fs-23", "24px": "fs-24", "26px": "fs-26", "27px": "fs-27",
    "28px": "fs-28", "34px": "fs-34", "36px": "fs-36", "40px": "fs-40",
    "42px": "fs-42",
}

HEX_TEXT = {
    "#067647": "text-pmgreen-ink",
    "#93370d": "text-warn-ink",
    "#b42318": "text-danger-ink",
    "#175cd3": "text-pmblue-ink",
    "#475467": "text-slate",
    "#cdc2ff": "text-violet-200",
    "#07615a": "text-pmteal-ink",
    "#5925dc": "text-pmviolet-ink",
}
HEX_BG = {
    "#fafbfd": "bg-paper-2",
    "#f7f9fc": "bg-paper-3",
    "#d0d5dd": "bg-gray-300",
    "#eef0f4": "bg-gray-100",
    "#d3f1e2": "bg-pmgreen-hover",
    "#d92d20": "bg-danger-dark",
    "#0b1322": "bg-side",
}
HEX_BORDER = {
    "#c4c9d4": "border-gray-400",
    "#d0d5dd": "border-gray-300",
    "#d4dae4": "border-gray-350",
}

BP = {"sm": "sm", "md": "md", "lg": "lg", "xl": "xl", "2xl": "xxl"}

DISPLAY_MAP = {
    "flex": "flex", "inline-flex": "inline-flex", "grid": "grid",
    "hidden": "none", "block": "block", "inline-block": "inline-block",
    "inline": "inline", "none": "none",
}

used_custom: dict[str, str] = {}  # class -> css body (without braces), media optional stored separately
css_rules: list[tuple[str, str, str, str]] = []  # (media, parent, selector, decls)


def add_rule(selector: str, decls: str, media: str = "", parent: str = "") -> None:
    css_rules.append((media, parent, selector, decls))


def sanitize_arbitrary(s: str) -> str:
    s = s.replace("[", "").replace("]", "")
    s = s.replace("/", "-").replace(".", "-").replace(",", "-")
    s = s.replace("%", "p").replace("(", "").replace(")", "")
    s = s.replace("#", "").replace(" ", "")
    s = s.replace("_", "-")
    return s


def split_variants(token: str) -> tuple[list[str], str]:
    variants = []
    rest = token
    if rest.startswith("!"):
        rest = rest[1:]
        variants.append("important")
    while True:
        m = re.match(
            r"(sm|md|lg|xl|2xl|hover|focus|active|group-hover|placeholder|focus-visible|disabled):",
            rest,
        )
        if not m:
            break
        variants.append(m.group(1))
        rest = rest[m.end():]
    return variants, rest


def frac_spacing(core: str) -> str | None:
    """Convert mt-0.5 / gap-1.5 / p-3.5 / ml-1.5 etc."""
    m = re.match(r"^(-?)(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|w|h)-(\d+\.\d+)$", core)
    if not m:
        return None
    neg, pref, num = m.group(1), m.group(2), m.group(3)
    if num not in FRAC:
        return None
    # logical properties
    pref = {"pl": "ps", "pr": "pe", "ml": "ms", "mr": "me"}.get(pref, pref)
    cls = f"{pref}-{FRAC[num]}"
    if neg:
        # bootstrap negative: mt-n1 — for fractions use custom n05
        cls = f"{pref}-n{FRAC[num]}"
        add_rule(f".{cls}", f"{prop_for_spacing(pref)}: -{spacing_val(num)} !important")
    return cls


def spacing_val(num: str) -> str:
    table = {
        "0": "0", "0.5": "0.125rem", "1": "0.25rem", "1.5": "0.375rem",
        "2": "0.5rem", "2.5": "0.625rem", "3": "0.75rem", "3.5": "0.875rem",
        "4": "1rem", "5": "1.25rem", "6": "1.5rem", "7": "1.75rem",
        "8": "2rem", "9": "2.25rem", "10": "2.5rem", "11": "2.75rem",
        "12": "3rem", "14": "3.5rem", "16": "4rem", "20": "5rem",
        "24": "6rem", "28": "7rem",
    }
    return table.get(num, num)


def prop_for_spacing(pref: str) -> str:
    return {
        "p": "padding", "px": "padding-left; padding-right",  # handled specially
        "py": "padding-top; padding-bottom",
        "pt": "padding-top", "pb": "padding-bottom", "ps": "padding-left", "pe": "padding-right",
        "pl": "padding-left", "pr": "padding-right",
        "m": "margin", "mx": "margin-left; margin-right",
        "my": "margin-top; margin-bottom",
        "mt": "margin-top", "mb": "margin-bottom", "ms": "margin-left", "me": "margin-right",
        "ml": "margin-left", "mr": "margin-right",
        "gap": "gap", "gap-x": "column-gap", "gap-y": "row-gap",
        "w": "width", "h": "height",
    }.get(pref, pref)


def logical_space(core: str) -> str:
    m = re.match(r"^(-?)(ml|mr|pl|pr)-(\d+)$", core)
    if not m:
        return core
    neg, pref, num = m.group(1), m.group(2), m.group(3)
    pref2 = {"ml": "ms", "mr": "me", "pl": "ps", "pr": "pe"}[pref]
    if neg:
        return f"{pref2}-n{num}"
    return f"{pref2}-{num}"


def convert_core(core: str) -> str:
    if core in KEEP:
        return core
    if core in MAP:
        return MAP[core]

    # fractional spacing
    fs = frac_spacing(core)
    if fs:
        return fs

    # ml/mr/pl/pr integer → ms/me/ps/pe
    core2 = logical_space(core)
    if core2 != core:
        core = core2

    # negative margin -mt-1 → mt-n1
    m = re.match(r"^-((m[trblxyse]?|ms|me|ps|pe|p[trblxy]?))-(\d+)$", core)
    if m:
        return f"{m.group(1)}-n{m.group(3)}"

    # font size arbitrary
    m = re.match(r"^text-\[(.+)\]$", core)
    if m and m.group(1) in FONT_SIZE:
        return FONT_SIZE[m.group(1)]

    # hex text/bg/border
    m = re.match(r"^text-\[(#[0-9a-fA-F]{3,8})\]$", core)
    if m and m.group(1).lower() in {k.lower(): v for k, v in HEX_TEXT.items()}:
        key = m.group(1).lower()
        for k, v in HEX_TEXT.items():
            if k.lower() == key:
                return v
    m = re.match(r"^bg-\[(#[0-9a-fA-F]{3,8})\]$", core)
    if m:
        key = m.group(1).lower()
        for k, v in HEX_BG.items():
            if k.lower() == key:
                return v
    m = re.match(r"^border-\[(#[0-9a-fA-F]{3,8})\]$", core)
    if m:
        key = m.group(1).lower()
        for k, v in HEX_BORDER.items():
            if k.lower() == key:
                return v

    # opacity slash colors: bg-white/10, text-white/70, border-white/15, bg-pmgreen/30
    m = re.match(
        r"^(bg|text|border)-(white|black|ink|pmgreen|pmgreen-soft|pmgreen-dark|pmblue|pmblue-soft|pmviolet|warn|warn-soft|danger|danger-soft|line)/(\d+)$",
        core,
    )
    if m:
        kind, col, op = m.group(1), m.group(2), m.group(3)
        return f"{kind}-{col}-{op}"

    m = re.match(
        r"^(bg|text|border)-(white|black|ink|pmgreen|pmgreen-soft|pmblue|pmviolet|warn|danger)/\[0\.(\d+)\]$",
        core,
    )
    if m:
        kind, col, frac = m.group(1), m.group(2), m.group(3)
        if len(frac) == 1:
            frac = f"0{frac}"
        return f"{kind}-{col}-{frac}"

    m = re.match(r"^text-\[(#[0-9a-fA-F]+)\]/(\d+)$", core)
    if m:
        hexv = m.group(1).lower()
        op = m.group(2)
        for k, v in HEX_TEXT.items():
            if k.lower() == hexv:
                return f"{v}-{op}"
        return f"text-{hexv[1:]}-{op}"

    SHADOWS = {
        "shadow-[0_6px_16px_-6px_rgba(18,183,106,0.6)]": "shadow-green-cta",
        "shadow-[0_8px_20px_-8px_rgba(18,183,106,0.9)]": "shadow-green-cta",
        "shadow-[0_8px_18px_-8px_rgba(18,183,106,0.9)]": "shadow-green-btn",
        "shadow-[0_12px_28px_-10px_rgba(18,183,106,0.9)]": "shadow-green-check",
        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]": "shadow-inset-white",
    }
    if core in SHADOWS:
        return SHADOWS[core]

    # grid cols
    m = re.match(r"^grid-cols-(\d+)$", core)
    if m:
        return f"grid-cols-{m.group(1)}"

    m = re.match(r"^grid-cols-\[(.+)\]$", core)
    if m:
        inner = sanitize_arbitrary(m.group(1))
        return f"grid-cols-{inner}"

    m = re.match(r"^col-span-(\d+)$", core)
    if m:
        return f"col-span-{m.group(1)}"

    # space-y / divide
    m = re.match(r"^space-y-(\d+(?:\.\d+)?)$", core)
    if m:
        n = m.group(1)
        key = FRAC.get(n, n.replace(".", "-"))
        return f"space-y-{key}"

    m = re.match(r"^space-x-(\d+(?:\.\d+)?)$", core)
    if m:
        n = m.group(1)
        key = FRAC.get(n, n.replace(".", "-"))
        return f"space-x-{key}"

    if core == "divide-y":
        return "divide-y"

    # max/min width arbitrary
    m = re.match(r"^(max-w|min-w|max-h|min-h|w|h)-\[(.+)\]$", core)
    if m:
        return f"{m.group(1)}-{sanitize_arbitrary(m.group(2))}"

    # rounded arbitrary
    m = re.match(r"^rounded-\[(.+)\]$", core)
    if m:
        return f"rounded-{sanitize_arbitrary(m.group(1))}"

    m = re.match(r"^rounded-t-(.+)$", core)
    if m:
        return f"rounded-top-{m.group(1).replace('[', '').replace(']', '')}" if False else f"rounded-t-{m.group(1)}"

    # inset / translate / top/left with arbitrary
    m = re.match(r"^(-?)(inset|inset-x|inset-y|top|left|right|bottom|translate-x|translate-y)-\[(.+)\]$", core)
    if m:
        return f"{m.group(1)}{m.group(2)}-{sanitize_arbitrary(m.group(3))}".replace("--", "-n")

    # named like -translate-x-1/2
    m = re.match(r"^-translate-(x|y)-(.+)$", core)
    if m:
        return f"translate-{m.group(1)}-n{sanitize_arbitrary(m.group(2))}"

    m = re.match(r"^translate-(x|y)-(.+)$", core)
    if m:
        return f"translate-{m.group(1)}-{sanitize_arbitrary(m.group(2))}"

    # z-index
    m = re.match(r"^z-\[(.+)\]$", core)
    if m:
        return f"z-{sanitize_arbitrary(m.group(1))}"

    # tracking arbitrary
    m = re.match(r"^tracking-\[(.+)\]$", core)
    if m:
        return f"tracking-{sanitize_arbitrary(m.group(1))}"

    # leading arbitrary
    m = re.match(r"^leading-\[(.+)\]$", core)
    if m:
        return f"leading-{sanitize_arbitrary(m.group(1))}"

    # h-[5px] already covered by w|h-[ ]

    # duration / ease keep sanitized
    if core.startswith("duration-") or core.startswith("ease-") or core.startswith("delay-"):
        return core.replace("[", "").replace("]", "")

    if core.startswith("transition"):
        return core.replace("[", "").replace("]", "").replace("/", "-")

    # bg-gradient
    if core.startswith("bg-gradient-"):
        return core
    if core.startswith("from-") or core.startswith("to-") or core.startswith("via-"):
        return "g" + core if False else core.replace("[", "").replace("]", "").replace("/", "-").replace(".", "-")

    # scale
    m = re.match(r"^scale-(\d+)$", core)
    if m:
        return f"scale-{m.group(1)}"

    m = re.match(r"^scale-\[(.+)\]$", core)
    if m:
        return f"scale-{sanitize_arbitrary(m.group(1))}"

    # rotate
    m = re.match(r"^-?rotate-(.+)$", core)
    if m:
        return core.replace("[", "").replace("]", "").replace("/", "-")

    # opacity
    m = re.match(r"^opacity-(\d+)$", core)
    if m:
        return f"opacity-{m.group(1)}"
    m = re.match(r"^opacity-\[(.+)\]$", core)
    if m:
        return f"opacity-{sanitize_arbitrary(m.group(1))}"

    # ring
    if core.startswith("ring"):
        return core.replace("[", "").replace("]", "").replace("/", "-")

    # backdrop
    if core.startswith("backdrop-"):
        return core.replace("[", "").replace("]", "")

    # cursor
    if core.startswith("cursor-"):
        return core

    if core == "appearance-none":
        return "appearance-none"
    if core == "outline-none":
        return "outline-none"

    # min-w-[200px]
    # already handled

    # left-1/2 top-1/2
    m = re.match(r"^(left|right|top|bottom|inset)-(.+)$", core)
    if m and "/" in m.group(2):
        return f"{m.group(1)}-{sanitize_arbitrary(m.group(2))}"

    # -left-[26px]
    m = re.match(r"^-((left|right|top|bottom|mt|mb|ml|mr|ms|me|inset)-.+)$", core)
    if m:
        inner = convert_core(m.group(1))
        if not inner.startswith("-") and not "-n" in inner[2:6]:
            # prefix n
            return inner.replace("-", "-n", 1) if False else "n" + inner if False else (
                re.sub(r"^([a-z]+)-", r"\1-n", inner)
            )

    # w-auto h-auto
    if core in {"w-auto", "h-auto"}:
        return core  # bootstrap has these

    # grow shrink
    if core == "grow":
        return "flex-grow-1"
    if core == "shrink-0":
        return "flex-shrink-0"

    # object / fill
    if core.startswith("object-"):
        return core

    # scroll-mt
    if core.startswith("scroll-mt-"):
        return core.replace("[", "").replace("]", "")

    # decoration
    if core.startswith("decoration-"):
        return core

    # placeholder
    if core.startswith("placeholder:"):
        return core

    # leftover arbitrary
    if "[" in core:
        return sanitize_arbitrary(core) if False else core.replace("[", "").replace("]", "").replace("/", "-").replace(".", "-").replace(",", "-")

    return core


def apply_variants(variants: list[str], core_cls: str) -> str:
    """Return final class name; record CSS with variants applied."""
    bps = [v for v in variants if v in BP]
    states = [v for v in variants if v not in BP and v != "important"]

    # Bootstrap display responsive: sm:flex → d-sm-flex
    if not states and len(bps) == 1 and core_cls in {
        "d-flex", "d-inline-flex", "d-grid", "d-none", "d-block",
        "d-inline-block", "d-inline",
    }:
        disp = {
            "d-flex": "flex", "d-inline-flex": "inline-flex", "d-grid": "grid",
            "d-none": "none", "d-block": "block", "d-inline-block": "inline-block",
            "d-inline": "inline",
        }[core_cls]
        infix = BP[bps[0]]
        return f"d-{infix}-{disp}"

    # flex-sm-row / flex-lg-column
    if not states and len(bps) == 1 and core_cls in {"flex-row", "flex-column", "flex-wrap"}:
        infix = BP[bps[0]]
        tail = {"flex-row": "row", "flex-column": "column", "flex-wrap": "wrap"}[core_cls]
        return f"flex-{infix}-{tail}"

    # align-items-sm-center
    if not states and len(bps) == 1 and core_cls.startswith("align-items-"):
        infix = BP[bps[0]]
        rest = core_cls[len("align-items-"):]
        return f"align-items-{infix}-{rest}"

    if not states and len(bps) == 1 and core_cls.startswith("justify-content-"):
        infix = BP[bps[0]]
        rest = core_cls[len("justify-content-"):]
        return f"justify-content-{infix}-{rest}"

    # font size responsive sm-fs-19
    prefixes = []
    for v in variants:
        if v in BP:
            prefixes.append(BP[v])
        elif v == "group-hover":
            prefixes.append("group-hover")
        elif v in {"hover", "focus", "active", "placeholder", "focus-visible", "disabled"}:
            prefixes.append(v)

    if not prefixes:
        return core_cls

    return "-".join(prefixes + [core_cls])


def convert_token(token: str) -> str:
    if not token or token in KEEP:
        return token
    # skip obvious non-classes
    if token.startswith("http") or "/" in token and not re.search(r"(bg|text|border|from|to|via|opacity|scale|translate|inset)-", token) and "[" not in token:
        if token.count("/") == 1 and not token[0].isalpha():
            pass
    variants, core = split_variants(token)
    if not core:
        return token
    new_core = convert_core(core)
    if not variants:
        return new_core
    return apply_variants(variants, new_core)


TW_HINT = re.compile(
    r"^(?:!?(?:sm|md|lg|xl|2xl|hover|focus|active|group-hover|placeholder|focus-visible|disabled):)*"
    r"(?:-?(?:flex|grid|hidden|block|inline|items-|justify-|self-|content-|place-|"
    r"p-|px-|py-|pt-|pb-|pl-|pr-|ps-|pe-|m-|mx-|my-|mt-|mb-|ml-|mr-|ms-|me-|"
    r"gap-|w-|h-|min-w|min-h|max-w|max-h|text-|bg-|border|rounded|font-|leading-|"
    r"tracking-|shadow|overflow|truncate|uppercase|capitalize|relative|absolute|"
    r"fixed|sticky|inset-|top-|left-|right-|bottom-|z-|opacity-|cursor-|outline|"
    r"ring-|divide-|space-|col-span|row-span|pointer-events|select-|appearance-|"
    r"backdrop-|transition|duration-|ease-|delay-|scale-|rotate-|translate-|skew-|"
    r"from-|to-|via-|decoration-|underline|whitespace-|break-|object-|grow|shrink|"
    r"basis-|order-|sr-only|visible|invisible|pe-|fw-|d-|align-|justify-content|"
    r"position-|ms-|me-|start-|end-|lh-|min-vh|w-100|h-100|flex-column|flex-row|"
    r"rounded-|border-|bg-gradient|no-spin|focus-ring|card-|live-dot|pm-hero|"
    r"thin-scroll|dark-scroll|canvas-wash|side-glow|modal-pop|overlay-fade|"
    r"drawer-in|toast-in|bar-grow|card-sheen|spin-slow|check-draw|ring-pop|"
    r"shake|group|font-display|num|tracking-|leading-|shadow-pm|text-ink|"
    r"text-muted|text-faint|text-pm|bg-ink|bg-canvas|bg-pm|bg-warn|bg-danger|"
    r"border-line|min-w-0|flex-1|flex-none|place-items|grid-cols|sm:|md:|lg:|xl:|"
    r"hover:|focus:|active:))"
)


def is_tw_token(t: str) -> bool:
    if not t or len(t) > 80:
        return False
    if t in KEEP or t in MAP:
        return True
    if t.startswith("sm:") or t.startswith("md:") or t.startswith("lg:") or t.startswith("xl:"):
        return True
    if t.startswith("hover:") or t.startswith("focus:") or t.startswith("active:") or t.startswith("group"):
        return True
    if "[" in t and re.match(r"^-?[a-z]", t):
        return True
    return bool(TW_HINT.match(t))


def is_class_string(s: str) -> bool:
    if not s or s.startswith(".") or s.startswith("/") or s.startswith("http"):
        return False
    if "\n" in s and len(s) > 200:
        return False
    toks = s.split()
    if not toks:
        return False
    tw = sum(1 for t in toks if is_tw_token(t))
    if tw == 0:
        return False
    # majority or single token class
    if len(toks) == 1:
        return True
    return tw / len(toks) >= 0.4


def convert_class_string(s: str) -> str:
    # preserve spacing structure
    parts = re.split(r"(\s+)", s)
    out = []
    for p in parts:
        if not p or p.isspace():
            out.append(p)
        else:
            out.append(convert_token(p))
    return "".join(out)


def convert_template(s: str) -> str:
    # convert static pieces around ${}
    pieces = re.split(r"(\$\{[^}]*\})", s)
    out = []
    for piece in pieces:
        if piece.startswith("${"):
            out.append(piece)
        else:
            out.append(convert_class_string(piece) if is_class_string(piece) or any(is_tw_token(t) for t in piece.split()) else piece)
    return "".join(out)


STR_DQ = re.compile(r'"([^"\\]*(?:\\.[^"\\]*)*)"')
STR_SQ = re.compile(r"'([^'\\]*(?:\\.[^'\\]*)*)'")
STR_BQ = re.compile(r"`([^`\\]*(?:\\.[^`\\]*)*)`")


def convert_file_text(text: str) -> str:
    def repl_dq(m: re.Match) -> str:
        inner = m.group(1)
        if is_class_string(inner):
            return '"' + convert_class_string(inner) + '"'
        return m.group(0)

    def repl_sq(m: re.Match) -> str:
        inner = m.group(1)
        if is_class_string(inner):
            return "'" + convert_class_string(inner) + "'"
        return m.group(0)

    def repl_bq(m: re.Match) -> str:
        inner = m.group(1)
        converted = convert_template(inner)
        return "`" + converted + "`"

    # Don't touch import specifiers: from "..."
    # Process line by line for imports
    lines = text.split("\n")
    out_lines = []
    for line in lines:
        stripped = line.lstrip()
        if stripped.startswith("import ") or stripped.startswith("export ") and " from " in stripped:
            out_lines.append(line)
            continue
        # convert strings on the line
        # careful with already processed
        line2 = STR_DQ.sub(repl_dq, line)
        # only single quotes that aren't after import
        line2 = STR_SQ.sub(repl_sq, line2)
        line2 = STR_BQ.sub(repl_bq, line2)
        out_lines.append(line2)
    return "\n".join(out_lines)


def main() -> None:
    files = list(SRC.rglob("*.tsx")) + list(SRC.rglob("*.ts"))
    skip = {"routeTree.gen.ts"}
    n = 0
    for p in files:
        if p.name in skip:
            continue
        if "node_modules" in str(p):
            continue
        orig = p.read_text()
        new = convert_file_text(orig)
        if new != orig:
            p.write_text(new)
            n += 1
            print(f"converted {p.relative_to(ROOT)}")
    print(f"updated {n} files")


if __name__ == "__main__":
    main()
