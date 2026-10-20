# Project 14 submission checks

## Automated checks

```bash
npm run lint
npm run test:all
npm run format:check
npm run build
```

The automated suite checks the frontend with mocked APIs. It does not create accounts or change records in your MongoDB database.
The full Jest run already includes the accessibility suites; use `npm run test:a11y` when checking only those behaviors.

## With Express and MongoDB running

Use two test accounts so ownership can be checked.

Use the integrated frontend on `main` with the backend's `automated-tests` revision so `/weather` is available. The README describes ordinary clone folders; the existing local backend development worktree is `../se_project_express-tests`. Run `npm run setup:env` in the chosen backend folder before its first normal start. The weather key stays in that backend's ignored `.env.local`; the frontend needs no weather credential. See [weather setup](weather-security.dev.md).

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
10. Stop the API temporarily. Confirm request failures are visible. Restart it and use Retry weather / Retry clothing to recover without reloading the page. A stalled API request should stop waiting after 15 seconds; timed-out forms should become editable again and retain their values.
11. Toggle Fahrenheit/Celsius; check the weather card and page heading.
12. Check desktop and narrow layouts, long item names, avatar fallback, keyboard card previews, Escape, and focus return from dialogs.
13. Throttle the network and refresh. Confirm the header and forms remain usable while collection skeletons or image placeholders appear. Open a garment preview before its image finishes; its details and close button should work, and its image frame should keep its dimensions when the picture arrives.
14. Press Tab after loading each route and activate Skip to main content. Confirm focus reaches the main landmark without changing the URL. Check VoiceOver/screen-reader names, visible focus, zoom/reflow, and contrast with your actual garment images. Automated accessibility scans cover only part of WCAG.

The main page shows garments from every account that match the temperature category: cold below 66°F, warm from 66°F to below 86°F, and hot at 86°F or above. If none match, the clothing area stays empty. The profile shows only the current account's garments.

## Submission requirements

- The frontend README links to the backend repository.
- The backend repository is public.
- Publish the matching frontend and backend revisions.
- Check the backend GitHub Actions results.
- Explain the documented server-side weather-key deviation from the rubric in the submission notes.
- Keep optional phone/photo features in their separate worktree.

Public frontend hosting and the mobile randomizer are not required for Project 14.
