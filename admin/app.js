import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";


// Config e inizializzazione Firebase
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
const db = getFirestore(app);
const storage = getStorage(app);


// ------------------ Comportamento diverso per pagina ------------------
const path = window.location.pathname;

// === PAGINA LOGIN (index.html) ===
if (path.endsWith("/admin/") || path.endsWith("/admin/index.html")) {
  const loginForm = document.getElementById("login-form");
  const errorMsg = document.getElementById("login-error");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Se già loggato, vai direttamente in dashboard
    window.location.href = "dashboard.html";
    }
  });

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;

      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
      } catch (error) {
        console.error("Errore login:", error);
        if (errorMsg) {
          errorMsg.textContent = "Credenziali non valide.";
        }
      }
    });
  }
}

// === PAGINA DASHBOARD ===
if (path.includes("dashboard.html")) {
  const annunciForm = document.getElementById("annuncio-form");
  const container = document.getElementById("elenco-annunci");
  const modal = document.getElementById("modal");
  const closeModalBtn = document.getElementById("close-modal");
  const formTitle = document.getElementById("form-title");

  let editingId = null;

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Se non loggato, torna alla login
        window.location.href = "index.html";
    } else {
      caricaAnnunciAdmin();
    }
        // Logout automatico dopo 2 ore
    setTimeout(() => {
      alert("La sessione è scaduta. Effettua di nuovo l'accesso.");
      signOut(auth).then(() => {
        window.location.href = "index.html";
      });
    }, 2 * 60 * 60 * 1000); // 2 ore

  });

  function openModal(isEditing = false) {
    modal.classList.add("show");
    annunciForm.classList.remove("hidden");

    if (!isEditing) {
      formTitle.textContent = "Nuovo Annuncio";
      annunciForm.querySelector("button").textContent = "Salva Annuncio";
      annunciForm.reset();
      editingId = null;
    }
  }

  function closeModal() {
    modal.classList.remove("show");
    annunciForm.classList.add("hidden");
    annunciForm.reset();
    editingId = null;
    formTitle.textContent = "Nuovo Annuncio";
  }

  async function caricaAnnunciAdmin() {
    if (!container) return;
    container.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "annunci"));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${data.immagine}" alt="${data.titolo}">
        <div class="card-content">
          <h3>${data.titolo}</h3>
          <p><strong>Prezzo:</strong> ${data.prezzo}</p>
          <p><strong>Zona:</strong> ${data.zona}</p>
          <p>${data.descrizione}</p>
          <button class="btn-modifica" data-id="${id}">Modifica</button>
          <button class="btn-elimina" data-id="${id}">Elimina</button>
        </div>
      `;
      container.appendChild(card);
    });

    const addCard = document.createElement("div");
    addCard.className = "card aggiungi-card";
    addCard.innerHTML = `
      <div class="card-content">
        <div class="plus-icon">+</div>
        <p>Aggiungi Annuncio</p>
      </div>
    `;
    addCard.addEventListener("click", () => openModal(false));
    container.appendChild(addCard);

    document.querySelectorAll(".btn-elimina").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        await deleteDoc(doc(db, "annunci", id));
        caricaAnnunciAdmin();
      });
    });

    document.querySelectorAll(".btn-modifica").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const docSnap = await getDocs(collection(db, "annunci"));
        const selected = [...docSnap.docs].find((d) => d.id === id)?.data();

        if (selected) {
          annunciForm.titolo.value = selected.titolo;
          annunciForm.prezzo.value = selected.prezzo;
          annunciForm.zona.value = selected.zona;
          annunciForm.descrizione.value = selected.descrizione;
          annunciForm.immagine.value = selected.immagine;
          editingId = id;
          formTitle.textContent = "Modifica Annuncio";
          annunciForm.querySelector("button").textContent = "Aggiorna Annuncio";
          openModal(true);
        }
      });
    });
  }

  if (annunciForm) {
annunciForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titolo = annunciForm.titolo.value;
  const prezzo = annunciForm.prezzo.value;
  const zona = annunciForm.zona.value;
  const descrizione = annunciForm.descrizione.value;
  const immagineUrlInput = annunciForm.immagine.value;
  const file = document.getElementById("fileImg").files[0];

  let finalImageUrl = "";

  if (file) {
    try {
      const storageRef = ref(storage, `immagini/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      finalImageUrl = await getDownloadURL(snapshot.ref);
      console.log("File caricato:", finalImageUrl);
    } catch (err) {
      console.error("Errore upload file:", err);
      alert("Errore nel caricamento dell'immagine.");
      return;
    }
  } else if (immagineUrlInput.trim() !== "") {
    finalImageUrl = immagineUrlInput.trim();
  } else {
    alert("Inserisci un link o carica un'immagine.");
    return;
  }

  const data = {
    titolo,
    prezzo,
    zona,
    descrizione,
    immagine: finalImageUrl
  };

  if (editingId) {
    await updateDoc(doc(db, "annunci", editingId), data);
  } else {
    await addDoc(collection(db, "annunci"), data);
  }

  closeModal();
  caricaAnnunciAdmin();
});


  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}
