# Security policy

## Reporting a vulnerability

Please report security problems **privately**, not in a public issue: open the
repository's **Security** tab and choose **Report a vulnerability** (GitHub
private vulnerability reporting). Only the maintainer can see the report. You
should get a reply within a week.

## What the site does, for context

- It is static HTML, CSS and JavaScript served by GitHub Pages. There is no
  server-side code, no database and no accounts.
- It makes no network requests after the page loads and collects nothing.
  Nothing is stored in the browser between visits.
- It has no npm dependencies. The only things that can go stale are the pinned
  GitHub Actions in `.github/workflows`, which Dependabot watches weekly.
- Pages are rendered from a local data file with `document.createElement`,
  never from HTML strings.
