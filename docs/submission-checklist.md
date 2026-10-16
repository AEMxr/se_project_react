# Project 14 submission checks

## Automated checks

```bash
npm run lint
npm test
npm run format:check
npm run build
```

The automated suite checks the frontend with mocked APIs. It does not create accounts or change records in your MongoDB database.

## With Express and MongoDB running

Use two test accounts so ownership can be checked.

Open the course frontend at `http://127.0.0.1:3000`, with the optional worktree's frontend stopped. The add-garment form should contain Name, Image URL, and weather radios, with no photo picker or color option. Randomize should appear at widths of 430px or less, including 390px, and be hidden on larger screens.

1. Register account A. Confirm the modal closes, the header shows A, and refresh preserves the session.
2. Open the profile and change the name/avatar. Refresh and confirm the saved values.
3. Add a weather-appropriate garment. Confirm it is visible in the profile and remains after refresh.
4. Like and unlike a garment on the main page and profile. Refresh after each change.
5. Log out. Confirm the header shows signup/login controls and `/profile` redirects home.
6. Sign in as account B. Confirm A's garments are absent from B's profile.
7. Open A's item on the main page as B. Confirm no delete action is offered. As A, confirm deletion removes it after refresh.
8. Try a wrong password and an already registered email. Confirm useful errors appear without losing form values.
9. Open a form, submit, close it, and reopen. Confirm an older response does not close or clear the new form.
10. Stop the API temporarily. Confirm request failures are visible. Restart it and verify recovery.
11. Toggle Fahrenheit/Celsius; check the weather card and page heading.
12. Check desktop and narrow layouts, long item names, avatar fallback, keyboard card previews, Escape, and focus return from dialogs.

The main page shows garments from every account that match the temperature category: cold below 66°F, warm from 66°F to below 86°F, and hot at 86°F or above. If none match, the page explains which category to add. The profile shows only the current account's garments.

## Submission requirements

- The frontend README links to the backend repository.
- The backend repository is public.
- Include the course frontend branch with these fixes.
- Keep optional phone/photo features in their separate worktree.

Public frontend hosting and the mobile randomizer are not required for Project 14.
