// 1) Número de WhatsApp: código de país + 9 + código de área + número, sin + ni espacios.
window.WA_NUMBER = "5492920251745";

// 2) Firebase. Faltan apiKey y appId: los sacás de Configuración del proyecto → Tus apps → Web.
//    Mientras apiKey esté vacío, la tienda muestra productos de ejemplo.
window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "pirotecniarn.firebaseapp.com",
  projectId: "pirotecniarn",
  messagingSenderId: "164633107517",
  appId: ""
};

// 3) Contraseña del panel admin (hash PBKDF2, no es la contraseña en texto).
//    Generalo abriendo hash.html y pegá acá los dos valores.
window.ADMIN = { salt: "", hash: "", iter: 210000 };

// 4) Categorías (el orden es el que se muestra en la tienda).
window.CATEGORIES = ["Fuegos artificiales", "Infantiles", "Tortas", "Cañas", "Morteros", "Petardos"];

// 5) Llevando esta cantidad de unidades o más, se aplica el precio mayorista de cada producto.
window.BULK_MIN = 5;
