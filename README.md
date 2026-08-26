# Agape Tumoutou Golfers

A mobile-first group golf scorecard with custom course mapping and live GPS yardages.

## Features

- Protected 9- and 18-hole shared group scoring
- Six-character round codes for joining from separate phones
- Each signed-in golfer can edit only their own scores
- Persistent golfer login on trusted devices without storing passwords in app code
- Previous Matches history tied to each golfer account
- Read-only full-group scorecards for past and in-progress matches
- Editable player names with no forced "You" label
- Front, center and back green mapping
- Course-name and street-address map search
- Map position retained while moving between holes
- Live GPS yardages during a round
- Shared Supabase course library
- Administrator-only course editing
- Super-admin promotion of existing users to course admins
- Persistent Home, Courses and Account navigation
- Resume an unfinished round after visiting the Home screen
- Mobile-friendly GitHub Pages deployment
- Custom Agape Golf home-screen icon for iPhone and Android
- Private My Clubs carry-distance profile for every golfer
- Live personalized club suggestions based on center-green GPS distance
- Password recovery and in-app password changes
- Automatic live score and player updates using Supabase Realtime
- Offline score queue with automatic synchronization after reconnecting
- QR-code and share-link round joining
- Offline app-shell and saved-course fallback after the first successful load

## Deploy

Upload all files to the root of the GitHub repository and publish the `main` branch from `/(root)` in GitHub Pages settings.

Location access requires HTTPS and the golfer must allow location permission. GitHub Pages provides HTTPS.

Mapped courses and protected shared-round scores are stored in Supabase. Automatic worldwide course data is not included; an authorized administrator maps each course once for everyone.

Run `supabase-admin-promotion.sql` once in the Supabase SQL Editor to enable the super-admin-only Add Course Admin control.

Run `supabase-shared-rounds.sql` once in the Supabase SQL Editor to enable golfer accounts, round codes and score ownership. Each golfer must create or sign in to their own account before creating or joining a round.

No additional SQL is required for match history. It reads each golfer's existing protected round membership and scores from the shared-round tables.

Run `supabase-four-upgrades.sql` once in the Supabase SQL Editor. It safely enables private carry-distance profiles and live round updates, even if the earlier club-distance SQL was already installed. In Supabase Authentication URL Configuration, set the Site URL to `https://rickbewl.github.io/fairway-simple/` and add the same address to Redirect URLs so password-recovery links return to the app.
