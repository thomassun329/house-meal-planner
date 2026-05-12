# 🏠 House Meal Planner

A real-time household meal scheduling application built with React Native, Expo, and Firebase. Coordinate meals, track dietary preferences, and manage household meal planning with instant synchronization across all devices.

## Features

✨ **Core Features:**
- 📅 2-week ahead meal planning
- 👥 Multi-member household support
- 🍱 Container tracking
- 🥗 Dietary restrictions tracking
- 📊 Analytics dashboard with monthly statistics
- 🔄 Real-time synchronization across all devices
- 👤 Member management (add/remove)
- 🔐 Two-tier authentication (Member & Admin)
- 💾 Auto-login on page refresh
- 📱 Mobile-ready responsive design

## Quick Start

### Prerequisites
- Node.js 16+
- npm/yarn

### Installation

```bash
git clone <your-repo>
cd house-meal-planner
npm install
npm start
```

Open http://localhost:8081 in your browser.

### Login Credentials

**Member:**
- Name: Any member name (Alice, Bob, Sarah, etc.)
- PIN: `170120`

**Admin:**
- Name: `Jose`
- PIN: `1701202026`

## Tech Stack

- **Frontend:** React Native with Expo (web, iOS, Android)
- **Backend:** Firebase Firestore (real-time database)
- **Authentication:** PIN-based (two-tier)
- **Hosting:** Vercel (web) / Expo (mobile)

## Project Structure

```
├── App.js                 # Main React Native app
├── useFirebase.js         # Firebase hooks
├── firebase.js            # Firebase config
├── firestore.rules        # Security rules
├── app.json               # Expo config
├── package.json           # Dependencies
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

## Key Features Explained

### Meal Scheduling
- View 2 weeks of meal planning (lunch & dinner)
- Mark attendance with one-tap cycling:
  - Empty (not attending)
  - ✓ Attending
  - ✓ + 🍱 Attending with container
- Only edit your own meals (or all if admin)

### Dietary Tracking
- Support for multiple dietary options:
  - Normal
  - Vegetarian
  - Vegan
  - Gluten-free
  - Dairy-free
  - Nut allergy
- Automatic dietary breakdown in analytics

### Admin Dashboard
- Monthly meal statistics charts
- Filter by year, diet type, members
- Container count tracking
- Historical data analysis

### Member Management
- Add new members with dietary preferences
- Remove members (permanently)
- View all household members
- Track joined dates

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions:

- **Web:** Deploy to Vercel or Firebase Hosting
- **iOS:** Build and submit to App Store via TestFlight
- **Android:** Build and submit to Google Play Store

Quick deploy:
```bash
npm version patch
eas build --platform all
eas submit --platform all
```

## Environment Variables

Create `.env.local`:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Deploy security rules: `firebase deploy --only firestore:rules`
4. Add your Firebase credentials to `.env.local`

## Architecture

### Data Model

```
households/{householdId}
├── settings/
│   └── config
├── members/
│   ├── Alice
│   ├── Bob
│   └── ...
└── mealEntries/
    ├── 2026-05-12-Alice-lunch
    ├── 2026-05-12-Alice-dinner
    └── ...
```

### Real-time Sync

- Firebase Firestore `onSnapshot` listeners provide instant updates
- Changes on one device appear immediately on all others
- Optimistic UI updates for better UX
- Offline changes sync when reconnected

## Security

### Authentication
- PIN-based (no passwords)
- Member PIN: `170120` (editable)
- Admin PIN: `1701202026` (editable)
- Auto-login via localStorage

### Authorization
- Members can only edit their own meals
- Admins can edit all members' meals
- Security rules enforce at database level

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Future Enhancements

- 📧 Email notifications for meal changes
- 🔔 Push notifications for reminders
- 📤 Export meal data to CSV
- 🌙 Dark mode support
- 🗣️ Multiple household support
- 👨‍👩‍👧‍👦 Guest mode for temporary members
- 📝 Meal notes and special requests
- 🔄 Meal prep assignments

## Troubleshooting

### App won't start
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm start
```

### Login doesn't work
- Check member name exists in Firebase
- Verify PIN is correct
- Check Firestore security rules allow reads

### Real-time updates not syncing
- Check network connection
- Verify Firebase credentials
- Check browser console for errors (F12)

## Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -m "Add feature"`
3. Push: `git push origin feature/name`
4. Create Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check [Troubleshooting](#troubleshooting) section
- Review [DEPLOYMENT.md](./DEPLOYMENT.md)
- Check browser console (F12)
- Open a GitHub issue

---

Made with ❤️ for household meal coordination
