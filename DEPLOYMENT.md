# House Meal Planner - Deployment Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js 16+
- npm or yarn
- Git

### Setup
```bash
git clone <repo-url>
cd house-meal-planner
npm install
npm start
```

Open http://localhost:8081 in your browser.

**Login Credentials:**
- **Member:** Name: any member name, PIN: `170120`
- **Admin:** Name: `Jose`, PIN: `1701202026`

---

## Web Deployment (Production)

### Option 1: Vercel (Recommended for Web)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" → select your repo
4. Configure environment variables:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
5. Click "Deploy"

### Option 2: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

---

## Mobile Deployment (iOS & Android via Expo)

### Prerequisites
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Expo account: [Create at expo.io](https://expo.io)

### Step 1: Create Expo Account
```bash
expo login
```

### Step 2: Configure app.json
Update `app.json` with your app details:
```json
{
  "expo": {
    "name": "House Meal Planner",
    "slug": "house-meal-planner",
    "version": "1.0.0",
    "owner": "your_expo_username",
    "ios": {
      "bundleIdentifier": "com.yourcompany.housemealplanner"
    },
    "android": {
      "package": "com.yourcompany.housemealplanner"
    }
  }
}
```

### Step 3: Build for iOS (TestFlight)

```bash
eas build --platform ios
```

After build completes:
1. Go to [TestFlight](https://testflight.apple.com)
2. Add testers and share the link
3. Testers can download the app via TestFlight

### Step 4: Build for Android (Google Play)

```bash
eas build --platform android
```

After build completes:
1. Go to [Google Play Console](https://play.google.com/console)
2. Create an app and upload the APK/AAB
3. Set up testing tracks (internal, closed, open)

### Step 5: Release to App Stores

#### iOS App Store
```bash
eas submit --platform ios
```

#### Google Play Store
```bash
eas submit --platform android
```

---

## Updating Production

### Update code and version
```bash
# Update version in app.json
npm version patch  # or minor/major

# Build and deploy
eas build --platform all
eas submit --platform all
```

---

## Environment Variables

Create `.env.local` in project root:
```
EXPO_PUBLIC_FIREBASE_API_KEY=xxxxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
EXPO_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
EXPO_PUBLIC_FIREBASE_APP_ID=xxxxx
```

---

## Firebase Setup (Production)

### 1. Create Firestore Database
- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project
- Go to Firestore Database
- Create database in production mode

### 2. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Initialize Seed Data (Optional)
Run admin script to add initial members:
```bash
node scripts/init-members.js
```

---

## Troubleshooting

### App shows blank screen
- Check browser console for errors (F12)
- Verify Firebase credentials in `.env.local`
- Clear browser cache and reload

### Login fails
- Confirm member exists in Firebase
- Check PIN is exactly `170120` (member) or `1701202026` (admin)
- Verify Firestore security rules allow reads

### Real-time sync not working
- Check network connection
- Verify Firestore rules allow writes
- Check Firebase console for errors

### Build fails
```bash
# Clear cache and try again
rm -rf node_modules
rm package-lock.json
npm install
npm start
```

---

## Support

For issues:
1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Review Firebase console logs
3. Check browser DevTools console (F12)

---

## License

MIT
