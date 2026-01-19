# Deployment Guide

This guide covers how to set up the necessary Firebase services and deploy the Quiz OS frontend to Vercel.

## 1. Firebase Setup

### A. Create Project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** and follow the setup steps.
3. Once created, click the Web icon (`</>`) to add a web app.
4. Copy the `firebaseConfig` object. You will need this for your environment variables.

### B. Firestore Database

1. Go to **Build > Firestore Database** in the sidebar.
2. Click **Create Database**.
3. Choose a location (e.g., `nam5` or `eur3`).
4. Start in **Test Mode** (we will update rules later).

### C. Authentication

1. Go to **Build > Authentication**.
2. Click **Get Started**.
3. Enable **Google** sign-in provider.
4. (Optional) Enable **Email/Password** if you implemented it.

### D. Security Rules

1. Go to **Firestore Database > Rules**.
2. Copy the contents of `firestore.rules` from this repository.
3. Paste them into the Firebase Console editor and click **Publish**.
   - _These rules are critical for securing the "Admin" vs "User" roles._

### E. Set Admin User

1. To make yourself an admin, you can manually create a document in the `users` collection.
2. **Collection**: `users`
3. **Document ID**: `YOUR_USER_UID` (find this in Authentication tab)
4. **Fields**:
   - `role`: "admin"
   - `email`: "your@email.com"

---

## 2. Environment Variables

Create a `.env` file in the root directory (for local development) or add these variables to Vercel (for production):

```ini
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 3. Deploy to Vercel

1. **Push your code** to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click **"Add New..." > "Project"**.
3. Import your GitHub repository.
4. Vercel should auto-detect **Vite**.
5. **Environment Variables**:
   - Copy/paste the values from your `.env` file into the Vercel "Environment Variables" section.
6. Click **Deploy**.

### Post-Deployment

- Go to your customized URL (e.g., `quiz-os.vercel.app`).
- ⚠️ **Important**: Add your Vercel domain to the **Authorized Domains** list in Firebase Console:
  - Go to **Authentication > Settings > Authorized Domains**.
  - Add your Vercel app domain.

---

## 4. Local Development

To run the project locally:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
