/* ==========================================================================
   tools/browser.mjs — kendali Chrome lewat DevTools Protocol tanpa dependensi.
   Dipakai untuk verifikasi: tangkapan layar, emulasi tema, dan pembacaan
   galat konsol. Bukan bagian dari situs; tidak dijalankan oleh browser.
   ========================================================================== */

import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export async function launch({ width = 1440, height = 1000 } = {}) {
  const userDir = mkdtempSync(join(tmpdir(), 'alpro-chrome-'));
  const proc = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--hide-scrollbars',
      '--remote-debugging-port=0',
      `--user-data-dir=${userDir}`,
      `--window-size=${width},${height}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );

  const wsUrl = await new Promise((resolve, reject) => {
    let buf = '';
    const timer = setTimeout(() => reject(new Error('Chrome tidak siap')), 15000);
    proc.stderr.on('data', (d) => {
      buf += d.toString();
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    proc.on('exit', () => reject(new Error('Chrome berhenti lebih awal')));
  });

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  const events = [];
  const listeners = new Map();

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
      else resolve(msg.result);
      return;
    }
    if (msg.method) {
      events.push(msg);
      const ls = listeners.get(msg.method);
      if (ls) ls.forEach((fn) => fn(msg.params));
    }
  });

  let sessionId = null;

  function send(method, params = {}, useSession = true) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      const msg = { id, method, params };
      if (useSession && sessionId) msg.sessionId = sessionId;
      ws.send(JSON.stringify(msg));
    });
  }

  function once(method, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`timeout ${method}`)), timeout);
      const fn = (params) => {
        clearTimeout(t);
        (listeners.get(method) || []).delete?.(fn);
        resolve(params);
      };
      if (!listeners.has(method)) listeners.set(method, new Set());
      listeners.get(method).add(fn);
    });
  }

  // WebSocket dari "DevTools listening" adalah target browser, bukan halaman.
  // Lampirkan ke tab pertama agar domain Page/Runtime tersedia.
  const { targetInfos } = await send('Target.getTargets', {}, false);
  const pageTarget = targetInfos.find((t) => t.type === 'page');
  if (!pageTarget) throw new Error('Tidak ada target halaman');
  const attached = await send(
    'Target.attachToTarget',
    { targetId: pageTarget.targetId, flatten: true },
    false
  );
  sessionId = attached.sessionId;

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Network.enable');

  const errors = [];
  const attachErrorSink = () => {
    listeners.set('Runtime.exceptionThrown', new Set([(p) => {
      errors.push(`exception: ${p.exceptionDetails?.exception?.description || p.exceptionDetails?.text}`);
    }]));
    listeners.set('Runtime.consoleAPICalled', new Set([(p) => {
      if (p.type === 'error') {
        errors.push(`console: ${p.args.map((a) => a.value ?? a.description ?? '').join(' ')}`);
      }
    }]));
    listeners.set('Log.entryAdded', new Set([(p) => {
      if (p.entry.level === 'error') errors.push(`log: ${p.entry.text} ${p.entry.url || ''}`);
    }]));
  };
  attachErrorSink();

  async function goto(url, opts = {}) {
    const { theme = 'light', wait = 900 } = opts;
    // Lebar/tinggi dapat ditimpa per navigasi agar pemeriksaan responsif
    // benar-benar mengubah viewport.
    const vw = opts.width ?? width;
    const vh = opts.height ?? height;
    errors.length = 0;
    await send('Emulation.setDeviceMetricsOverride', {
      width: vw,
      height: vh,
      deviceScaleFactor: 2,
      mobile: vw < 700,
    });
    await send('Emulation.setEmulatedMedia', {
      features: [
        { name: 'prefers-color-scheme', value: theme },
        { name: 'prefers-reduced-motion', value: 'no-preference' },
      ],
    });
    await send('Page.navigate', { url });
    // Navigasi hash tidak memicu loadEventFired lagi, jadi kesiapan dokumen
    // diperiksa langsung sebagai gantinya.
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      const state = await send('Runtime.evaluate', {
        expression: 'document.readyState',
        returnByValue: true,
      }).then((r) => r.result?.value).catch(() => null);
      if (state === 'complete') break;
      await new Promise((r) => setTimeout(r, 50));
    }
    await new Promise((r) => setTimeout(r, wait));
    return { errors: [...errors] };
  }

  async function evaluate(expression) {
    const { result, exceptionDetails } = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.text);
    return result.value;
  }

  async function shot(path, { full = false } = {}) {
    let clip;
    if (full) {
      const m = await send('Page.getLayoutMetrics');
      const size = m.cssContentSize || m.contentSize;
      clip = { x: 0, y: 0, width: size.width, height: size.height, scale: 1 };
      await send('Emulation.setDeviceMetricsOverride', {
        width: size.width,
        height: Math.min(size.height, 20000),
        deviceScaleFactor: 1,
        mobile: false,
      });
    }
    const { data } = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: Boolean(full),
      ...(clip ? { clip } : {}),
    });
    writeFileSync(path, Buffer.from(data, 'base64'));
    return path;
  }

  async function close() {
    try {
      ws.close();
    } catch {}
    proc.kill('SIGKILL');
  }

  return { send, goto, evaluate, shot, close, once };
}

/* ---- CLI: node tools/browser.mjs <url> <out.png> [theme] [full] --------- */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [url, out, theme = 'light', full = 'false'] = process.argv.slice(2);
  const b = await launch();
  const { errors } = await b.goto(url, { theme, full: full === 'true' });
  await b.shot(out, { full: full === 'true' });
  console.log(`saved ${out}`);
  if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
  else console.log('no console errors');
  await b.close();
}
