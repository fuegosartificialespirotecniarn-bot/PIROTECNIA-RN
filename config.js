// 1) Número de WhatsApp: código de país + 9 + código de área + número, sin + ni espacios.
window.WA_NUMBER = "5492920251745";

// 2) Firebase
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBGPXY7Azn7FSQ_pmE33K-BhlDvtulhjdE",
  authDomain: "pirotecniarn.firebaseapp.com",
  projectId: "pirotecniarn",
  messagingSenderId: "164633107517",
  appId: "1:164633107517:web:75e108f8c76fbbb3f95e54"
};

// 3) Contraseña del panel admin (hash PBKDF2, no es la contraseña en texto).
window.ADMIN = { salt: "C7d2EQJH+I7B4dxGTHBITA==", hash: "K9BibEX6VPvdTyIB0/kkaQDgBdtjIyUgBjRNuMXCwpg=", iter: 210000 };

// 4) Categorías (el orden es el que se muestra en la tienda).
window.CATEGORIES = ["Fuegos artificiales", "Infantiles", "Tortas", "Cañas", "Morteros", "Petardos", "Bengalas de humo", "Combos"];

// 5) Llevando esta cantidad de unidades o más, se aplica el precio mayorista de cada producto.
window.BULK_MIN = 5;
