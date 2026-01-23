
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCmdEfwSCOkNSdeISaiKtVPzmTG-lD8qoU",
  authDomain: "hotel-ac054.firebaseapp.com",
  projectId: "hotel-ac054",
  storageBucket: "hotel-ac054.firebasestorage.app",
  messagingSenderId: "894096545210",
  appId: "1:894096545210:web:c20184efd3eac95f717983",
  measurementId: "G-LPKW6QDZBE"
};

let app;
let db: Firestore | null = null;

// API Key kontrolü: Eğer kullanıcı gerçek key'i girmediyse LocalStorage modunda devam et.
const isPlaceholder = firebaseConfig.apiKey === "BURAYA_GERCEK_API_KEY_GELECEK" || firebaseConfig.apiKey.includes("API_KEY");

if (!isPlaceholder) {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("Firebase bağlantısı başlatıldı: " + firebaseConfig.projectId);
    } catch (e) {
        console.error("Firebase bağlantı hatası:", e);
        console.warn("LocalStorage moduna geçiliyor.");
    }
} else {
    console.warn("Firebase API Key girilmedi. Uygulama OFFLINE (LocalStorage) modunda çalışıyor.");
    // db null kalır, bu da db.ts dosyasının LocalStorage kullanmasını sağlar.
}

export { db };
