const $ = s => document.querySelector(s);
const money = n => "$" + Math.round(n).toLocaleString("es-AR");
const CATS = window.CATEGORIES, BULK = window.BULK_MIN;
const waLink = t => `https://wa.me/${window.WA_NUMBER}` + (t ? `?text=${encodeURIComponent(t)}` : "");
document.querySelectorAll("[data-wa]").forEach(a => a.href = waLink("Hola! Quiero hacer una consulta."));

// ---------- Datos (Firebase o ejemplo) ----------
const DEMO = [
  { id: "d1", name: "Danza de luces 19t 0,8″", price: 40000, bulkPrice: 31500, category: "Tortas", stock: 8 },
  { id: "d2", name: "La poderosa 19t 1,2″", price: 80000, bulkPrice: 71500, category: "Tortas", stock: 4 },
  { id: "d3", name: "Show 12 luces", price: 17500, bulkPrice: 14500, category: "Tortas", stock: 10 },
  { id: "d4", name: "Caña voladora x6", price: 6000, category: "Cañas", stock: 20 },
  { id: "d5", name: "Mortero x3", price: 9000, bulkPrice: 7500, category: "Morteros", stock: 12 },
  { id: "d6", name: "Cañonazo x10", price: 3500, category: "Petardos", stock: 30 },
  { id: "d7", name: "Bengala de humo", price: 2500, category: "Infantiles", stock: 25 },
  { id: "d8", name: "Fuente dorada", price: 12000, category: "Fuegos artificiales", stock: 9 },
];
let products = [], cat = "", term = "";
let cart = JSON.parse(localStorage.getItem("rn-cart") || "{}");
const picks = {}; // cantidad elegida en cada tarjeta

const cfg = window.FIREBASE_CONFIG;
if (cfg && cfg.apiKey && cfg.projectId) {
  firebase.initializeApp(cfg);
  firebase.firestore().collection("products").onSnapshot(
    snap => { products = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.active !== false); renderAll(); },
    () => { products = DEMO; renderAll(); }
  );
} else { products = DEMO; renderAll(); }

// ---------- Catálogo ----------
function renderAll() { renderCats(); renderList(); renderCart(); }

function renderCats() {
  const n = c => products.filter(p => p.category === c).length;
  const list = CATS.filter(n);
  $("#total").textContent = products.length + " productos";
  $("#cats").innerHTML = `<button class="${cat ? "" : "on"}" data-c="">Todas<small>${products.length}</small></button>` +
    list.map(c => `<button class="${cat === c ? "on" : ""}" data-c="${c}">${c}<small>${n(c)}</small></button>`).join("");
}

function card(p) {
  const out = !(p.stock > 0), q = picks[p.id] || 1;
  return `<article class="card ${out ? "out" : ""}">
    <div class="ph ${p.image ? "" : "none"}" ${p.image ? `data-zoom="${p.id}"` : ""}>${p.image ? `<img loading="lazy" src="${p.image}" alt="${p.name}">` : "🎆"}</div>
    <div class="ci"><h3>${p.name}</h3><div class="price">${money(p.price)}</div>
    ${p.bulkPrice ? `<div class="bulk">Llevando ${BULK} o más productos surtidos: <b>${money(p.bulkPrice)}</b></div>` : ""}
    ${out ? `<div class="stock">Sin stock</div>` : `<div class="qty"><button data-m="${p.id}">−</button><span>${q}</span><button data-p="${p.id}">+</button></div>
    <div class="stock">Stock: ${p.stock}</div><div class="btns"><button class="btn" data-add="${p.id}">Añadir al carrito</button><button class="btn solid" data-buy="${p.id}">Comprar</button></div>`}</div></article>`;
}

function renderList() {
  const t = term.toLowerCase();
  const shown = products.filter(p => (!cat || p.category === cat) && p.name.toLowerCase().includes(t));
  const cats = CATS.filter(c => shown.some(p => p.category === c));
  $("#list").innerHTML = cats.length ? cats.map(c =>
    `<section class="sec"><h2>${c}</h2><div class="grid">${shown.filter(p => p.category === c).map(card).join("")}</div></section>`).join("")
    : `<p class="empty">No encontramos productos. Probá con otra búsqueda o categoría.</p>`;
}

$("#cats").onclick = e => { const b = e.target.closest("button"); if (b) { cat = b.dataset.c; renderCats(); renderList(); } };
$("#q").oninput = e => { term = e.target.value; renderList(); };
$("#list").onclick = e => {
  const t = e.target, id = t.dataset.p || t.dataset.m || t.dataset.add || t.dataset.buy;
  const p = products.find(x => x.id === (id || (t.closest("[data-zoom]") || {}).dataset?.zoom));
  if (!p) return;
  if (t.dataset.p) { picks[id] = Math.min(p.stock, (picks[id] || 1) + 1); renderList(); }
  else if (t.dataset.m) { picks[id] = Math.max(1, (picks[id] || 1) - 1); renderList(); }
  else if (t.dataset.add) {
    const before = cart[id] || 0, want = picks[id] || 1;
    cart[id] = Math.min(p.stock, before + want); picks[id] = 1;
    const added = cart[id] - before;
    save(); renderList(); renderCart();
    toast(added ? `Añadido al carrito: ${added} x ${p.name}` : "Ya tenés todo el stock disponible en tu pedido");
  } else if (t.dataset.buy) {
    const want = Math.min(p.stock, picks[id] || 1); picks[id] = 1;
    finish({ [id]: want });
  } else if (t.closest("[data-zoom]")) { $("#lb").src = p.image; $("#lbShade").hidden = false; }
};
$("#lbShade").onclick = () => $("#lbShade").hidden = true;

// ---------- Pedido ----------
const save = () => localStorage.setItem("rn-cart", JSON.stringify(cart));
function lines(src = cart) {
  const rows = Object.entries(src).map(([id, qty]) => ({ p: products.find(x => x.id === id), qty })).filter(r => r.p);
  const units = rows.reduce((a, r) => a + r.qty, 0), bulk = units >= BULK;
  rows.forEach(r => { r.unit = bulk && r.p.bulkPrice ? r.p.bulkPrice : r.p.price; r.sub = r.unit * r.qty; });
  return { rows, units, bulk, total: rows.reduce((a, r) => a + r.sub, 0) };
}
function renderCart() {
  const { rows, units, bulk, total } = lines();
  $("#count").textContent = units; $("#sum").textContent = money(total);
  $("#bulkNote").textContent = units && !bulk ? `Sumá ${BULK - units} producto(s) más y se aplica el precio por cantidad.` : bulk ? "Precio por cantidad aplicado." : "";
  $("#items").innerHTML = rows.length ? rows.map(({ p, qty, unit, sub }) => `<div class="it"><b>${p.name}</b><span class="sub">${money(sub)}</span>
    <small>${money(unit)} c/u</small><div class="qty"><button data-cm="${p.id}">−</button><span>${qty}</span><button data-cp="${p.id}">+</button></div></div>`).join("")
    : `<p class="empty">Todavía no agregaste productos.</p>`;
  $("#send").disabled = !rows.length;
}
$("#items").onclick = e => {
  const id = e.target.dataset.cp || e.target.dataset.cm; if (!id) return;
  const p = products.find(x => x.id === id);
  cart[id] = (cart[id] || 0) + (e.target.dataset.cp ? 1 : -1);
  if (cart[id] > p.stock) cart[id] = p.stock;
  if (cart[id] <= 0) delete cart[id];
  save(); renderCart();
};
$("#clear").onclick = () => { cart = {}; save(); renderCart(); };
$("#send").onclick = () => finish(cart);

// Arma el mensaje, abre WhatsApp y descuenta el stock de lo comprado.
function finish(src) {
  const { rows, bulk, total } = lines(src);
  if (!rows.length) return;
  const msg = `Hola! Quiero hacer este pedido:\n\n` + rows.map(r => `• ${r.qty} x ${r.p.name} — ${money(r.sub)}`).join("\n") +
    `\n\n${bulk ? "(Precio por cantidad aplicado)\n" : ""}Total: ${money(total)}\n\n¿Me confirman stock y coordinamos entrega y pago?`;
  window.open(waLink(msg), "_blank"); // primero, para que el celular no lo bloquee
  if (src === cart) { cart = {}; save(); toggle(false); }
  takeStock(rows);
  renderAll();
}
async function takeStock(rows) {
  if (!(cfg && cfg.apiKey && cfg.projectId)) { // modo ejemplo
    rows.forEach(r => { const p = products.find(x => x.id === r.p.id); if (p) p.stock = Math.max(0, p.stock - r.qty); });
    return renderAll();
  }
  const db = firebase.firestore();
  for (const r of rows) {
    const ref = db.collection("products").doc(r.p.id);
    try {
      await db.runTransaction(async t => {
        const snap = await t.get(ref);
        if (snap.exists) t.update(ref, { stock: Math.max(0, (snap.data().stock || 0) - r.qty) });
      });
    } catch (err) { console.error("No se pudo actualizar el stock", err); }
  }
}
let toastTimer;
function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2200); }
function toggle(open) { $("#drawer").classList.toggle("open", open); $("#shade").hidden = !open; $("#drawer").setAttribute("aria-hidden", !open); }
$("#openCart").onclick = () => toggle(true); $("#closeCart").onclick = $("#shade").onclick = () => toggle(false);

// ---------- Vistas y tema ----------
function route() {
  const v = location.hash.includes("como-comprar") ? "como-comprar" : "catalogo";
  $("#v-catalogo").hidden = v !== "catalogo"; $("#v-como-comprar").hidden = v !== "como-comprar";
  document.querySelectorAll("[data-nav]").forEach(a => a.classList.toggle("on", a.dataset.nav === v));
  if (location.hash !== "#catalogo") scrollTo(0, 0);
}
addEventListener("hashchange", route); route();
const root = document.documentElement;
root.dataset.theme = localStorage.getItem("rn-theme") || "dark";
$("#theme").onclick = () => { root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark"; localStorage.setItem("rn-theme", root.dataset.theme); };

// ---------- Acceso oculto: 4 toques al logo ----------
let taps = 0, tapTimer;
$("#logo").addEventListener("click", () => {
  taps++; clearTimeout(tapTimer); tapTimer = setTimeout(() => taps = 0, 1500);
  if (taps >= 4) { taps = 0; $("#pwShade").hidden = false; $("#pwMsg").textContent = ""; $("#pwIn").value = ""; $("#pwIn").focus(); }
});
$("#pwShade").onclick = e => { if (e.target.id === "pwShade") e.target.hidden = true; };
$("#pwForm").onsubmit = async e => {
  e.preventDefault();
  const A = window.ADMIN, msg = $("#pwMsg"), until = +localStorage.getItem("rn-lock") || 0;
  if (!A.hash) { msg.textContent = "Falta configurar la contraseña (hash.html)."; return; }
  if (Date.now() < until) { msg.textContent = `Demasiados intentos. Esperá ${Math.ceil((until - Date.now()) / 1000)} s.`; return; }
  const h = await pbkdf2($("#pwIn").value, A.salt, A.iter);
  if (h === A.hash) { localStorage.removeItem("rn-fails"); sessionStorage.setItem("rn-admin", "1"); location.href = "admin.html"; return; }
  const f = (+localStorage.getItem("rn-fails") || 0) + 1; localStorage.setItem("rn-fails", f);
  if (f >= 3) localStorage.setItem("rn-lock", Date.now() + Math.min(300, 15 * 2 ** (f - 3)) * 1000);
  msg.textContent = "Contraseña incorrecta."; $("#pwIn").value = "";
};
