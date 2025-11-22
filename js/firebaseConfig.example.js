const firebaseConfig = {
  apiKey: "apikey-goes-here",
  authDomain: "authdomain-goes-here",
  projectId: "projectid-goes-here",
  storageBucket: "storagebucket-goes-here",
  messagingSenderId: "messagingsenderid-goes-here",
  appId: "appid-goes-here"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
