# Deploy to Vercel

## Quick Start

### Step 1: Push to GitHub (Already Done ✓)
Your code is already in: `https://github.com/thomas-sun_zse/feldmark_meal_planner`

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository `feldmark_meal_planner`
4. Vercel will auto-detect the project as a Node.js/React app

### Step 3: Add Environment Variables

In the Vercel dashboard, add these environment variables:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyA1UwOiPDAehtGihkpr6yHgVK7yxXFqVd8
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=house-meal-planner.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=house-meal-planner
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=house-meal-planner.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1289049613
EXPO_PUBLIC_FIREBASE_APP_ID=1:1289049613:web:2bf8c181f876b19171e744
```

### Step 4: Deploy

Click "Deploy" and Vercel will:
1. Build your app
2. Deploy to a live URL
3. Set up automatic deployments on every push to main

### Step 5: Access Your App

Your app will be live at: `https://feldmark-meal-planner.vercel.app`

## Continuous Deployment

- Any push to `main` branch automatically deploys
- Preview deployments for pull requests
- Rollback to previous deployments anytime

## Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records (instructions provided by Vercel)

## Troubleshooting

### Build fails
- Check that all env vars are set correctly
- Verify Firebase config is valid
- Run locally: `npm run build`

### App shows blank page
- Check browser console (F12) for errors
- Verify env vars are passed to build
- Check Firebase Firestore is accessible

### White screen on load
- Verify Firebase credentials
- Check network tab for failed requests
- Try clearing browser cache

## Monitoring

Visit Vercel Dashboard to:
- View real-time logs
- Monitor build times
- Track errors and analytics
- Manage team members

---

Your app is production-ready! 🚀
