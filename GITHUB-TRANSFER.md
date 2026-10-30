# GitHub transfer status

This package contains the local Fieldguide source and tests. The full build is a research preview with provisional content. Public publication review remains unfinished.

Run with Node 22 or later:

    npm run build
    npm test
    npm run dev

The source package deliberately excludes the previous Sites hosting identity, generated builds, local scratch files and channel-inventory exports.

No GitHub Pages deployment is enabled. Private repository visibility does not make an ordinary GitHub Pages website private. A publicly accessible launch requires an explicit audience decision and deployment-path configuration; the existing build uses root-relative URLs.
