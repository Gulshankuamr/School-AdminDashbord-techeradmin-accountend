// public/firebase-messaging-sw.js
// ─────────────────────────────────────────────────────────────────────────────
// Background push handle karta hai (app band ho tab bhi)
// IMPORTANT: Ye file public/ folder mein honi chahiye (root level)
// ─────────────────────────────────────────────────────────────────────────────

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

// ⚠️ Same config jo firebaseConfig.js mein hai
const firebaseConfig = {
  apiKey: "AIzaSyCK5VaLT4kqgetalf9LJoXKjRBd_Pu4BHw",
  authDomain: "schoolerp-5df03.firebaseapp.com",
  projectId: "schoolerp-5df03",
  storageBucket: "schoolerp-5df03.firebasestorage.app",
  messagingSenderId: "96268264420",
  appId: "1:96268264420:web:b5558d0e87273f1af3ddf1",
  measurementId: "G-J6JHYESS4D"
};


const messaging = firebase.messaging()

// ── Background message handler ─────────────────────────────────────────────
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)

  const title = payload.notification?.title || 'New Notification'
  const body  = payload.notification?.body  || ''
  const icon  = payload.notification?.icon  || '/logo.png'

  self.registration.showNotification(title, {
    body,
    icon,
    badge: '/logo.png',
    data: payload.data || {},
  })
})

// ── Notification click → app open karo ────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/')
  )
})