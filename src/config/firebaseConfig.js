// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyCK5VaLT4kqgetalf9LJoXKjRBd_Pu4BHw",
  authDomain: "schoolerp-5df03.firebaseapp.com",
  projectId: "schoolerp-5df03",
  storageBucket: "schoolerp-5df03.firebasestorage.app",
  messagingSenderId: "96268264420",
  appId: "1:96268264420:web:b5558d0e87273f1af3ddf1",
  measurementId: "G-J6JHYESS4D"
};



// Firebase initialize (ek baar hi hoga)
const app = initializeApp(firebaseConfig)
 
// Messaging instance
export const messaging = getMessaging(app)
 
// ── FCM Token generate karo (login ke time call karo) ─────────────────────────
export const generateToken = async () => {
  try {
    const permission = await Notification.requestPermission()
 
    if (permission !== 'granted') {
      console.warn('FCM: Notification permission denied')
      return null
    }
 
    const token = await getToken(messaging, {
      vapidKey: 'BCFXeVR0tF8DP4fMC_jIvrM5-5qEnezsIHbzzRPL5StMq2AwHkGLoq6HDcZ0UHkKr58uzCRoXRjmECJCVdBbgxQ', // Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
    })
 
    if (token) {
      console.log('FCM Token generated:', token)
      return token
    }
 
    console.warn('FCM: No token received')
    return null
  } catch (err) {
    console.error('FCM generateToken error:', err)
    return null
  }
}
 
// ── Foreground message listener (NotificationContext mein use hoga) ────────────
export { onMessage }
 