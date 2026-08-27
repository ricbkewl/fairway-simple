# Agape Tumoutou Golfers

![Rick Kulon, app creator](rick-kulon-profile.jpg)

A mobile-first fellowship golf companion created by Rick Kulon, featuring shared course mapping, live GPS yardages, protected individual scoring, group scorecards and private round chat.

## Quick Start

1. Create a golfer account with your name, email and phone number.
2. Open the verification email and confirm the account before signing in.
3. One golfer creates a round and shares its six-character code or QR.
4. Other golfers join on their own phones.
5. Each golfer enters only their own score.
6. Open **Live Scorecard** to follow the group.

## Current Features

- Protected 9- and 18-hole group scoring
- Personal score entry defaulted to each hole's par
- Live full-group scorecards and previous-match history
- Six-character round codes, share links and QR joining
- In-app QR camera scanner
- Private round chat with unread-message alerts
- Front, center and back green GPS yardages
- Personal club carry profiles with a prominent Suggested Club display
- GPS accuracy and off-course recommendation safeguards
- Shared course maps with course-name and address search
- Administrator-only course mapping and editing
- Super-admin management of course administrators
- Private Super Admin player directory listing name, email and phone
- Required first name, last name, email and phone during signup
- Email verification instructions and editable golfer profiles
- Uploadable profile-picture icons on Account, Profile and the private Players directory
- Remembered golfer sessions and password recovery
- Active-round recovery from Home and dedicated Round navigation
- Offline score queue with synchronization after reconnecting
- Custom iPhone and Android Home Screen icons

## Contact and Suggestions

Suggestions for improving the app are welcome.

- Email: [ricbkewl@gmail.com](mailto:ricbkewl@gmail.com)
- Text: [607.438.3208](sms:+16074383208)

**Last updated:** August 27, 2026

## Deployment Notes

Upload the app files to the repository root and publish the `main` branch from `/(root)` in GitHub Pages settings.

Before deploying the required golfer-profile signup, run `supabase-golfer-profiles.sql` in the Supabase SQL Editor. Under **Authentication → URL Configuration**, set the Site URL to `https://rickbewl.github.io/fairway-simple/` and include the same address in Redirect URLs so verification links return to the app.

Location access requires HTTPS and user permission. Mapped courses, accounts, scores and chat messages are stored through Supabase security policies. Run each supplied Supabase SQL upgrade only when its corresponding feature has not already been installed.

Profile pictures are resized in the browser to a 512×512 JPEG and stored in the public `golfer-avatars` bucket. Only the signed-in account owner can upload or replace the file, but anyone with its public image URL can view it.
