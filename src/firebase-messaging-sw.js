importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Pega aquí el mismo objeto firebaseConfig del paso anterior
firebase.initializeApp({
   apiKey: "AIzaSyBijxSzEKE2OBcRHVC2DQ0Z3iz69LzVcUk",
  authDomain: "habit-tracker-fee77.firebaseapp.com",
  projectId: "habit-tracker-fee77",
  storageBucket: "habit-tracker-fee77.firebasestorage.app",
  messagingSenderId: "264067148916",
  appId: "1:264067148916:web:853c2b9209aa4f930bf521",
  measurementId: "G-CSVNC415ER"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icons/icon-192x192.png' // Ícono generado por la PWA
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});