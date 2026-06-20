# UX/UI Improvement Ideas for `views/index.ejs`

> Focus: Look, feel, and user experience only. No functional/data changes.

---

## 1. Page Layout & Visual Hierarchy

- **Spacing inconsistency:** The hero slider has `mb-16` but the widget section has no bottom margin, creating uneven rhythm.
  - **Suggestion:** Use consistent vertical spacing (e.g., `mb-12` or `mb-16`) between all major sections for a cohesive rhythm.

## 2. Hero Slider

- **Image `object-contain`:** The hero images use `object-contain` which can leave empty space on the sides, especially on wide screens. This looks unfinished.
  - **Suggestion:** Switch to `object-cover` for a full-bleed, immersive experience. If important content is near edges, add a subtle gradient overlay to ensure text readability.
- **Missing slide indicators:** There are no dots or progress indicators showing which slide is active or how many slides exist.
  - **Suggestion:** Add small dot indicators at the bottom of the slider (centered) so users know there are multiple images and can see their position.

## 3. Booking Widget (Tatajuba iframe)

- **No label or context:** The iframe sits alone without any heading or description telling users what it is.
  - **Suggestion:** Add a small section heading above it using this text: "Busca tu destino" to give context. Respect look and feel.

## 4. Package Cards

- **Image `object-contain` on cards:** Similar to the hero, using `object-contain` on card images creates awkward empty space.
  - **Suggestion:** Use `object-cover` for card images so they fill the space uniformly. This creates a more polished, professional grid.
- **Chip badge overlap:** The continent chip (`absolute top-2 left-2`) may overlap with the image in an unpolished way.
  - **Suggestion:** Add a subtle drop shadow to the chip, or move it slightly outside the image area (e.g., above the card or as part of the card header).
- **Information hierarchy:** The card shows dates and price, but the date line uses an emoji (📅) which feels informal compared to the premium navy/gold theme.
  - **Suggestion:** Replace the emoji with a Feather icon (`calendar`) for consistency with the rest of the design system.
- **Missing hover state on card image:** The card lifts on hover, but the image doesn't provide any visual feedback.
  - **Suggestion:** Add a subtle zoom effect on the card image on hover (`scale-105`) for a more interactive feel.

## 5. Filter Chips (Continent Filters)

- **Visual weight:** The filter chips use the same `btn-accent` style as navigation buttons, making them feel too heavy.
  - **Suggestion:** Create a lighter, pill-style filter chip design — perhaps outlined with a gold border and filled on active state. This differentiates them from primary action buttons.
- **No visual feedback on selection:** It's unclear if the `active` class provides enough contrast.
  - **Suggestion:** Add a subtle scale animation or a checkmark icon on the active chip for clearer feedback.

## 6. Header

- **Logo sizing:** The logo is `h-10 w-10` which is quite small relative to the text.
  - **Suggestion:** Increase to `h-12 w-12` or `h-14 w-14` for better brand presence.
- Hide the "Hoteles" button for now.

## 7. Footer

- **Empty left section:** The footer's left column is completely empty (the "Experiencia" link is commented out).
  - **Suggestion:** Add the icon we are using on the header.

## 8. Floating WhatsApp Button

- **No tooltip:** Users may not immediately know what the button does.
  - **Suggestion:** Add a small tooltip on hover ("¿Necesitas ayuda?") that appears to the left of the button.



## 10. Overall Design System Consistency

- **Mixed icon styles:** Some places use Feather icons, others use emojis (📅, 💶).
  - **Suggestion:** Standardize on Feather icons throughout for a cohesive, professional look.
- **Color usage:** The gold accent (`#D4AF37`) is used well, but some elements (like the green WhatsApp button and green hero slider arrows in the hero partial) break the navy/gold palette.
  - **Suggestion:** Ensure all interactive elements follow the brand palette. The WhatsApp button is an acceptable exception (brand recognition), but the hero arrows should be gold/navy.

