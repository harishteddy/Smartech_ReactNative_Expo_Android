# Smartech CE — React Native Expo Demo (Android)

A fully functional demo app showcasing **Netcore Smartech Customer Engagement (CE)** SDK integration with **React Native Expo SDK 56** using the **bare/prebuild workflow**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [SDK Versions](#sdk-versions)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Configuration](#configuration)
- [Build & Run](#build--run)
- [Project Structure](#project-structure)
- [Screens](#screens)
- [SDK Integration Details](#sdk-integration-details)
- [Troubleshooting](#troubleshooting)

---

## Overview

This app demonstrates end-to-end integration of the Smartech CE SDK in a React Native Expo project, including:

- Push notifications (FCM)
- In-App messages
- App Inbox (custom UI with bell badge and bottom-sheet modal)
- App Personalization / PX (Hansel nudges)
- Event tracking
- User identity and profile management
- Deep link routing

---

## Tech Stack

| Technology | Version |
|---|---|
| Expo SDK | 56.0.9 |
| React Native | 0.85.3 |
| React | 19.2.3 |
| React Navigation | v7 |
| New Architecture | Fabric + TurboModules |
| Node.js | >= 18 |

---

## SDK Versions

### React Native (JS) SDKs

| SDK | Package | Version |
|---|---|---|
| Base | smartech-base-react-native | 3.7.5 |
| Push | smartech-push-react-native | 3.7.3 |
| App Inbox | smartech-appinbox-react-native | 3.7.4 |
| Nudges (PX) | smartech-reactnative-nudges | 3.7.0 |

### Expo Config Plugins

| Plugin | Package | Version |
|---|---|---|
| Base Plugin | smartech-base-expo-plugin | 3.7.3 |
| Push Plugin | smartech-push-expo-plugin | 3.7.4 |
| App Inbox Plugin | smartech-appinbox-expo-plugin | 3.7.2 |

### Native Android SDKs (auto-resolved by plugins)

| SDK | Version |
|---|---|
| Base | 3.8.2 |
| Push | 3.8.2 |
| App Inbox | 3.8.0 |
| Nudges (Hansel/PX) | 10.3.1 |

---

## Features

- Auto Login — Session persists across app kills via AsyncStorage
- Guest Login — Browse without setting Smartech identity
- App Inbox — Bell icon with unread badge, bottom-sheet detail modal, HTML stripping, image support
- Push Notifications — FCM via Smartech, opt-in/out controls
- In-App Messages — Opt-in/out toggle
- Event Tracking — Preset and custom events fired to Smartech CE
- E-Commerce Demo — Shop, cart, wishlist with add_to_wishlist / remove_from_wishlist events
- PX Dashboard — Hansel event and deeplink listeners, screen tracking
- App Personalization — Widget carousel with live Smartech PX data
- Deep Link Routing — Handles both https:// and custom scheme (netcorepx://)
- CE Dashboard — Shows all SDK versions (RN + Native Android)
- Settings — Device GUID, Push Token, User Identity, SDK preference toggles
- New Architecture — Fabric renderer + TurboModules enabled

---

## Prerequisites

Ensure the following are installed before you begin:

```
Node.js        >= 18.x
npm            >= 9.x  (or yarn >= 1.22)
Java JDK       17  (required for React Native 0.85)
Android SDK    API 35 (compileSdkVersion), API 24+ (minSdkVersion)
Expo CLI       latest  ->  npm install -g expo-cli
```

### Android-specific

- Android Studio with Android SDK Platform 35 and Build-Tools 35
- Android Emulator or physical device with USB debugging enabled
- ANDROID_HOME environment variable set
- adb available in PATH

---

## Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/harishteddy/Smartech_ReactNative_Expo_Android.git
cd Smartech_ReactNative_Expo_Android
```

### 2. Install JS dependencies

```bash
npm install
```

### 3. Configure Smartech credentials

Open app.json and fill in your Smartech credentials:

```json
"smartechMetaData": [
  { "name": "SMT_APP_ID", "value": "YOUR_SMARTECH_APP_ID" }
],
"smartechNudges": {
  "smartechNudgesMetaData": [
    { "name": "HANSEL_APP_ID",  "value": "YOUR_HANSEL_APP_ID" },
    { "name": "HANSEL_APP_KEY", "value": "YOUR_HANSEL_APP_KEY" }
  ]
}
```

Also fill in the iOS section:

```json
"ios": {
  "appId": "YOUR_SMARTECH_IOS_APP_ID"
}
```

### 4. Add Firebase configuration

Replace google-services.json in the root with your project's file from:
https://console.firebase.google.com/

---

## Configuration

### app.json Key Plugin Settings

| Setting | Description |
|---|---|
| isNewArchEnabled: true | Enables Fabric + TurboModules |
| deepLinkDelay: 3 | Seconds before deeplink fires after cold start |
| useSmartechFCM: true | Uses Smartech custom FCM service |
| autoAskNotificationPermission: true | Prompts push permission on launch |
| autoFetchLocation: false | Location not fetched automatically |
| isLogEnabled: true | SDK debug logs (disable for production) |

### Deep Link Scheme

The app handles the custom URI scheme netcorepx://. Registered in app.json:

```json
"intentFilters": [
  {
    "action": "VIEW",
    "data": [{ "scheme": "netcorepx" }],
    "category": ["BROWSABLE", "DEFAULT"]
  }
]
```

---

## Build & Run

> NOTE: This is a bare/prebuild Expo project. The android/ and ios/ folders are committed and contain custom native code. Do NOT run expo prebuild --clean unless you need to regenerate native files.

### Run on Android

```bash
npx expo run:android
```

### Run on iOS

```bash
npx expo run:ios
```

### Start Metro only (native app already installed)

```bash
npx expo start
```

### Metro cannot connect to device

```bash
adb reverse tcp:8081 tcp:8081
# Press 'r' in Metro to reload
```

### Rebuild after config changes in app.json

```bash
npx expo prebuild --platform android
npx expo run:android
```

> After prebuild --clean, the withSmartechSetup.js config plugin automatically re-injects the TransparentCompat style into android/app/src/main/res/values/styles.xml.

---

## Project Structure

```
Smartech_ReactNative_Expo_Android/
├── android/                        # Native Android project
│   └── app/src/main/
│       ├── java/.../
│       │   ├── MainActivity.kt
│       │   ├── MainApplication.kt
│       │   └── SmartechFCMService.kt
│       └── res/values/styles.xml
├── ios/                            # Native iOS project
├── screens/
│   ├── SplashScreen.js             # Auto-login check
│   ├── LoginScreen.js              # Email + guest login
│   ├── RegisterScreen.js           # New account
│   ├── HomeScreen.js               # Feature grid dashboard
│   ├── ProfileScreen.js            # User profile + logout
│   ├── UpdateProfileScreen.js      # Edit profile fields
│   ├── CEDashboardScreen.js        # SDK version cards
│   ├── EventsScreen.js             # Fire preset/custom events
│   ├── CustomInboxScreen.js        # App Inbox with bell + modal
│   ├── PXDashboardScreen.js        # Hansel/PX dashboard
│   ├── AppPZScreen.js              # App Personalization carousel
│   ├── SettingsScreen.js           # Device info + SDK prefs
│   ├── DeviceInfoScreen.js         # GUID + push token
│   ├── ShopScreen.js               # Product listing
│   ├── ProductDetailScreen.js      # Product page + add to cart
│   ├── CartScreen.js               # Cart + checkout
│   └── WishlistScreen.js           # Saved products
├── store/
│   └── ShopContext.js              # Cart, wishlist, product state
├── utils/
│   ├── authSession.js              # AsyncStorage session helpers
│   ├── sdkVersions.js              # SDK version constants
│   └── theme.js                    # Shared colors and styles
├── assets/                         # Icons and splash images
├── App.js                          # Navigation + deeplink setup
├── app.json                        # Expo + SDK plugin config
├── withSmartechSetup.js            # Config plugin (TransparentCompat)
├── withKotlinVersion.js            # Config plugin (Kotlin version)
├── google-services.json            # Firebase config (replace with yours)
└── package.json
```

---

## Screens

| Screen | Route | Description |
|---|---|---|
| Splash | Splash | Logo animation + auto-login check |
| Login | Login | Email login or guest access |
| Register | Register | Create new account |
| Home | Home (tab) | Feature navigation grid |
| App Inbox | Inbox (tab) | Notifications with bell badge |
| Events | Events (tab) | Fire Smartech events |
| PX Dashboard | PX (tab) | Hansel nudges + personalization |
| Profile | Profile (tab) | User info + logout |
| CE Dashboard | CEDashboard | SDK version cards |
| Update Profile | UpdateProfile | Edit name, email, mobile, city, DOB |
| Settings | Settings | Device info + SDK preference toggles |
| Device Info | DeviceInfo | GUID, push token, OS info |
| Shop | Shop | Product grid with search + category filter |
| Product Detail | ProductDetail | Product page + add to cart/wishlist |
| Cart | Cart | Cart items + checkout |
| Wishlist | Wishlist | Saved products |
| App Personalization | AppPZ | PX widget carousel |

---

## SDK Integration Details

### Identity and Login

```js
SmartechBaseReact.login(email);
SmartechBaseReact.setUserIdentity(email);
SmartechBaseReact.updateUserProfile({ NAME, EMAIL, MOBILE });
HanselUserRn.setUserId(email);
```

### Logout

```js
SmartechBaseReact.logoutAndClearUserIdentity(true);
HanselUserRn.clear();
clearSession(); // clears AsyncStorage
```

### Event Tracking

```js
SmartechBaseReact.trackEvent('event_name', { key: 'value' });
```

### App Inbox Message Fields

| Field | Description |
|---|---|
| title | Notification title (HTML stripped in UI) |
| description | Body text (HTML stripped in UI) |
| subtitle | Secondary title |
| mediaURL | Banner image URL |
| deeplink | Action URL |
| trid | Unique message ID |
| status | "read" or "unread" |
| publishedDate | ISO date string or Unix timestamp |
| notificationType | e.g. "Image", "Text" |

### Wishlist Events

| Action | Event Fired |
|---|---|
| Add to wishlist | add_to_wishlist |
| Remove from wishlist | remove_from_wishlist |

### Deep Link Routing

Handles SmartechDeeplink, HanselDeeplinkEvent, and OS Linking events.
Routes to screens based on URL keywords. Opens external https:// URLs in the browser.

---

## Troubleshooting

### Unable to load script on device

```bash
adb reverse tcp:8081 tcp:8081
```

### AsyncStorage is null crash

Needs a full native rebuild — not just Metro reload:

```bash
npx expo run:android
```

### TransparentCompat style missing after prebuild

The withSmartechSetup.js plugin auto-injects it on every prebuild:

```bash
npx expo run:android
```

### Hansel/PX nudges not showing

1. Check HANSEL_APP_ID and HANSEL_APP_KEY values in app.json
2. Set addTestDevice: true during development
3. Rebuild the native app after any config changes

### Push notifications not received

1. Verify google-services.json matches your Firebase project
2. Check SMT_APP_ID value in app.json
3. Ensure device has granted notification permission
4. Check the Smartech dashboard for delivery status

### Build fails with Kotlin or Gradle errors

```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

---

## References

- Smartech RN Docs: https://developer.netcorecloud.com/docs/react-native-integration
- App Inbox Docs: https://developer.netcorecloud.com/docs/react-native-app-inbox-integration
- Expo Prebuild: https://docs.expo.dev/workflow/prebuild/
- Expo SDK 56: https://docs.expo.dev/versions/v56.0.0/

---

## License

This project is a demo/integration reference for Netcore Smartech CE SDK.
Copyright Netcore Cloud — All rights reserved.
