# Reference Design Language: Vibe, Aesthetic Philosophy & Visual Rhythm

> **Source**: Reference App (`C:\Projects\QLHK\QLHK-Client`)  
> **Extraction Type**: Visual Identity & Aesthetic Spec  
> **Invariant Principle**: Copy FORM only (vibe, density, warmth, surface layers, contrast). Keep TARGET app CONTENT intact.

---

## 1. Core Visual Persona: "Modern Civic Tech" (Hành Chính Hiện Đại)

The visual character of the reference app is not a generic SaaS or consumer app. It is designed as an **authoritative, high-efficiency, modern Vietnamese governmental management platform**:

| Dimension | Aesthetic Philosophy in QLHK | What to Avoid (Anti-patterns) |
| :--- | :--- | :--- |
| **Tone** | Authoritative, calm, structured, institutional yet warm and contemporary | Flashy consumer gradients, gamified badges, playful illustrations |
| **Primary Theme** | Emerald (`#059669` / `#10b981`) symbolizing civic governance, public records, and stability | Primary blue (`#2563eb`), purple, or multi-colored marketing palettes |
| **Density** | High information density for rapid scanning of records, data tables, and demographic parameters | Overly spaced mobile-first padding that requires excessive scrolling |
| **Surfaces** | Deep slate shell (`#0f172a` Header, `#020617` Sidebar) framing a clean, bright canvas (`#f8fafc` Light / `#090d16` Dark) | Monotone all-white or all-black flat canvases with zero contrast |
| **Geometry** | Balanced organic curvature: `rounded-3xl` (24px) for cards/islands, `rounded-xl` (12px) for controls | Razor-sharp 0px rectangular boxes or oversized pill-only layouts |
| **Borders** | Crisp, hairline borders (`border-slate-200/80` light, `border-slate-800` dark) for clear spatial boundaries | Borderless "floating" cards with excessive blurry drop shadows |

---

## 2. Palette & Contrast Architecture

### 2.1 The Two-Tone Foundation
The visual signature is driven by the stark contrast between the **App Frame** and the **Working Canvas**:
1. **The Frame (Global Header & Sidebar)**:
   - **Header**: `#0f172a` (`bg-slate-900`) across **both Light and Dark modes**. It acts as an anchored command banner.
   - **Sidebar**: `#020617` (`bg-slate-950`), even deeper than the header, grounding the navigation tree on the left.
2. **The Working Canvas (Main Content Area)**:
   - **Light Mode**: `#f8fafc` (`bg-slate-50`) background with pure white cards (`bg-white`).
   - **Dark Mode**: `#020617` or `#0f172a` background with `#0f172a` / `#1e293b` cards.

### 2.2 Color Emotion & Meaning
- **Emerald (`emerald-600` / `emerald-500`)**: The dominant brand color. Signifies verified state, official action, active selection, and primary progression.
- **Slate (`slate-50` to `slate-950`)**: The neutral backbone. Never pure grey (`#808080`) or pure black (`#000000`); always slate-tinted with subtle cool undertones.
- **Amber (`amber-500` / `amber-600`)**: Used exclusively for warnings, offline notices, and conflict resolution alerts.
- **Rose (`rose-600` / `rose-700`)**: Reserved strictly for irreversible destructive actions (permanent deletion) and network disconnect banners.
- **Sky / Blue (`sky-600` / `blue-600`)**: Used for Excel export and secondary informational badges.

---

## 3. Visual Rhythm: Hierarchy of Radii & Elevation

The interface establishes a clear tactile rhythm through consistent corner radii and subtle elevations:

```
[Window / Viewport]
  └── [Header Island / Main Card]: rounded-3xl (24px) + shadow-sm + border-slate-200/90
        ├── [Filter Bar / Toolbar]: rounded-2xl (16px) + border-slate-200/80
        │     ├── [Search Input / CustomSelect]: rounded-xl (12px) + border-slate-200
        │     └── [Action Buttons]: rounded-2xl (16px) or rounded-full
        └── [Data Table Container]: rounded-3xl (24px) + border-slate-200/90
              ├── [Table Header]: uppercase tracking-wider text-[11px] font-black
              ├── [Table Body Rows]: divide-slate-100, hover:bg-emerald-50/40
              │     ├── [Badges / Tags]: rounded-md (6px) or rounded-lg (8px)
              │     └── [Row Actions]: rounded-xl (12px) icon buttons
              └── [Pagination Footer]: px-5 py-3 border-t border-slate-200/80
```

---

## 4. Typography & Data Legibility

1. **Dual Typeface System**:
   - **Body & Headings**: `Be Vietnam Pro`, `system-ui`, `sans-serif`. Engineered for Vietnamese tonal marks (dấu hỏi, dấu ngã, dấu nặng, ư, ơ, đ) without clipping or line-height distortion.
   - **Numbers, Codes & Timestamps**: `JetBrains Mono`, `ui-monospace`, `monospace`. All dates, CCCD numbers, sequential STT indexes, and monetary figures must render in monospace with `font-bold` or `font-black` for instant column alignment.
2. **Text Weight Scaling**:
   - Section titles & Island headings: `font-black` (900) or `font-extrabold` (800) with `tracking-tight`.
   - Table column headers: `font-black` (900), `uppercase tracking-wider text-[11px]`.
   - Primary table labels / Person names: `font-bold` (700) `text-slate-900 dark:text-slate-100`.
   - Secondary labels & metadata: `font-medium` (500) or `font-semibold` (600) `text-slate-500 dark:text-slate-400 text-xs`.
   - Monospace figures: `font-mono font-black text-emerald-600 dark:text-emerald-400`.

---

## 5. Micro-Interactions & Transitions

1. **Subtle Tactile Feedback**:
   - Active click scale: `active:scale-[0.99]` on buttons, creating an authentic physical press feel without sluggishness.
   - Transitions: Fast and responsive `duration-150` or `duration-200` (`transition-colors`, `transition-all`).
2. **Entrance Animations**:
   - Page containers: `animate-in fade-in pb-10`.
   - Modals: `animate-in zoom-in-95 duration-150`.
   - Dropdown menus & popovers: `animate-in fade-in zoom-in-95 duration-100`.
   - Banner notifications: `animate-in slide-in-from-top duration-300`.
3. **Scrollbar Design**:
   - Thin 6px subtle scrollbar with `rounded-full` thumb in `slate-300 dark:slate-700`, blending seamlessly into the background.
