// script.js - carica sito + annunci immobiliari

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Firebase config e inizializzazione
const firebaseConfig = {
  apiKey: "AIzaSyAL7RTZt8k2DUlLsU69XSoxgdINt4kQdI4",
  authDomain: "edilimmobiliare-admin.firebaseapp.com",
  projectId: "edilimmobiliare-admin",
  storageBucket: "edilimmobiliare-admin.appspot.com",
  messagingSenderId: "940258539756",
  appId: "1:940258539756:web:d21d312071ca73638acdc9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Annunci fallback statici
const fallbackCards = [
  {
    immagine: "https://pwm.im-cdn.it/image/487017032/xxs-c.jpg",
    titolo: "Trilocale ristrutturato a Somma Lombardo",
    prezzo: "€145.000",
    zona: "Centro storico",
    descrizione: "Appartamento al secondo piano con soggiorno, cucina abitabile, due camere e bagno. Balcone e cantina."
  },
  {
    immagine: "https://pwm.im-cdn.it/image/1712966098/xxs-c.jpg",
    titolo: "Villa indipendente con giardino",
    prezzo: "€330.000",
    zona: "Arsago Seprio",
    descrizione: "Villa su due livelli con ampio giardino, box doppio, 3 camere e doppi servizi. Ottime finiture."
  },
  {
    immagine: "https://pwm.im-cdn.it/image/1750019250/xxs-c.jpg",
    titolo: "Quadrilocale via Giosuè Carducci, Saronno",
    prezzo: "€330.000",
    zona: "Saronno",
    descrizione: "Bilocale arredato con posto auto e cantina. Attualmente locato, ottima resa."
  }
];

// Funzione per caricare gli annunci
async function caricaAnnunci() {
  const container = document.getElementById("proposte-container");
  if (!container) return;

  let cards = [];
  try {
    const querySnapshot = await getDocs(collection(db, "annunci"));
    querySnapshot.forEach((doc) => {
      cards.push(doc.data());
    });
  } catch (error) {
    console.error("Errore nel recupero annunci:", error);
  }

  while (cards.length < 3) {
    cards.push(fallbackCards[cards.length]);
  }

  cards = cards.slice(0, 3);
  container.innerHTML = "";

  cards.forEach((data) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${data.immagine}" alt="${data.titolo}">
      <div class="card-content">
        <h3>${data.titolo}</h3>
        <p><strong>Prezzo:</strong> ${data.prezzo}</p>
        <p><strong>Zona:</strong> ${data.zona}</p>
        <p>${data.descrizione}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// Gestione DOM + eventi
document.addEventListener('DOMContentLoaded', () => {
  console.log('Sito caricato correttamente!');

  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  caricaAnnunci(); // Richiamata all’interno del DOMContentLoaded
});



  document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.getElementById("journeyWrapper");
    const slides = wrapper.querySelectorAll(".journey-slide");
    const dotsContainer = document.getElementById("journeyDots");
    let currentSlide = 0;

    // Crea dots
    slides.forEach((_, index) => {
      const dot = document.createElement("span");
      dot.className = "dot" + (index === 0 ? " active" : "");
      dot.addEventListener("click", () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    // Aggiungi barra dinamica sotto il titolo
    const progress = document.createElement("div");
    progress.className = "decor-progress";
    document.querySelector(".project-journey .title").appendChild(progress);

    function updateProgressBar() {
      const percentage = (currentSlide / (slides.length - 1)) * 100;
      progress.style.width = `${percentage}%`;
    }

    function goToSlide(index) {
      if (index < 0 || index >= slides.length) return;
      currentSlide = index;
      wrapper.scrollTo({
        left: wrapper.offsetWidth * index,
        behavior: "smooth"
      });
      updateActiveDot();
      updateProgressBar();
    }

    function updateActiveDot() {
      document.querySelectorAll(".journey-dots .dot").forEach((dot, idx) => {
        dot.classList.toggle("active", idx === currentSlide);
      });
    }

    document.querySelector(".nav-btn.prev").addEventListener("click", () => {
      if (currentSlide > 0) goToSlide(currentSlide - 1);
    });

    document.querySelector(".nav-btn.next").addEventListener("click", () => {
      if (currentSlide < slides.length - 1) goToSlide(currentSlide + 1);
    });

    // Rileva scroll manuale e aggiorna dot + barra
    wrapper.addEventListener("scroll", () => {
      const scrollLeft = wrapper.scrollLeft;
      const width = wrapper.offsetWidth;
      const index = Math.round(scrollLeft / width);
      if (index !== currentSlide) {
        currentSlide = index;
        updateActiveDot();
        updateProgressBar();
      }
    });

    updateProgressBar();
  });



