# Project 14 submission review

Reviewed against the supplied Project 14 instructions and criteria on October 16, 2026, on `course-submission-fixes`.

## Corrections

| Area                     | Result                                                                                                                                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registration and login   | Automatic login after registration, saved-token verification, protected profile route, logout, and visible backend errors.                                                                                     |
| Request handling         | Correct public/protected headers, response checks, duplicate-submit guards, pending states, and useful network feedback.                                                                                       |
| Request ordering         | Old authentication results cannot restore a closed session; initial item loading preserves newer mutations; profile saves finish in order and cannot overwrite another account.                                |
| Forms                    | Shared validation and submission handling, trimmed text/URLs, unchanged password bytes, current profile values, inline feedback, and drafts protected from older responses.                                    |
| Wardrobe                 | Shared cards on both routes, owner-only profile items and deletion, synchronized likes, confirmation and retry behavior.                                                                                       |
| Weather                  | Bounded location lookup with fallback, abort cleanup, unavailable-weather feedback, and no category filtering until a valid temperature exists.                                                                |
| Layout and accessibility | Required heading semantics, keyboard card previews, dialog focus/Escape behavior, avatar fallback, normal sidebar buttons, and readable title/heart rows. Existing fonts, colors, and overall design retained. |
| Repository               | Updated Express/MongoDB instructions and backend link, separate configuration example, removed unused fonts, consistent formatting, and dependency updates.                                                    |

## Verification

- 35 automated regression tests pass, using fixture accounts and mocked APIs, including URL-only garment entry and recommendations unaffected by optional metadata or ownership filters.
- ESLint, Prettier checking, and the production build pass.
- `npm audit` reports zero vulnerabilities for the installed dependency tree at review time.
- The production build was exercised in headless Chrome at 320, 390, 430, 431, 768, 800, 1024, and 1440 pixels on both routes. Checks passed for horizontal overflow, route headings, ownership filtering, sidebar sizing, and runtime exceptions. The randomizer is visible only through 430px. Mobile menu/login switching, initial focus, Escape, native Enter activation of card previews, and URL-only garment entry also passed.
- The original Express repository was left unchanged. Optional phone/photo additions were kept in their separate worktree.

## Before submission

Run the [live-backend checklist](submission-checklist.md) with Express and MongoDB running. The automated tests and browser checks use mocked responses; they do not certify persistence in your database or a deployed backend. The layout checks cover the listed widths and observed defects, rather than a complete pixel comparison of every Figma screen.

The frontend README includes the backend repository link, and that GitHub repository was publicly accessible at review time. Submit the frontend version containing this branch's fixes.
