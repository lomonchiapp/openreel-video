// Handoff de video desde el estudio (ixipost.com): same-origin comparte
// IndexedDB — el estudio deposita el archivo elegido y el editor lo importa
// al crear el proyecto (#/new). El registro caduca a los 10 minutos.

const DB_NAME = "ixipost-video-handoff";
const STORE = "files";
const KEY = "pending";
const MAX_AGE_MS = 10 * 60 * 1000;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });
}

async function consumePendingFile(): Promise<File | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const get = store.get(KEY);
      get.onsuccess = () => {
        const rec = get.result as { file?: File; ts?: number } | undefined;
        store.delete(KEY);
        const fresh = rec?.file && rec.ts && Date.now() - rec.ts < MAX_AGE_MS;
        resolve(fresh ? (rec!.file as File) : null);
      };
      get.onerror = () => resolve(null);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return null;
  }
}

// Importa el archivo pendiente (si lo hay) a la biblioteca del proyecto actual.
export async function importPendingHandoff(): Promise<void> {
  const file = await consumePendingFile();
  if (!file) return;
  try {
    const { initializeMediaBridge } = await import("@/bridges/media-bridge");
    const bridge = await initializeMediaBridge();
    await bridge.importFiles([file]);
  } catch {
    // Si falla, el usuario puede importarlo a mano — no rompemos el arranque.
  }
}
