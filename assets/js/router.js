/* ==========================================================================
   router.js — perutean berbasis hash (#/modul/1/vektor)
   Hash dipilih agar situs berjalan di hosting statis apa pun tanpa aturan
   penulisan ulang (rewrite), termasuk ketika dibuka dari server sederhana.
   ========================================================================== */

const subs = new Set();
let current = null;

export function parseRoute(hash = location.hash) {
  const raw = String(hash || '').replace(/^#/, '') || '/';
  const [pathPart, queryPart = ''] = raw.split('?');
  const path = pathPart.replace(/\/+$/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  const query = new URLSearchParams(queryPart);
  return { path, parts, query, href: `#${raw}` };
}

export function navigate(to, { replace = false } = {}) {
  const target = to.startsWith('#') ? to : `#${to}`;
  if (location.hash === target) {
    // Hash sama: tetap beri tahu pelanggan agar tautan yang diklik berulang
    // tidak terasa mati.
    emit(parseRoute(target));
    return;
  }
  if (replace) history.replaceState(null, '', target);
  else location.hash = target;
}

function emit(route) {
  current = route;
  subs.forEach((fn) => fn(route));
}

export function startRouter(handler) {
  subs.add(handler);
  window.addEventListener('hashchange', () => {
    emit(parseRoute());
  });
  emit(parseRoute());
}

export function currentRoute() {
  return current;
}

/* Arahkan #anchor di dalam konten menjadi gulir halus tanpa mengubah rute. */
export function initAnchorScroll() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-scroll]');
    if (!a) return;
    const id = a.getAttribute('data-scroll');
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  });
}
