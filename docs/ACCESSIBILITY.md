# Accessibility Audit Checklist (WCAG 2.1 AA)

## 1. Keyboard Navigation
- [ ] **Tab Order**: Ensure all interactive elements (links, buttons, inputs) are reachable via `Tab` key in a logical order.
- [ ] **Focus Visible**: Ensure focused elements have a visible outline (e.g., `ring-2 ring-blue-500`).
- [ ] **Skip Links**: Add a "Skip to Content" link at the top of the page for keyboard users.
- [ ] **No Keyboard Trap**: Ensure keyboard users can navigate into and out of all UI components (modals, menus).

## 2. Text Alternatives
- [ ] **Images**: All `<img>` tags must have an `alt` attribute describing the content or `alt=""` if decorative.
- [ ] **Icons**: Meaningful icons (e.g., buttons) must have `aria-label` or visually hidden text.

## 3. Contrast & Color
- [ ] **Text Contrast**: Normal text must have a contrast ratio of at least 4.5:1 against the background. Large text (18pt+ or 14pt bold) must be 3:1.
- [ ] **Color Independence**: Don't rely solely on color to convey information (e.g., error states should have icons or text).

## 4. Forms & Input
- [ ] **Labels**: All inputs must have associated `<label>` elements or `aria-label`.
- [ ] **Error Identification**: Validation errors must be described in text and associated with the input via `aria-describedby`.

## 5. Screen Reader Support
- [ ] **Headings**: Use `<h1>` through `<h6>` to create a logical document structure. Do not skip levels.
- [ ] **Landmarks**: Use semantic HTML5 regions (`<nav>`, `<main>`, `<aside>`, `<footer>`) to help navigation.
- [ ] **Dynamic Content**: Use `aria-live` regions for status updates (e.g., toast notifications).

## 6. Motion & Animation
- [ ] **Reduced Motion**: Respect `prefers-reduced-motion` media query. Disable auto-playing animations or provide a pause button.

## Automated Testing
Run the following script to perform a basic audit (requires `pa11y`):
`node scripts/a11y-check.js`
