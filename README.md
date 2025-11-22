
# La Polla

La Polla is a party drinking game based on numbers, challenges, and hilarious dares.  
A player enters a number, and the app displays the associated phrase.  
Includes full admin panel, Firebase integration, animations, and PWA support.

---

## 🃏 Features

- Instant number search
- Random-number roulette animation
- Popup with extended descriptions
- Admin panel to add, edit, and delete phrases
- Visual state indicator for edited phrases
- Simple login system for admin access
- Firebase Firestore database integration
- Installable as a PWA (Progressive Web App)
- Mobile‑first design (iPhone / Android)

---

## 🧱 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Firebase Firestore
- **PWA:** `manifest.json` + icons
- **Deployment:** Netlify / GitHub Pages

---

## 🗂 Project Structure

```
LAPOLLA/
├── index.html
├── login.html
├── config.html
├── manifest.json
├── css/
│   ├── game.css
│   ├── login.css
│   └── config.css
├── js/
│   ├── game.js
│   ├── login.js
│   ├── config.js
│   └── firebaseConfig.js
└── icons/
    ├── icon-64.png
    ├── icon-192.png
    ├── icon-512.png
    └── king-of-the.bongo.svg
```

---

## 🛠 Installation

Clone the repo:

```
git clone https://github.com/USER/LAPOLLA.git
cd LAPOLLA
```

Run a local server:

```
npx serve .
```

---

## 🔥 Firebase Setup

Edit `js/firebaseConfig.example.js` with your own Firebase config and deleting the .example.

Recommended Firestore rules:

```
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow create, update, delete: if request.resource.data.apiKey == "YOUR_PRIVATE_API_KEY";
    }
  }
}
```

---

## 📱 PWA Installation

The project includes:

- `manifest.json`
- 64px / 192px / 512px icons
- Mobile splash support

On iOS:

1. Open the deployed site in Safari  
2. Tap **Share → Add to Home Screen**  

---

## Contributing

1. Open an issue for feature requests or bugs  
2. Fork the repo  
3. Create a pull request into `main`

---

## 📜 License

This project is licensed under the MIT License.
