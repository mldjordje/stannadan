# Google auth, availability, media and branding design

## Scope

This change completes four connected production surfaces: Google-only authentication, a visual public availability calendar, apartment media management, and text-only branding.

## Authentication

Auth.js remains the authentication layer. The Credentials provider and password forms are removed, leaving Google as the only sign-in method. The two fixed allowlisted accounts `dragana.mlad018@gmail.com` and `web.wise018@gmail.com` receive the `admin` role. Every other authenticated Google account receives the `customer` role and cannot open protected admin routes. Provider configuration continues to use `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET` from Vercel.

If Google is not configured, the sign-in page shows a clear configuration-unavailable state instead of an empty or broken form. OAuth errors remain on the sign-in page in Serbian.

## Public availability

The Availability page gains a responsive month calendar derived from the existing reservation data and calendar behavior already used in the project. Visitors can switch apartments. Confirmed, pending, checked-in and checked-out reservation ranges appear only as neutral unavailable dates; guest names, contact details, notes, source and prices never reach the public component.

The desktop view shows a complete month grid with previous/next navigation and a compact apartment selector. Mobile keeps the same information in a touch-friendly single-column layout. A text list remains available below the calendar as an accessible summary and fallback.

## Apartment media management

The apartment editor continues to upload through Vercel Blob and save the existing `coverImage` and `gallery` fields, so no data migration is needed. Raw comma-separated gallery editing is replaced by visual media cards with preview, remove, move earlier, move later, and set-as-cover controls. Upload status and errors are announced. Existing URLs remain usable, and removing an image from the draft only becomes persistent when the apartment is saved.

## Branding

Visible graphical logo images in public navigation, authentication and administration are replaced with the text `Stan na dan`. Favicons and social sharing metadata images remain because they are browser/document assets rather than on-page logos. Accessible names use the same brand wording.

## Verification

Verification covers role mapping, provider visibility, public calendar privacy, media ordering and cover selection, responsive browser checks for sign-in, Availability and apartment administration, TypeScript, focused tests, and a production build. After verification, the implementation is committed and pushed to `main` for the linked Vercel deployment.
