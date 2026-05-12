# Architecture & Deployment Guide

## Tech Stack

### Frontend
- **Framework:** React Native (Expo)
- **Build Tool:** Expo CLI (`expo export --platform web`)
- **Language:** JavaScript
- **Styling:** React Native StyleSheet

### Backend
- **Database:** Firebase Firestore (real-time NoSQL)
- **Authentication:** PIN-based (custom implementation)
- **Storage:** Firebase Cloud Storage (optional)

### Infrastructure & Deployment
- **Hosting:** Firebase Hosting
- **PWA Support:** Service Worker + Web App Manifest
- **CI/CD:** Manual deployment via Firebase CLI

## Project Structure

```
house-meal-planner/
├── App.js                    # Main app component (50KB+)
├── index.js                  # Entry point with service worker registration
├── useFirebase.js            # Firebase hooks for data operations
├── firebase.js               # Firebase config and initialization
├── firestore.rules           # Firestore security rules
├── app.json                  # Expo configuration
├── package.json              # Dependencies and build scripts
├── firebase.json             # Firebase hosting config
├── public/                   # Static assets
│   ├── index.html            # HTML template
│   ├── manifest.json         # PWA manifest
│   ├── service-worker.js     # Service worker for caching
│   └── favicon.ico           # App icon
├── dist/                     # Build output (generated)
└── node_modules/             # Dependencies
```

## Data Model (Firestore)

```
households/{householdId}/
├── settings/
│   ├── householdName: string
│   ├── userPin: string (hashed)
│   ├── adminPin: string (hashed)
│   └── createdAt: timestamp
├── members/
│   └── {memberId}/
│       ├── name: string
│       ├── dietaryRestrictions: string ("Normal" | "Vegetarian")
│       ├── joinedAt: timestamp
│       └── isAdmin: boolean
└── mealEntries/
    └── {entryId}/
        ├── date: string (YYYY-MM-DD)
        ├── mealType: string ("lunch" | "dinner")
        ├── memberId: string
        ├── attending: boolean
        ├── container: boolean
        └── lastUpdated: timestamp
```

## Authentication Flow

### Login Process
1. User enters name and PIN
2. App checks hardcoded credentials:
   - **Member PIN:** `170120` (any member can login)
   - **Admin PIN:** `1701202026` (José García only)
3. On successful login:
   - Set `currentMember` in state
   - Save to localStorage for auto-login
   - Fetch data from Firebase Firestore
4. On page refresh:
   - Auto-login from localStorage if available

### Authorization
- **Members:** Can only edit their own meal entries
- **Admins:** Can edit all meal entries and manage members
- **Enforcement:** Both client-side (UI) and server-side (Firestore rules)

## Build & Deployment Process

### Local Development
```bash
npm install              # Install dependencies
npm start                # Start Expo development server
                        # Opens http://localhost:8081
```

### Build for Web
```bash
npm run build            # Runs: expo export --platform web
                        # Output: dist/ directory
```

### Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
                        # Uploads dist/ to Firebase Hosting
                        # URL: https://house-meal-planner.web.app
```

### One-Step Build & Deploy
```bash
npm run build && firebase deploy --only hosting
```

## Features & UI Components

### Main Schedule Screen
- **Table Layout:**
  - Columns: Date | Meal Type | [Members] | Summary
  - Rows: Each day × 2 meals (lunch & dinner)
- **Member Columns:**
  - Logged-in member always appears first
  - Sorted alphabetically after
- **Meal Cells:** Three states
  1. Empty (gray) - not attending
  2. ✓ (blue) - attending
  3. ✓ + 🍱 (purple) - attending with container/lunchbox
- **Summary Column:**
  - Format: "4 normal + 2 vegetarian + 1 lunchbox"
  - Shows dietary breakdown per meal
  - Only counts attendees

### Admin Dashboard
- Monthly meal statistics
- Filtering and analytics

### Settings Screen
- User profile info
- Logout button

### Member Management (Admin only)
- Add/remove members
- Set dietary preferences

## Real-time Sync

### How It Works
1. Firebase Firestore listeners (`onSnapshot`)
2. When data changes on any device:
   - All connected clients receive update instantly
   - UI re-renders with new data
3. Optimistic updates:
   - Update UI immediately
   - Send to Firebase
   - Revert if error

### Offline Support
- Service worker caches assets
- PWA can work offline
- Changes sync when back online

## PWA (Progressive Web App)

### Service Worker
- **Purpose:** Cache assets, enable offline access
- **Strategy:** Cache-first for static assets
- **Location:** `public/service-worker.js`

### Web App Manifest
- **Purpose:** Allow "Add to Home Screen" installation
- **Location:** `public/manifest.json`
- **Supported:** iOS (after adding to home screen), Android

### Installation on Phone
1. Open https://house-meal-planner.web.app in browser
2. Browser menu → "Add to Home Screen"
3. App installed and works offline

## Environment Variables

### Required (.env.production)
```
EXPO_PUBLIC_FIREBASE_API_KEY=<key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<domain>
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<project>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<bucket>
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender>
EXPO_PUBLIC_FIREBASE_APP_ID=<app_id>
```

These are used at build time by Expo to configure Firebase.

## Responsive Design

### Breakpoints
- **Small Mobile:** < 480px
  - Font sizes: 20px (title), 8px (headers)
  - Date column: 70px
- **Mobile:** 480px - 768px
  - Font sizes: 24px (title), 9px (headers)
  - Date column: 85px
- **Desktop:** ≥ 768px
  - Font sizes: 32px (title), 11px (headers)
  - Date column: 90px

## Performance Considerations

### Optimizations
1. **Code Splitting:** Expo bundles efficiently
2. **Lazy Loading:** Firebase data loads on-demand
3. **Caching:** Service worker caches static assets
4. **Compression:** Firebase hosting compresses responses

### Monitoring
- Firebase Console: Real-time usage stats
- Browser DevTools: Network/performance tabs

## Security

### Firestore Rules
- Enforce authentication checks
- Users can only read their household data
- Members can only edit their own entries
- Admins have full access

### PIN Security
- PINs stored in code (simple implementation)
- For production: Consider storing hashed PINs in Firestore
- No password recovery mechanism (intentional simplicity)

## Troubleshooting Deployment

### Issue: App shows old version on phone
**Solution:** Clear PWA cache
- Go to Settings > [Browser] > Clear History/Cache
- Or reinstall the PWA from home screen

### Issue: Changes not appearing after deploy
**Solution:** Hard refresh or clear service worker
- Desktop: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Phone: Settings > [Browser] > Clear data

### Issue: Firebase credentials not loading
**Solution:** Check .env.production
```bash
cat .env.production  # Verify all 6 variables are set
npm run build        # Rebuild with correct env vars
```

## Git Workflow

### Commit & Deploy
```bash
# Make changes
git add App.js
git commit -m "description"
git push origin main

# Build and deploy
npm run build
firebase deploy --only hosting
```

### Branch for features
```bash
git checkout -b feature/name
# ... make changes
git push origin feature/name
# Create PR on GitHub
```

## Future Improvements

1. **Authentication:** Migrate to Firebase Auth for security
2. **Data Validation:** Server-side validation in Firestore rules
3. **Notifications:** Push notifications for meal reminders
4. **Export:** CSV/PDF export of meal data
5. **Multi-household:** Support multiple households per user
6. **Dark Mode:** Add theme switching
7. **Analytics:** Enhanced reporting and charts

## Useful Commands

```bash
# Development
npm start                              # Start local dev server

# Building
npm run build                          # Build for web

# Deployment
firebase login                         # Authenticate with Firebase
firebase deploy --only hosting         # Deploy to Firebase
firebase deploy --only firestore:rules # Deploy Firestore rules
firebase logs                          # View deployment logs

# Debugging
firebase serve                         # Test locally before deploy
firebase emulators:start               # Start local emulator suite
```

## Resources

- [Expo Docs](https://docs.expo.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Native Docs](https://reactnative.dev/)
- [PWA Docs](https://web.dev/progressive-web-apps/)

---

Last Updated: May 2026
