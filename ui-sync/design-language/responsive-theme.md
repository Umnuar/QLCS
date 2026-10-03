# Reference Design Language: Responsive Behavior & Theme System

> **Source**: Reference App (`C:\Projects\QLHK\QLHK-Client`)  
> **Extraction Type**: Viewport & Theme Implementation Specification  
> **Invariant Principle**: Copy FORM only. Keep TARGET app CONTENT intact.

---

## 1. Viewport Breakpoint Hierarchy & Adaptive Layout

The reference layout is engineered to scale seamlessly across 4 core viewport bands:

| Viewport Tier | Width Range | Sidebar Behavior | Header Island | Data Table & Sticky Cols | Filter Bar |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Desktop Wide** | `≥ 1366px` | Expanded (`w-64`, 256px), static left | Horizontal (`flex-row justify-between`) | Left (Checkbox/STT) & Right (Actions) pinned sticky with drop shadows | Single line flex-wrap |
| **Laptop / Small Desktop** | `1024px – 1365px` | Expandable / Collapsible (`w-64` or `w-16`) | Horizontal with wrapping action buttons | Sticky columns active, horizontal table scroll enabled | Flex-wrap with responsive search bar |
| **Tablet** | `768px – 1023px` | Collapsed to icon rail (`w-16`, 64px) or toggle drawer | Action buttons stack under title | Horizontal scroll container (`overflow-x-auto`), sticky columns preserve touch targets | Search bar full width or `w-64`, dropdowns wrap |
| **Mobile** | `360px – 767px` | Hidden behind hamburger drawer overlay (`fixed inset-0 z-50`) | Vertical stack (`flex-col items-stretch gap-4`) | Full table horizontal scroll with minimum column widths (`min-w-[120px]`), sticky action pinned | Controls stack 100% width or 2-column grid |

---

## 2. Adaptive Responsive Rules

### 2.1 Header Island Responsiveness
```tsx
<div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
  {/* Left: Titles & Badges */}
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2.5 flex-wrap">
      {/* Scope Badge */}
      <span className="px-3 py-1 rounded-xl text-xs font-black ...">...</span>
      {/* Title */}
      <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
        ...
      </h2>
    </div>
    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">...</p>
  </div>

  {/* Right: Actions */}
  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
    {/* Buttons wrap naturally on smaller screens */}
  </div>
</div>
```

### 2.2 Table Container & Sticky Columns Responsiveness
Tables are enclosed in an `overflow-x-auto` wrapper with crisp borders:
- Minimum table width: `w-full min-w-[800px]`.
- Sticky Left Column:
  `sticky left-0 z-10 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] bg-white dark:bg-slate-900 group-hover:bg-slate-50`
- Sticky Right Column:
  `sticky right-0 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] bg-white dark:bg-slate-900 group-hover:bg-slate-50`
- Border collapse: `border-collapse text-xs` with `divide-y divide-slate-100 dark:divide-slate-800/80`.

### 2.3 Modal Responsiveness
- Desktop: `max-w-2xl` to `max-w-4xl`, centered, `rounded-3xl` (24px).
- Mobile (`< 640px`): `w-full max-h-[90vh] rounded-2xl m-2 overflow-y-auto`.

---

## 3. Dark / Light Mode System Architecture

### 3.1 The Invariant Shell Rule
A cornerstone of the reference app's visual identity:
> **The Global Header (`#0f172a` / `bg-slate-900`) and the Global Sidebar (`#020617` / `bg-slate-950`) NEVER CHANGE into light mode colors.**  
> They remain deeply anchored in slate-900 / slate-950 in **both Light and Dark modes**.

Only the **Working Canvas** (the main scrollable area, page backgrounds, cards, tables, inputs, and modals) transitions between Light and Dark:

| Component Surface | Light Mode Token | Dark Mode Token |
| :--- | :--- | :--- |
| **Global Header** | `bg-slate-900 text-white` *(Fixed)* | `bg-slate-900 text-white` *(Fixed)* |
| **Global Sidebar** | `bg-slate-950 text-slate-300` *(Fixed)* | `bg-slate-950 text-slate-300` *(Fixed)* |
| **Canvas Background** | `bg-slate-50` (`#f8fafc`) | `bg-slate-950` or `bg-slate-900` (`#020617`) |
| **Card / Island Surface** | `bg-white` (`#ffffff`) | `bg-slate-900` (`#0f172a`) |
| **Secondary Container / Toolbar** | `bg-slate-50` or `bg-white` | `bg-slate-800/50` or `bg-slate-800` |
| **Card Borders** | `border-slate-200/90` | `border-slate-800` |
| **Dividers & Table Borders** | `divide-slate-100 border-slate-100` | `divide-slate-800/80 border-slate-800/60` |
| **Input Fields** | `bg-slate-50 border-slate-200 text-slate-900` | `bg-slate-800 border-slate-700 text-slate-100` |
| **Modal Surface** | `bg-white border-slate-200` | `bg-slate-900 border-slate-800` |
| **Primary Text** | `text-slate-900` | `text-slate-100` / `text-white` |
| **Muted Text** | `text-slate-500` | `text-slate-400` |

### 3.2 Theme State Implementation
1. Stored in `localStorage` (`qlcs_theme`): `'light' | 'dark'`.
2. Applied dynamically to `document.documentElement.classList`:
   - `dark` class added when dark mode is enabled.
   - `dark` class removed when light mode is enabled.
3. Header Theme Toggle Button:
```tsx
<button
  type="button"
  onClick={toggleTheme}
  aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
  title={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
>
  {theme === "dark" ? (
    <Sun className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
  ) : (
    <Moon className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
  )}
</button>
```

---

## 4. Zoom & Display Density Scaling

The reference header provides a zoom control pill (`80%`, `90%`, `100%`, `110%`, `125%`) affecting the canvas:
- Injected via CSS `style={{ zoom: `${canvasZoom}%` }}` on the main content container.
- Zoom button pill in Header: `h-8 px-2.5 rounded-full border border-slate-700 bg-slate-800 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5`.
- Target app will adopt this pattern to ensure high-density data viewing on standard governmental displays (1366×768 laptops and 1920×1080 desktops).
