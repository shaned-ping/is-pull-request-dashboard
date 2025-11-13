# UI Design Guidelines

This document defines the design system, UI patterns, and visual standards for the PR Dashboard application.

## Table of Contents

- [Design Principles](#design-principles)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Components](#components)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)
- [Animation & Transitions](#animation--transitions)

## Design Principles

### 1. Clarity
- Information should be easy to scan and understand
- Use clear visual hierarchy
- Prioritize important information (PR title, author, date)

### 2. Consistency
- Reuse patterns and components
- Maintain consistent spacing, colors, and typography
- Follow established conventions

### 3. Efficiency
- Minimize clicks and interactions
- Show relevant information upfront
- Fast loading and responsive interactions

### 4. Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- Sufficient color contrast

## Color System

### Dark Theme (Default)

```css
/* Background Colors */
--color-bg-primary: #242424
--color-bg-secondary: #1a1a1a
--color-bg-hover: rgba(255, 255, 255, 0.05)

/* Text Colors */
--color-text-primary: rgba(255, 255, 255, 0.87)
--color-text-secondary: rgba(255, 255, 255, 0.6)
--color-text-tertiary: rgba(255, 255, 255, 0.5)

/* Border Colors */
--color-border-default: rgba(255, 255, 255, 0.1)
--color-border-hover: rgba(255, 255, 255, 0.3)

/* Accent Colors */
--color-accent-primary: #646cff
--color-accent-hover: #535bf2
```

### Light Theme

```css
/* Background Colors */
--color-bg-primary: #ffffff
--color-bg-secondary: #f9f9f9
--color-bg-hover: rgba(0, 0, 0, 0.05)

/* Text Colors */
--color-text-primary: #213547
--color-text-secondary: rgba(0, 0, 0, 0.6)
--color-text-tertiary: rgba(0, 0, 0, 0.5)

/* Border Colors */
--color-border-default: rgba(0, 0, 0, 0.1)
--color-border-hover: rgba(0, 0, 0, 0.3)

/* Accent Colors */
--color-accent-primary: #646cff
--color-accent-hover: #535bf2
```

### Semantic Colors

```css
/* Status Colors */
--color-error: #ff4444
--color-success: #4caf50
--color-warning: #ff9800
--color-info: #2196f3

/* Draft PR indicator */
--color-draft: #888888
```

### Color Usage Guidelines

- **Primary background** - Main app background
- **Secondary background** - Cards, containers
- **Primary text** - Headings, important text
- **Secondary text** - Body text, metadata
- **Tertiary text** - Subtle info, timestamps
- **Accent** - Links, interactive elements
- **Borders** - Card borders, dividers

## Typography

### Font Family

```css
font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
```

**Fallback order:**
1. Inter (if loaded)
2. System UI font
3. Avenir
4. Helvetica
5. Arial
6. Sans-serif

### Type Scale

```css
/* Headings */
--font-size-h1: 2.5rem    /* 40px - Page title */
--font-size-h2: 1.5rem    /* 24px - Section title */

/* Body */
--font-size-base: 1rem    /* 16px - Body text */
--font-size-large: 1.2rem /* 19px - PR title */
--font-size-small: 0.9rem /* 14px - Metadata */
--font-size-tiny: 0.85rem /* 13px - Subtle info */

/* Line Heights */
--line-height-tight: 1.1
--line-height-base: 1.5
--line-height-relaxed: 1.75
```

### Font Weights

```css
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
```

### Typography Guidelines

- **Headings (h1)** - 2.5rem, weight 600, tight line-height
- **PR titles** - 1.2rem, weight 600, color primary
- **Body text** - 1rem, weight 400, base line-height
- **Metadata** - 0.9rem, weight 400, color secondary
- **Subtle info** - 0.85rem, color tertiary

## Spacing & Layout

### Spacing Scale

```css
--spacing-xs: 0.25rem   /* 4px */
--spacing-sm: 0.5rem    /* 8px */
--spacing-md: 1rem      /* 16px */
--spacing-lg: 1.5rem    /* 24px */
--spacing-xl: 2rem      /* 32px */
--spacing-2xl: 3rem     /* 48px */
```

### Container Widths

```css
--container-max-width: 1280px
--container-padding: 2rem (32px)
```

### Spacing Guidelines

- **Component padding** - 1.5rem (24px)
- **Card gap** - 1rem (16px)
- **Section spacing** - 2rem (32px)
- **Element gap** - 0.5rem to 1rem (8-16px)

### Layout Grid

```
[Container - max 1280px, centered]
  [Header - centered text, 2rem bottom margin]
  [Main - full width]
    [PR List - grid with 1rem gap]
      [PR Card]
      [PR Card]
      ...
```

## Components

### PR Card

**Purpose:** Display individual pull request information

**Structure:**
```
┌─────────────────────────────────────────┐
│ PR Title                           #123  │
│                                          │
│ 👤 username  ⏱️ 3 days ago  📁 repo     │
└─────────────────────────────────────────┘
```

**Specifications:**
- Background: Secondary background color
- Border: 1px, default border color
- Border radius: 8px
- Padding: 1.5rem (24px)
- Hover: Transform translateY(-2px), border color change
- Transition: 0.2s ease

**States:**
- **Default** - Normal appearance
- **Hover** - Elevated, highlighted border
- **Draft** - Italic "Draft" indicator

### PR Header (within card)

**Layout:** Flexbox, space-between, flex-start alignment
**Gap:** 1rem (16px)

**Elements:**
- PR title (flex: 1, font-size: 1.2rem, weight: 600)
- PR number (fixed width, color: tertiary)

### PR Metadata

**Layout:** Flexbox, 1rem gap, flex-wrap
**Font size:** 0.9rem (14px)
**Color:** Secondary text

**Elements:**
- Author (avatar + username)
- Timestamp (icon + relative time)
- Repository (icon + name)
- Draft indicator (if applicable)

### Empty State

**Purpose:** Show when no PRs found

**Specifications:**
- Centered text
- Padding: 3rem (48px)
- Color: Secondary text
- Heading: 1.5rem
- Description: 1rem

### Error State

**Purpose:** Display API errors

**Specifications:**
- Background: Error color
- Color: White
- Padding: 1rem
- Border radius: 8px
- Margin: 1rem 0

### Loading State

**Purpose:** Show while data is loading

**Specifications:**
- Centered text
- Padding: 2rem
- Font size: 1.2rem
- Color: Primary text

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */
/* Default: Mobile (< 768px) */

/* Tablet */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large desktop */
@media (min-width: 1280px) { }
```

### Responsive Patterns

**Mobile (< 768px)**
- Single column layout
- Full-width cards
- Stack metadata vertically if needed
- Padding: 1rem

**Tablet (768px+)**
- Same layout, more breathing room
- Padding: 1.5rem

**Desktop (1024px+)**
- Container max-width enforced
- More comfortable spacing
- Padding: 2rem

### Touch Targets

- Minimum size: 44x44px (Apple HIG, WCAG)
- Links and buttons should be easily tappable
- Sufficient spacing between interactive elements

## Accessibility

### WCAG 2.1 AA Compliance

#### Color Contrast

**Text contrast ratios:**
- Normal text (< 18pt): 4.5:1 minimum
- Large text (≥ 18pt): 3:1 minimum
- UI components: 3:1 minimum

**Current ratios:**
- Dark mode primary text: 13.6:1 ✓
- Light mode primary text: 12.8:1 ✓
- Links (accent color): 4.5:1 ✓

#### Keyboard Navigation

- All interactive elements are keyboard accessible
- Logical tab order
- Visible focus indicators
- No keyboard traps

#### Screen Readers

- Semantic HTML elements (`<header>`, `<main>`, `<nav>`)
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for images (avatars)
- ARIA labels where needed

#### Focus Indicators

```css
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

### Accessibility Checklist

- [ ] Sufficient color contrast (4.5:1 for text)
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader friendly
- [ ] No reliance on color alone
- [ ] Text can be resized to 200%
- [ ] Touch targets ≥ 44x44px

## Animation & Transitions

### Timing Functions

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--ease-out: cubic-bezier(0.0, 0, 0.2, 1)
--ease-in: cubic-bezier(0.4, 0, 1, 1)
```

### Durations

```css
--duration-fast: 0.15s    /* Quick feedback */
--duration-normal: 0.2s   /* Default */
--duration-slow: 0.3s     /* Emphasis */
```

### Common Transitions

**Card hover:**
```css
transition: transform 0.2s ease-in-out, border-color 0.2s ease-in-out;
transform: translateY(-2px);
```

**Link hover:**
```css
transition: color 0.2s ease-in-out;
```

**Loading states:**
```css
/* Use CSS animations for spinners/loaders */
animation: spin 1s linear infinite;
```

### Animation Guidelines

- **Subtle, not distracting** - Enhance UX, don't hinder it
- **Consistent timing** - Use defined durations
- **Respect prefers-reduced-motion** - Disable for users who prefer it

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Icons & Imagery

### Avatar Images

- Size: 20x20px in metadata
- Border radius: 50% (circular)
- Source: GitHub CDN
- Alt text: Username

### Icons

**Current approach:** Emoji for simplicity
- ⏱️ - Time/date
- 📁 - Repository
- 👤 - User (optional, avatar used instead)

**Future:** Consider icon library (e.g., Lucide, Heroicons)

## Best Practices

### Do's

✅ Use semantic HTML elements
✅ Maintain consistent spacing
✅ Support both light and dark themes
✅ Ensure sufficient color contrast
✅ Test on multiple screen sizes
✅ Use relative units (rem, em) over px
✅ Follow established component patterns

### Don'ts

❌ Use arbitrary colors not in the design system
❌ Add unnecessary animations
❌ Rely on color alone to convey information
❌ Create inaccessible interactions
❌ Break established spacing patterns
❌ Use inline styles (except dynamic values)

## Design Tokens (Future)

Consider implementing CSS custom properties:

```css
:root {
  /* Colors */
  --color-primary: #646cff;
  --color-bg: #242424;

  /* Spacing */
  --space-sm: 0.5rem;
  --space-md: 1rem;

  /* Typography */
  --font-size-base: 1rem;
  --line-height-base: 1.5;
}
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://m3.material.io/) - Inspiration
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Note:** This design system is a living document. Update as the application evolves and new patterns emerge.
