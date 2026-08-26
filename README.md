# Agape Tumoutou Golfers

A mobile-first group golf scorecard with custom course mapping and live GPS yardages.

## Features

- 9- and 18-hole group scoring
- Custom courses saved in the browser
- Front, center and back green mapping
- Live GPS yardages during a round
- Shared Supabase course library
- Administrator-only course editing
- Mobile-friendly GitHub Pages deployment

## Deploy

Upload all files to the root of the GitHub repository and publish the `main` branch from `/(root)` in GitHub Pages settings.

Location access requires HTTPS and the golfer must allow location permission. GitHub Pages provides HTTPS.

Mapped courses are stored in Supabase and are available to every golfer. Round scores remain on the golfer's device. Automatic worldwide course data is not included; an authorized administrator maps each course once for everyone.
