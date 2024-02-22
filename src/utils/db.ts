import { IDBPDatabase, openDB } from 'idb';

export type StoreDefinition = {
  name: string;
  key?: string | string[];
  autoIncrement?: boolean;
  index?: { name: string; key: string | string[] };
};

type Store = string | StoreDefinition;

type GetStoreName<T extends Store> = T extends string ? T : T extends StoreDefinition ? T['name'] : never;

type GetStoreIndex<T extends Store> = T extends StoreDefinition
  ? T['index'] extends object
    ? T['index']['name']
    : never
  : never;

const getStoreName = <T extends Store>(store: T): string => {
  if (typeof store === 'string') return store;

  return store.name;
};

export const createDB = async <K extends Store, Stores extends K[], StoreName extends GetStoreName<Stores[number]>>(
  dbName: string,
  stores: Stores
) => {
  const db = await openDB(dbName, 1, {
    upgrade(database, oldVersion, newVersion, transaction, event) {
      for (const store of stores) {
        const name = getStoreName(store);
        if (database.objectStoreNames.contains(name)) {
          throw new Error(`(db:error) - Store with name: ${name} already exists.`);
        }

        let params: IDBObjectStoreParameters | undefined = undefined;

        if (typeof store === 'object') {
          if (!store.key && !store.autoIncrement) break;
          if (!params) params = {};

          params['keyPath'] = store.key;
          params['autoIncrement'] = store.autoIncrement;
        }

        const dbStore = database.createObjectStore(name);
        if (typeof store === 'object' && store.index) {
          dbStore.createIndex(store.index.name, store.index.key);
        }
      }
    },
  });

  const set = async (store: StoreName, key: IDBValidKey, value: any) => {
    await db.add(store, value, key);
  };

  const setMany = async (store: StoreName, entries: [IDBValidKey, any][]) => {
    const tx = db.transaction(store, 'readwrite');
    let promises: Promise<any>[] = [];
    for (const [key, value] of entries) {
      promises.push(tx.store.add(value, key));
    }

    promises.push(tx.done);

    await Promise.all(promises);
  };

  const get = async (store: StoreName, key: string) => {
    return await db.get(store, key);
  };

  const getAll = async (store: StoreName, count?: number) => {
    return await db.getAll(store, undefined, count);
  };

  const upsertMany = async (store: StoreName, entries: [IDBValidKey, any][]) => {
    const tx = db.transaction(store, 'readwrite');
    let promises: Promise<any>[] = [];
    for (const [key, value] of entries) {
      promises.push(tx.store.put(value, key));
    }

    promises.push(tx.done);

    await Promise.all(promises);
  };

  const upsert = async (store: StoreName, key: string, value: any) => {
    await db.put(store, value, key);
  };

  async function remove(store: StoreName, predicate: (key: IDBValidKey, value: any) => boolean): Promise<void>;
  async function remove(store: StoreName, key: string | IDBKeyRange): Promise<void>;
  async function remove(
    store: StoreName,
    keyOrPredicate: string | IDBKeyRange | ((key: IDBValidKey, value: any) => boolean)
  ): Promise<void> {
    if (typeof keyOrPredicate === 'function') {
      const tx = db.transaction(store, 'readwrite');

      let cursor = await tx.store.openCursor();

      while (cursor) {
        const key = cursor.key;
        const value = cursor.value;
        if (keyOrPredicate(key, value)) {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }

      return;
    }
    await db.delete(store, keyOrPredicate);
  }

  const clear = async (store: StoreName) => {
    await db.clear(store);
  };

  const raw = async <T>(cb: (db: IDBPDatabase) => T): Promise<T> => {
    return cb(db);
  };

  const onIndex = async <T>(store: StoreName, index: GetStoreIndex<Stores[number]>): Promise<T | undefined> => {
    return;
  };

  return { raw, get, getAll, set, upsert, upsertMany, clear, setMany, delete: remove };
};

export const noopDb = {
  get: (store: string, key: string) => ({}),
  getAll: (store: string) => [],
  upsert: (store: string, key: string, value: any) => {},
  set: (store: string, key: string, value: any) => {},
  setMany: (store: string, entries: [any, any][]) => {},
  delete: (store: string, key: string) => {},
  raw: () => {},
};
