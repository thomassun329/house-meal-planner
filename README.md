# House Meal Planner

A real-time household meal scheduling web app built with React Native, Expo,
and Firebase. Coordinate meals and track dietary preferences with instant
synchronization across all devices.

Live URL: https://house-meal-planner.web.app

## Features

- 4-week ahead meal planning (lunch & dinner)
- Multi-member household support
- Dietary preference tracking (Normal / Vegetarian)
- Analytics dashboard with monthly portion breakdown
- Real-time synchronization across all devices
- Member management (add/remove)
- Two-tier authentication (Member & Admin)
- Auto-login on page refresh
- Mobile-ready responsive design
- PWA — installable on phone via "Add to Home Screen"

## Tech Stack

- **Frontend:** React Native with Expo (web only), single file: `src/App.js`
- **Backend:** Firebase Firestore (real-time database)
- **Authentication:** PIN-based (two-tier, hardcoded in app)
- **Hosting:** Firebase Hosting
- **CI/CD:** GitHub Actions — auto-deploys on push to `main`

## Project Structure

```
├── src/
│   ├── App.js             # Entire frontend — all screens and logic
│   ├── firebase.js        # Firebase config and initialization
│   └── hooks/
│       └── useFirebase.js # Firebase hooks for data operations
├── public/                # service-worker.js, manifest.json, favicon
├── assets/                # Expo icons (icon.png, favicon.png, etc.)
├── scripts/               # prebuild.js — bumps service worker cache version
├── .github/workflows/     # deploy.yml — auto-deploy on push to main
├── index.js               # Entry point with service worker registration
├── app.json               # Expo config
├── package.json           # Dependencies and build scripts
├── firebase.json          # Firebase hosting config
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore index definitions
└── dist/                  # Build output (generated, not committed)
```

## Local Development

The Expo dev server (`npm start`) is broken due to a Metro bundler error in a
dependency. Always use the static build instead:

```bash
npm install
npm run build
python3 -m http.server 9000 --directory dist
```

Open http://localhost:9000 in your browser.

`npm run build` automatically runs `scripts/prebuild.js` first, which bumps
the service worker cache version so deployed updates reach existing users.

## Login Credentials

**Member:**
- Name: Any member name that exists in Firebase
- PIN: `170120`

**Admin:**
- Name: `José García`
- PIN: `1701202026`

Note: PINs are hardcoded in `App.js` (`handleLogin`), not stored in Firestore.
Admin access is a specific name+PIN combination, not a field on the member.

## Deployment

### Auto-deploy (normal workflow)
Push to `main` — GitHub Actions builds and deploys automatically via
`.github/workflows/deploy.yml`.

### Manual deploy
```bash
npm run build
firebase deploy --only hosting
```

### Firestore rules only
```bash
firebase deploy --only firestore:rules
```

## Firebase Setup

1. Create a project at
   [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Deploy security rules: `firebase deploy --only firestore:rules`
4. Add credentials to `.env.local`

## Environment Variables

Create `.env.local` (used at build time by Expo):
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Data Model (Firestore)

```
households/{householdId}/
├── settings/
│   └── config
├── members/
│   └── {memberId}/
│       ├── name: string
│       └── dietaryRestrictions: string ("Normal" | "Vegetarian")
└── mealEntries/
    └── {entryId}           # key: YYYY-MM-DD-{memberName}-{lunch|dinner}
        └── state: string ("none" | "attending")
```

## Meal State

Each cell toggles between two states:
- Empty — not attending
- ✓ Attending

## PWA — Install on Phone

The app can be installed as a PWA (works like a native app):

1. Open https://house-meal-planner.web.app in a mobile browser
2. Browser menu → "Add to Home Screen"
3. App installs and works offline

The service worker (`public/service-worker.js`) caches static assets so the
app loads without a network connection. Data still requires Firebase.

## Useful Commands

```bash
# Local testing
npm run build                           # Build to dist/
python3 -m http.server 9000 --directory dist

# Deploy
firebase deploy --only hosting         # Manual deploy
firebase deploy --only firestore:rules # Rules only

# Local Firebase emulators (for offline testing)
firebase emulators:start               # Start Firestore + Hosting emulators
firebase serve                         # Serve dist/ on localhost:5000

# Firebase
firebase login                         # Authenticate CLI
firebase logs                          # View deployment logs
```

## Testing with Playwright

- Test against http://localhost:9000 (static build), not 8081
- Do NOT use `page.wait_for_load_state("networkidle")` — Firebase keeps a
  persistent WebSocket open so networkidle never fires
- Use instead: `page.wait_for_function("document.body.innerText.length > 30")`
- Use admin login for tests (`José García` / `1701202026`) — member data in
  Firebase may be missing or inconsistent

## Security

- Members can only edit their own meals
- Admins can edit all members' meals
- Firestore rules enforce permissions at the database level
- Auto-login stored in localStorage (name + isAdmin flag)

## Troubleshooting

### App shows old version after deploy
Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows).
On mobile: Settings → Browser → Clear data, or reinstall the PWA.

### Login doesn't work
- Check the member name exists in Firebase
- Verify the PIN is correct
- Check Firestore security rules allow reads (browser console, F12)

### Firebase credentials not loading
```bash
cat .env.local    # Verify all 6 variables are present
npm run build     # Rebuild with correct env vars
```

### Real-time updates not syncing
- Check network connection
- Check browser console for Firebase errors (F12)

## Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Commit and push: `git push origin feature/name`
3. Open a Pull Request — merging to `main` auto-deploys

---

Made with love for household meal coordination
