# Engineering practices and evidence

This review applies to the frontend refinements prepared on `automated-tests` and integrated into `main`. The original backend and optional phone-feature worktrees are outside these changes. These are design practices with concrete examples, not certifications or requirements to introduce extra classes or frameworks.

## Responsibilities, reuse, and scope

- **BEM:** component styles use block/element/modifier names such as `card__like_active`, retaining `card__like`.
- **DRY:** forms reuse `FormField`, `ModalWithForm`, validation, and submission hooks. Main/profile collections reuse `ClothingGrid`; endpoint functions reuse the HTTP request helper.
- **KISS:** focused functions and hooks use native browser features. The accessibility engine is a development dependency and is not included in the app's production bundle.
- **YAGNI:** URL-only course forms and weather-category filtering remain the course behavior. Optional photo/color features stay in their other worktree.
- **SRP:** authentication, weather, clothing requests, form submission, focus management, and rendering have separate modules.
- **SoC:** components consume state/actions from hooks; endpoint modules describe HTTP calls; `request.js` owns response parsing, cancellation, and deadlines.

## SOLID in functional React code

| Principle             | Evidence and scope                                                                                                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Single responsibility | Each hook/component groups one related responsibility. Required root state remains in `App` for the course architecture.                                                                                             |
| Open/closed           | `createRequest({ fetcher })` accepts another transport without changing endpoint functions or their callers.                                                                                                         |
| Liskov substitution   | Transport contract tests exercise direct and asynchronous response implementations, preserving parsed data, request options, and HTTP errors. No class inheritance hierarchy is introduced.                          |
| Interface segregation | Components receive the data and callbacks they consume; endpoint functions expose individual operations rather than a large service object. These are JavaScript function/prop contracts, not TypeScript interfaces. |
| Dependency inversion  | The request behavior accepts its transport through `fetcher`; its browser instance delegates to native Fetch. Contract tests inject a fixture transport without contacting a server.                                 |

These examples apply the relevant intent of SOLID. They do not claim every object or module has undergone a formal five-principle audit.

## AAA and test-first changes

Tests group setup, actions, and observable assertions. `tests/unit/transport.jest.test.js` explicitly labels Arrange/Act/Assert; user-flow tests use fixture accounts and interactions.

During these refinements, the new transport and skip-navigation suites ran before implementation: five tests failed because the factory and link were absent. The implementation made them pass. A further failing test demonstrated the profile link's accessible name omitted the displayed username; changing that name made it pass. The Chrome accessibility audit also identified contrast failures before the CSS fixes.

This records a red/green/refactor workflow for these changes. Tests added to older features do not make that earlier development retroactively TDD. Future behavior changes should start with a failing test where practical, add the smallest implementation, then refactor while keeping checks green.

## Accessibility review

The UI targets applicable WCAG 2.2 A/AA criteria through:

- A keyboard-visible skip link that focuses the main landmark without replacing the production hash route.
- Native buttons/links, heading structure, accessible control names, and input labels.
- Error descriptions associated with invalid fields, live request feedback, and loading/busy states.
- Dialog focus containment, Escape dismissal where permitted, background isolation, and focus restoration.
- Darker validation/option/unit text, a temperature-label background, and a white heart-button background to maintain contrast over arbitrary images.

`npm run test:a11y` runs axe WCAG-tag checks in jsdom and keyboard skip-navigation tests. jsdom has no rendered layout/canvas; its color-contrast rule is excluded, and a null canvas context tells axe graphics are unavailable. This is a stated test-environment limit, not a production change.

On October 20, 2026, a separate headless Chrome check exercised 19 rendered states at 1440px and 390px: guest recommendations, login, signup, invalid fields, profile, profile editing, garment entry, item preview, confirmation, and the mobile menu. It also verified the skip link's visibility, Enter activation, unchanged hash route, and absence of horizontal overflow. No automated violations remained after the fixes.

The scanner leaves image-backed temperature text and symbolic icon controls for manual review. The label uses white text over a 60% black background, whose lightest possible composite background is `#666`; the unit text and heart glyphs use `#666` on white. Those color pairs have at least 5.74:1 contrast before hover. The explicit button names describe the icon actions; decorative glyphs are hidden from assistive technology.

This is not a full WCAG conformance claim. Remaining checks include real screen readers/VoiceOver, zoom and reflow, all image/interaction states, actual device rendering, and a broader manual evaluation.

## CI, delivery, and deployment

The GitHub Actions workflow runs lint, formatting, regression/Jest/accessibility suites, coverage thresholds, the client-build security check, and a production build. A successful run retains a commit-specific frontend artifact for seven days.

The Pages job depends on verification, runs only on `main` outside pull requests, and requires `VITE_API_BASE_URL` as a repository variable. It validates the HTTPS address, downloads the verified artifact, and uses the official Pages configuration/upload/deploy actions. Pages/identity write permissions are limited to that deployment job.

The repository must enable GitHub Actions as the Pages publishing source. Its HTTPS backend must exist and permit the frontend origin. Without the variable the deployment job is skipped. The workflow has been configured and locally reviewed; a successful hosted deployment cannot be claimed until it runs in a configured repository. Normal local builds use the existing localhost API default.

## References

- [WCAG 2.2: bypass blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html)
- [WCAG 2.2: minimum contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [axe-core documentation and limitations](https://github.com/dequelabs/axe-core)
- [GitHub Actions artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
