# LET'S LVL — Brand Guidelines for Development

> Extracted from the official LET'S LVL Brand Book v1.0. This document translates brand guidelines into actionable development specs.

---

## 1. Brand Story & Identity

### Who We Are

**Built for the Bold.**

LET'S LVL is Dubai's boldest ecommerce destination for fashion, merchandise, and limited-edition retail. We exist at the intersection of style and culture — where every drop matters and every bid is a statement.

We are not just a marketplace. We are a movement. A platform where brands with real energy find buyers who feel it. Built in the UAE, shaped by global retail culture.

### Core Pillars

| # | Pillar | Description |
|---|--------|-------------|
| 01 | **Bold by Design** | Every decision — visual, verbal, product — is made with conviction. We don't do average. |
| 02 | **Culture-First** | Rooted in fashion and retail culture. We speak the language of the community fluently. |
| 03 | **Scarcity as Energy** | Limited drops, live auctions, real urgency. Exclusivity becomes an experience, not a price tag. |
| 04 | **UAE-Powered** | Based in Dubai, connected to the world. The regional hub for global fashion and retail culture. |

---

## 2. Logo & Usage

### Logo Variations

| Variant | Background | Usage |
|---------|-----------|-------|
| **Primary** | Black background | Default for all dark UI surfaces |
| **Secondary** | White background | Light mode, marketing materials |
| **Alternate** | Yellow background | Featured banners, special campaigns |
| **Wordmark (text-only)** | Dark background | Minimal contexts, headers |

In the logo, "LET'S" appears in white/black and "LVL" appears in **LVL Yellow (#F5C518)**.

### Logo Rules

**DO:**
- Always use approved logo files. Never recreate manually.
- Maintain clear space equal to the height of the "L" on all sides.

**DON'T:**
- Never stretch, skew, or distort the logo in any direction.
- Never add drop shadows, outlines, or visual effects.
- Never use on busy or low-contrast backgrounds.
- Never recolour — only use the approved colour variants.

---

## 3. Colour System

### Primary Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **LVL Yellow** | `#F5C518` | 245, 197, 24 | Headlines, CTAs, accent bars. Min 18px for text. Never on white backgrounds. |
| **Pitch Black** | `#0A0A0A` | 10, 10, 10 | Primary background. All brand materials default to black. Maximum contrast with Yellow and White. |
| **Pure White** | `#FFFFFF` | 255, 255, 255 | Body text on dark. UI labels across all digital touchpoints. |

### Secondary Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Carbon** | `#1A1A1A` | Dark backgrounds & cards |
| **Slate** | `#2D2D2D` | UI panels & dividers |
| **Smoke** | `#AAAAAA` | Body text & captions |

### Color Rules

- **Ratio: 60% Black / 30% White / 10% Yellow.** Yellow should always feel earned.
- Yellow is for headlines, CTAs, accent bars. Min 18px for text. Never on white backgrounds.
- Black is the primary background. All brand materials default to black.
- White is primary text. Body text on dark, UI labels across all digital touchpoints.

### CSS Custom Properties (Development Reference)

```css
:root {
  /* Primary */
  --lvl-yellow: #F5C518;
  --lvl-black: #0A0A0A;
  --lvl-white: #FFFFFF;

  /* Secondary */
  --lvl-carbon: #1A1A1A;
  --lvl-slate: #2D2D2D;
  --lvl-smoke: #AAAAAA;
}
```

### Tailwind Config (Development Reference)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        lvl: {
          yellow: '#F5C518',
          black: '#0A0A0A',
          white: '#FFFFFF',
          carbon: '#1A1A1A',
          slate: '#2D2D2D',
          smoke: '#AAAAAA',
        }
      }
    }
  }
}
```

---

## 4. Typography

### Type System

| Level | Font | Weight | Size | Usage |
|-------|------|--------|------|-------|
| **Display** | Bold Condensed | Bold | 85px | Hero headlines, all caps, slide titles, campaign copy |
| **Headline / Labels** | Condensed Regular | Regular | 36px | Subheads, callouts, UI labels, product tags |
| **Body** | Poppins | Light / Regular | 14-18px | Body copy, descriptions, emails, reports |

### Type Scale

| Size | Element |
|------|---------|
| 85px | Hero Headline |
| 64px | Section Title |
| 36px | Page Heading (all caps) |
| 18px | Subheading — Large Body Text |
| 14px | Body copy — the default reading size for longer-form content |
| 10px | Label / Caption / Metadata |

### Font Usage Rules

- Poppins 300-400 weight for body copy, descriptions, emails, reports
- Bold Condensed for all caps hero headlines, slide titles, campaign copy
- Condensed Regular for subheads, callouts, UI labels, product tags

---

## 5. Voice & Tone

### We Are

- **Bold.** We say it straight. No filler, no fluff.
- **Energetic.** Our words move. They create urgency.
- **Culturally sharp.** We know the scene. We speak it.
- **Confident.** We don't ask — we declare.
- **Inclusive.** Built for UAE, open to the world.

### We Are Not

- Corporate or stiff. No jargon. No over-formal language.
- Aggressive or alienating. Hype, not hostility.
- Try-hard. If it feels forced, it's wrong.
- Vague. Every sentence earns its place.
- Excessive. Short is powerful. Use it.

### Copy Examples

| Context | Example |
|---------|---------|
| Product Drop | "This drop won't wait. Neither should you." |
| Auction CTA | "Bid. Win. Level up. The clock is live." |
| Merchant Outreach | "Your brand deserves a platform that matches its energy." |

### Off-Brand Examples (Don't Use)

- Too passive: "We would like to invite you to check out our latest product listings."
- Too generic: "Shop the best fashion and merchandise at great prices today!"

---

## 6. Do's & Don'ts

### Visual Do's

- Use black as the dominant background in all materials
- Pair LVL Yellow with black or white only
- Use the Display font for all headline-level text
- Maintain generous whitespace — every element earns its space
- Use high-contrast, bold photography — raw, real, energetic
- Keep layouts clean and intentional with clear hierarchy

### Visual Don'ts

- Never use gradients in primary brand communications
- Never place the logo on patterned or photographic backgrounds
- Never use more than 3 font sizes in a single design
- Never use yellow text on white — zero contrast, illegible
- Never use soft, pastel, or washed-out colours
- Never centre-align body copy — left-align only

### Copy Do's

- Write in short, punchy sentences. Impact over length.
- Use active voice — "We sell bold," not passive constructions.
- Speak directly — "you," "your brand," "your drop."
- Use urgency language for auction and limited-drop comms.
- Reference UAE and regional culture where authentic.

### Copy Don'ts

- Never use more than one exclamation mark per piece.
- Never use buzzwords: "synergy," "disruptive," "ecosystem."
- Never over-explain. If it needs a paragraph, rethink it.
- Never write body copy in all-caps — display headlines only.
- Never use emojis in formal or merchant-facing content.

---

## Contact

**LET'S LVL** | Dubai, UAE | 2025 | partners@letslvl.com
