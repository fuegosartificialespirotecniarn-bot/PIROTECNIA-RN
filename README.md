# Pirotecnia RN · Tienda

Tienda estática (HTML, CSS y JS) con pedidos por WhatsApp. Productos y precios en Firebase Firestore (plan Spark, gratis).

## 1. Probarla
Abrí `index.html` (mejor con Live Server o `python3 -m http.server`). Sin Firebase configurado muestra productos de ejemplo.

## 2. Crear Firebase (gratis)
1. Entrá a https://console.firebase.google.com → **Agregar proyecto** (sin Analytics).
2. **Compilación → Firestore Database → Crear base de datos** (modo producción, región más cercana).
3. **Compilación → Authentication → Comenzar → Correo/contraseña** → habilitar. En **Users** agregá tu email y contraseña (ese será el único que edita).
4. **Configuración del proyecto → Tus apps → Web (`</>`)** → copiá `apiKey`, `authDomain`, `projectId`, `appId` y pegalos en `config.js`.
5. En Firestore → **Reglas**, pegá esto y publicá (todos leen, solo vos escribís):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

6. En **Authentication → Configuración → Dominios autorizados** agregá `tuusuario.github.io`.

> La `apiKey` de Firebase web es pública por diseño; lo que protege tus datos son las reglas de arriba.

## 3. Cargar productos
Abrí `/admin.html`, entrá con tu email y cargá nombre, precio, precio mayorista (opcional), stock, categoría y foto. Las fotos se reducen y se guardan dentro de Firestore, así no necesitás Storage (que ya no es gratis).

## 4. Publicar en GitHub Pages
1. Subí todo el contenido de esta carpeta a un repo.
2. **Settings → Pages → Deploy from a branch → main / (root)**.
3. Tu tienda queda en `https://tuusuario.github.io/nombre-del-repo/`.

## Cambios rápidos (`config.js`)
- `WA_NUMBER`: número de WhatsApp (`5492920251745`).
- `CATEGORIES`: categorías y su orden.
- `BULK_MIN`: cantidad para el precio mayorista (hoy 5).
