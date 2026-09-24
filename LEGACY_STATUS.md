# ATG Legacy Status

**Status:** Legacy / Reference — No Production Development  
**Effective date:** September 24, 2026  
**Reference snapshot:** `archive/atg-final-2026-09-24`

## Purpose

Agape Tumoutou Golfers (ATG) is retained as a known-good historical and troubleshooting reference for ParFolio. It should not receive normal product development.

## Allowed changes

- Critical security fixes
- Data-preservation or backup work
- Changes required to keep the reference build inspectable
- Explicitly approved diagnostic work used to compare ATG with ParFolio

## Not allowed by default

- New product features
- UI redesigns
- Experimental camera/map behavior
- New monetization work
- General refactors that could alter known-good behavior
- Migration of ParFolio user data into ATG

## Data separation

ATG golfer/account data remains separate from ParFolio. The app may consume the neutral shared Golf Course Library, but golfer identities, rounds, scores, chats, profiles, credentials, and other user-specific records must remain isolated.

## Backend note

The ATG app currently references its own Supabase backend at project ref `rntmqjqbmjfcpwbbflyz`. The shared Golf Course Library is a separate dependency. Do not pause, delete, or repurpose either backend merely because ATG development is frozen; first verify whether another active app or workflow depends on it.
