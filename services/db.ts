import type { ProjectDelay, User, AnalysisResult, Company } from '../types';

const DB_NAME = 'CrowdScoreDB';
const DB_VERSION = 4; // Incremented version to trigger onupgradeneeded
const STORE_PROJECTS = 'projects';
const STORE_USERS = 'users';
const STORE_ANALYSES = 'companyAnalyses';
const STORE_DISMISSED_DUPLICATES = 'dismissedDuplicates';
const STORE_SETTINGS = 'settings';
const STORE_COMPANIES = 'companies'; // New store

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(new Error("Erro ao abrir o banco de dados."));
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: 'email' });
      }
      if (!db.objectStoreNames.contains(STORE_ANALYSES)) {
        db.createObjectStore(STORE_ANALYSES); // Key is the company name (string)
      }
      if (!db.objectStoreNames.contains(STORE_DISMISSED_DUPLICATES)) {
        // Key is the normalized URL string
        db.createObjectStore(STORE_DISMISSED_DUPLICATES);
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        // Key is the setting name (e.g., 'theme')
        db.createObjectStore(STORE_SETTINGS);
      }
      if (!db.objectStoreNames.contains(STORE_COMPANIES)) {
        db.createObjectStore(STORE_COMPANIES, { keyPath: 'name' });
      }
    };
  });
};

const getAllFromStore = <T>(storeName: string): Promise<T[]> => {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Erro ao buscar todos os dados de ${storeName}.`));
  });
};

const getFromStore = <T>(storeName: string, key: string): Promise<T | undefined> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error(`Erro ao buscar ${key} de ${storeName}.`));
    });
};

const getAllKeysFromStore = (storeName: string): Promise<string[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAllKeys();
        request.onsuccess = () => resolve(request.result as string[]);
        request.onerror = () => reject(new Error(`Erro ao buscar todas as chaves de ${storeName}.`));
    });
};


const getAllAnalysesFromStore = (): Promise<Record<string, AnalysisResult>> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const store = db.transaction(STORE_ANALYSES, 'readonly').objectStore(STORE_ANALYSES);
        const request = store.openCursor();
        const analyses: Record<string, AnalysisResult> = {};
        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                analyses[cursor.key as string] = cursor.value;
                cursor.continue();
            } else {
                resolve(analyses);
            }
        };
        request.onerror = () => reject(new Error("Erro ao buscar todas as análises."));
    });
};

const putInStore = <T>(storeName: string, item: T, key?: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = key ? store.put(item, key) : store.put(item);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(new Error(`Erro ao salvar item em ${storeName}.`));
    });
};

const removeManyFromStore = (storeName: string, ids: string[]): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        ids.forEach(id => store.delete(id));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(new Error(`Erro ao remover itens de ${storeName}.`));
    });
};

const removeFromStore = (storeName: string, key: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(new Error(`Erro ao remover ${key} de ${storeName}.`));
    });
};


export const dbService = {
  async initializeDB(initialProjects: ProjectDelay[], initialUsers: User[]) {
    const db = await openDB(); // OpenDB first to ensure upgrade is done
    const projects = await getAllFromStore<ProjectDelay>(STORE_PROJECTS);
    const users = await getAllFromStore<User>(STORE_USERS);

    if (projects.length === 0 && users.length === 0) {
      console.log("Inicializando o banco de dados com dados de exemplo...");
      const projectTx = db.transaction(STORE_PROJECTS, 'readwrite');
      const userTx = db.transaction(STORE_USERS, 'readwrite');
      
      initialProjects.forEach(p => projectTx.objectStore(STORE_PROJECTS).put(p));
      initialUsers.forEach(u => userTx.objectStore(STORE_USERS).put(u));

      await Promise.all([
         new Promise(resolve => projectTx.oncomplete = () => resolve(true)),
         new Promise(resolve => userTx.oncomplete = () => resolve(true))
      ]);
      console.log("Banco de dados inicializado.");
    }
  },

  getAllProjects: () => getAllFromStore<ProjectDelay>(STORE_PROJECTS),
  putProject: (project: ProjectDelay) => putInStore(STORE_PROJECTS, project),
  removeProjects: (ids: string[]) => removeManyFromStore(STORE_PROJECTS, ids),

  getAllUsers: () => getAllFromStore<User>(STORE_USERS),
  putUser: (user: User) => putInStore(STORE_USERS, user),

  getAllCompanyAnalyses: () => getAllAnalysesFromStore(),
  putCompanyAnalysis: (companyName: string, analysis: AnalysisResult) => putInStore(STORE_ANALYSES, analysis, companyName),

  getAllDismissedDuplicates: () => getAllKeysFromStore(STORE_DISMISSED_DUPLICATES),
  putDismissedDuplicate: (groupKey: string) => putInStore(STORE_DISMISSED_DUPLICATES, true, groupKey),
  
  getSetting: <T>(key: string) => getFromStore<T>(STORE_SETTINGS, key),
  putSetting: (key: string, value: any) => putInStore(STORE_SETTINGS, value, key),
  removeSetting: (key: string) => removeFromStore(STORE_SETTINGS, key),
  
  getAllCompanies: () => getAllFromStore<Company>(STORE_COMPANIES),
  putCompany: (company: Company) => putInStore(STORE_COMPANIES, company),
};
