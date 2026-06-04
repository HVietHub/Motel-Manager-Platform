# HouseSea — Color System

## Brand Palette

| HEX | OKLCH | Tên | Vai trò |
|---|---|---|---|
| `#fdb549` | `oklch(0.822 0.146 73.801)` | **Amber** | Primary CTA, buttons, focus ring |
| `#ed7307` | `oklch(0.687 0.177 51.046)` | **Burnt Orange** | Primary hover, active states |
| `#bf4514` | `oklch(0.554 0.166 39.095)` | **Deep Rust** | Destructive, danger, errors |
| `#8b9c38` | `oklch(0.659 0.126 118.209)` | **Olive Green** | Secondary, tags, success |
| `#90b1c4` | `oklch(0.742 0.045 233.443)` | **Steel Blue** | Accent, muted-foreground dark |
| `#31361b` | `oklch(0.320 0.044 117.568)` | **Dark Olive** | Card dark, sidebar dark |
| `#1f2116` | `oklch(0.242 0.020 116.307)` | **Deep Olive Black** | Background dark, foreground |

---

## Design Philosophy

**Earthy Warm** — lấy cảm hứng từ thiên nhiên Việt Nam.
Tone chính: Amber/Orange (năng động, ấm áp) trên nền Olive (đất, bền vững).
Phù hợp với brand nhà trọ — gần gũi, tin cậy, không lạnh lẽo như blue/indigo.

---

## Light Mode

| Token | Value | Mô tả |
|---|---|---|
| `--background` | Warm off-white | Nền trang |
| `--foreground` | `#1f2116` Deep Olive Black | Text chính |
| `--card` | White | Card background |
| `--primary` | `#fdb549` Amber | CTA chính |
| `--primary-foreground` | `#1f2116` | Text trên primary |
| `--secondary` | Light olive tint | Secondary buttons |
| `--muted` | Very light warm gray | Muted backgrounds |
| `--muted-foreground` | Medium olive gray | Placeholder, captions |
| `--accent` | Light steel blue tint | Hover highlights |
| `--destructive` | `#bf4514` Deep Rust | Delete, error |
| `--border` | Warm light border | Borders, dividers |
| `--ring` | `#fdb549` Amber | Focus ring |

## Dark Mode

| Token | Value | Mô tả |
|---|---|---|
| `--background` | `#1f2116` Deep Olive Black | Nền trang |
| `--foreground` | Warm off-white | Text chính |
| `--card` | `#31361b` Dark Olive | Card background |
| `--primary` | `#fdb549` Amber | CTA chính (giữ nguyên) |
| `--muted-foreground` | `#90b1c4` Steel Blue | Placeholder, captions |
| `--destructive` | `#ed7307` Burnt Orange | Softer destructive in dark |

---

## Chart Colors

| Token | Color | HEX |
|---|---|---|
| `--chart-1` | Amber | `#fdb549` |
| `--chart-2` | Olive Green | `#8b9c38` |
| `--chart-3` | Steel Blue | `#90b1c4` |
| `--chart-4` | Burnt Orange | `#ed7307` |
| `--chart-5` | Deep Rust | `#bf4514` |

---

## Gradient Classes

```css
/* Brand gradient — dùng cho CTA, headers */
from-amber-500 to-orange-500

/* Hover state */
from-amber-600 to-orange-600

/* Glow effect */
from-amber-400 to-orange-400

/* Text gradient */
background: linear-gradient(to right, #fdb549, #ed7307)
```

## Usage Guidelines

1. **Primary (Amber)** — chỉ dùng cho 1 CTA chính mỗi màn hình
2. **Burnt Orange** — hover/active state của primary
3. **Deep Rust** — destructive actions (xóa, hủy không thể hoàn tác)
4. **Steel Blue** — muted text trong dark mode, accent highlights
5. **Olive Green** — success states, secondary tags
6. Dark mode background là `#1f2116` — không dùng pure black
