import { registerRootComponent } from 'expo';

import App from './src/App';

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed:', err));
  });

  // When a new SW takes over, reload so the new JS bundle is served
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
