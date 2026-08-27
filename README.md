# Agape Tumoutou Golfers

![Rick Kulon, app creator](rick-kulon-profile.jpg)

A mobile-first fellowship golf companion created by Rick Kulon, featuring shared course mapping, live GPS yardages, protected individual scoring, group scorecards and private round chat.

## Quick Start

1. Create a golfer account or sign in.
2. One golfer creates a round and shares its six-character code or QR.
3. Other golfers join on their own phones.
4. Each golfer enters only their own score.
5. Open **Live Scorecard** to follow the group.

## Current Features

- Protected 9- and 18-hole group scoring
- Personal score entry defaulted to each hole's par
- Live full-group scorecards and previous-match history
- Six-character round codes, share links and QR joining
- In-app QR camera scanner
- Private round chat with unread-message alerts
- Front, center and back green GPS yardages
- Personal club carry profiles and club suggestions
- GPS accuracy and off-course recommendation safeguards
- Shared course maps with course-name and address search
- Administrator-only course mapping and editing
- Super-admin management of course administrators
- Private Super Admin directory of registered golfer accounts
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

Location access requires HTTPS and user permission. Mapped courses, accounts, scores and chat messages are stored through Supabase security policies. Run each supplied Supabase SQL upgrade only when its corresponding feature has not already been installed.
