import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAL7RTZt8k2DUlLsU69XSoxgdINt4kQdI4",
  authDomain: "edilimmobiliare-admin.firebaseapp.com",
  projectId: "edilimmobiliare-admin",
  storageBucket: "edilimmobiliare-admin.appspot.com",
  messagingSenderId: "940258539756",
  appId: "1:940258539756:web:d21d312071ca73638acdc9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Se già loggato, vai in dashboard
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});

const form = document.getElementById("login-form");
const errorMsg = document.getElementById("login-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    errorMsg.textContent = "";
    window.location.href = "dashboard.html";
  } catch (error) {
    errorMsg.textContent = "Credenziali errate";
  }
});
