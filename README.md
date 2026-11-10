# Pirotecnia RN · Tienda

Tienda estática (HTML, CSS y JS) con pedidos por WhatsApp. Productos y precios en Firebase Firestore (plan Spark, gratis).

## 1. Probarla
Abrí `index.html` (mejor con Live Server o `python3 -m http.server`). Sin Firebase configurado muestra productos de ejemplo.

## 2. Firebase (gratis)
Proyecto: `pirotecniarn`. Ya tenés Firestore creado. Falta:
1. **Configuración del proyecto → Tus apps → Web (`</>`)** → registrá una app y copiá `apiKey` y `appId` en `config.js`.
2. En Firestore → **Reglas**, pegá esto y publicá:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function ok(d) {
      return d.keys().hasOnly(['name','price','bulkPrice','stock','category','image','active'])
        && d.name is string && d.name.size() > 0 && d.name.size() <= 120
        && d.price is number && d.price >= 0 && d.price <= 100000000
        && d.stock is number && d.stock >= 0 && d.stock <= 100000
        && d.category in ['Fuegos artificiales','Infantiles','Tortas','Cañas','Morteros','Petardos']
        && (!('bulkPrice' in d) || d.bulkPrice == null || (d.bulkPrice is number && d.bulkPrice >= 0))
        && (!('image' in d) || (d.image is string && d.image.size() < 900000));
    }
    match /products/{id} {
      allow read: if true;
      allow create, update: if ok(request.resource.data);
      allow delete: if true;
    }
  }
}
```

## 3. Contraseña del panel admin
1. Abrí `hash.html`, escribí tu contraseña (mínimo 10 caracteres) y tocá **Generar**.
2. Pegá la línea resultante en `config.js` (reemplaza `window.ADMIN`). Después borrá `hash.html`.
3. En la tienda, tocá el **logo 4 veces seguidas**, ingresá la contraseña y se abre el panel para cargar, editar y borrar productos.

La contraseña no se guarda en texto: solo queda un hash PBKDF2-SHA256 con sal (210.000 vueltas), y hay bloqueo temporal tras 3 intentos fallidos.

> **Límite importante:** sin login de Firebase, el sitio es 100% estático y la contraseña solo protege el acceso al panel. Las reglas de arriba validan los datos, pero no pueden saber quién escribe: alguien con conocimientos técnicos podría modificar productos usando las claves públicas. Para una tienda chica es un riesgo bajo; si querés protección real, la opción es volver a Firebase Auth.

## 4. Publicar en GitHub Pages
1. Subí todo el contenido de esta carpeta a un repo.
2. **Settings → Pages → Deploy from a branch → main / (root)**.
3. Tu tienda queda en `https://tuusuario.github.io/nombre-del-repo/`.

## Cambios rápidos (`config.js`)
- `WA_NUMBER`: número de WhatsApp (`5492920251745`).
- `CATEGORIES`: categorías y su orden.
- `BULK_MIN`: cantidad para el precio mayorista (hoy 5).
