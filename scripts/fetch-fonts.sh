#!/usr/bin/env bash
# scripts/fetch-fonts.sh: pulls the OFL-licensed Source fonts from the
# @fontsource npm packages via jsDelivr, once, into site/assets/fonts.
# The licence text comes from the upstream adobe-fonts repos instead of
# the @fontsource package (whose LICENSE file is a generic stand-in),
# so it carries Adobe's actual copyright and Reserved Font Name notice.
set -euo pipefail
cd "$(dirname "$0")/../site/assets/fonts"
base=https://cdn.jsdelivr.net/npm
get() { curl -fsSL -o "$2" "$1"; echo "fetched $2"; }
get $base/@fontsource/source-serif-4@5/files/source-serif-4-latin-400-normal.woff2 source-serif-4-latin-400-normal.woff2
get $base/@fontsource/source-serif-4@5/files/source-serif-4-latin-400-italic.woff2 source-serif-4-latin-400-italic.woff2
get $base/@fontsource/source-serif-4@5/files/source-serif-4-latin-500-normal.woff2 source-serif-4-latin-500-normal.woff2
get $base/@fontsource/source-serif-4@5/files/source-serif-4-latin-600-normal.woff2 source-serif-4-latin-600-normal.woff2
get $base/@fontsource/source-sans-3@5/files/source-sans-3-latin-400-normal.woff2  source-sans-3-latin-400-normal.woff2
get $base/@fontsource/source-sans-3@5/files/source-sans-3-latin-600-normal.woff2  source-sans-3-latin-600-normal.woff2
# Upstream OFL licence text (fall back to main/master if release 404s).
get https://raw.githubusercontent.com/adobe-fonts/source-serif/release/LICENSE.md OFL-Source-Serif-4.txt
get https://raw.githubusercontent.com/adobe-fonts/source-sans/release/LICENSE.md  OFL-Source-Sans-3.txt
