/** IndexedDB persistence for user-added wallpapers (images & videos). */

export interface StoredWallpaper {
  id: string
  name: string
  type: string
  blob: Blob
}

const DB_NAME = 'gyan-os'
const STORE = 'wallpapers'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const req = run(t.objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      }),
  )
}

export function dbListWallpapers(): Promise<StoredWallpaper[]> {
  return tx('readonly', (s) => s.getAll() as IDBRequest<StoredWallpaper[]>)
}

export async function dbAddWallpaper(file: File): Promise<StoredWallpaper> {
  const item: StoredWallpaper = {
    id: crypto.randomUUID(),
    name: file.name.replace(/\.[^.]+$/, ''),
    type: file.type,
    blob: file,
  }
  await tx('readwrite', (s) => s.put(item))
  return item
}

export function dbDeleteWallpaper(id: string): Promise<unknown> {
  return tx('readwrite', (s) => s.delete(id))
}
