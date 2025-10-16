README - My Admin Dashboard (v2)
------------------------------------

This package is a ready-to-use static admin dashboard that connects to Firebase Authentication and Firestore.

Files:
- index.html
- style.css
- script.js

Setup:
1. Unzip.
2. Open script.js and replace the firebaseConfig object with your project's config (from Firebase Console -> Project settings -> Your apps).
3. In Firebase Console:
   - Authentication -> Sign-in method -> Enable Email/Password.
   - Authentication -> Users -> Add user (email & password) for each user.
   - Firestore -> Rules: set to allow users read/write only their own doc (see README).
   - Firestore -> Create collection 'users' (optional; the app will initialize a document on first login).
4. Upload files to GitHub Pages or any static host.

Notes:
- The app expects user-specific data stored under collection 'users' with document id = Firebase UID.
- The script supports using email directly. If you want username-only login, implement fake-email trick in script.js (commented).
