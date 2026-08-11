# Admin and booking redesign

## Goal

Replace the Fuse control-panel shell, make apartment administration reliable on phones, and turn every public apartment detail into the primary booking surface with an interactive availability calendar.

## Approved direction

- Remove Fuse from every `/admin` route and introduce a small purpose-built `AdminShell` with desktop navigation and a compact mobile header/navigation.
- Preserve the current authentication guard, APIs, database models, Blob upload flow, reservations, calendar blocks, and channel-sync business logic.
- Replace the apartment table/dialog with responsive apartment cards and a full-page editor. A route editor avoids the current clipped table and MUI `aria-hidden`/focus failure.
- Validate apartment edits with the existing Zod schema before sending them, normalize numeric input, map server field errors back to fields, and keep a clear sticky mobile save action.
- Retain and improve the existing media editor: cover selection, ordering, deletion, multi-upload, previews, and upload feedback remain tied to the apartment being edited.
- Adapt the proven custom shell and date-range selection patterns from `minhen-smestaj`; do not copy its domain model or styling wholesale.
- Add an apartment-specific interactive calendar to the existing detail booking form. First click selects arrival, second click departure; unavailable ranges cannot be crossed; selected endpoints/range are visible; the form and price calculation share the same dates.
- Reduce the general availability calendar width and make it a discovery surface: select apartment and dates, then continue to that apartment's booking section.

## Quality constraints

- Mobile-first controls at least 44 px, no hover-dependent actions, no MUI modal focus masking, keyboard-operable calendar, visible focus, reduced-motion safe.
- No guest PII on public availability pages.
- Existing reservation endpoint payload and price calculation remain authoritative.
- Verify desktop and phone widths locally, then push `main` so Vercel creates the production deployment.

