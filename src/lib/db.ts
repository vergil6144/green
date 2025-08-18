export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
  emailVerified: boolean;
}

class AuthDatabase {
  private dbName = 'authDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    // Only run on client side
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB is not available on server side');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }
      };
    });
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'emailVerified'>): Promise<User> {
    if (!this.db) throw new Error('Database not initialized');

    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      emailVerified: false
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.add(newUser);

      request.onsuccess = () => resolve(newUser);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('email');
      const request = index.get(email);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserById(id: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUser(user: User): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put(user);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteUser(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const authDB = new AuthDatabase();

// --- Stats DB ---
export interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  purchasedAt: Date;
}

export interface UserStats {
  userId: string;
  tasksCompleted: number;
  credits: number;
  purchases: PurchaseItem[];
  trashCalls: number;
}

class StatsDatabase {
  private dbName = 'statsDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB is not available on server side');
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => { this.db = request.result; resolve(); };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('userStats')) {
          db.createObjectStore('userStats', { keyPath: 'userId' });
        }
      };
    });
  }

  private getDb(): IDBDatabase {
    if (!this.db) throw new Error('Stats DB not initialized');
    return this.db;
  }

  async get(userId: string): Promise<UserStats> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['userStats'], 'readonly');
      const store = tx.objectStore('userStats');
      const req = store.get(userId);
      req.onsuccess = () => {
        const def: UserStats = {
          userId,
          tasksCompleted: 0,
          credits: 0,
          purchases: [],
          trashCalls: 0,
        };
        resolve(req.result ? { ...req.result, purchases: (req.result.purchases || []).map((p: any) => ({ ...p, purchasedAt: new Date(p.purchasedAt) })) } : def);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async set(stats: UserStats): Promise<void> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['userStats'], 'readwrite');
      const store = tx.objectStore('userStats');
      const req = store.put({ ...stats });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async update(userId: string, updater: (s: UserStats) => UserStats): Promise<UserStats> {
    await this.initIfNeeded();
    const current = await this.get(userId);
    const next = updater(current);
    await this.set(next);
    return next;
  }

  async initIfNeeded() {
    if (!this.db) {
      await this.init();
    }
  }

  async incrementTasks(userId: string, by = 1) {
    return this.update(userId, (s) => ({ ...s, tasksCompleted: s.tasksCompleted + by }));
  }

  async addCredits(userId: string, delta: number) {
    return this.update(userId, (s) => ({ ...s, credits: Math.max(0, s.credits + delta) }));
  }

  async addPurchase(userId: string, item: { id: string; name: string; price: number }) {
    const purchase: PurchaseItem = { ...item, purchasedAt: new Date() };
    return this.update(userId, (s) => ({ ...s, purchases: [purchase, ...s.purchases] }));
  }

  async incrementTrashCalls(userId: string, by = 1) {
    return this.update(userId, (s) => ({ ...s, trashCalls: s.trashCalls + by }));
  }
}

export const statsDB = new StatsDatabase();

// --- Submissions DB ---
export interface SubmissionRecord {
  id: string;
  userId: string;
  actionId: string;
  actionTitle: string;
  proofImage: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  points: number;
}

class SubmissionsDatabase {
  private dbName = 'submissionsDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (typeof window === 'undefined') throw new Error('IndexedDB is not available on server side');
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => { this.db = request.result; resolve(); };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('submissions')) {
          const store = db.createObjectStore('submissions', { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  }

  private getDb(): IDBDatabase {
    if (!this.db) throw new Error('Submissions DB not initialized');
    return this.db;
  }

  async initIfNeeded() {
    if (!this.db) await this.init();
  }

  async add(sub: SubmissionRecord): Promise<void> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['submissions'], 'readwrite');
      const store = tx.objectStore('submissions');
      const req = store.add({ ...sub });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async listAll(): Promise<SubmissionRecord[]> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['submissions'], 'readonly');
      const store = tx.objectStore('submissions');
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result || []).map((r: any) => ({ ...r, submittedAt: new Date(r.submittedAt) })));
      req.onerror = () => reject(req.error);
    });
  }

  async updateStatus(id: string, status: SubmissionRecord['status']): Promise<void> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['submissions'], 'readwrite');
      const store = tx.objectStore('submissions');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const rec = getReq.result;
        if (!rec) return resolve();
        const putReq = store.put({ ...rec, status });
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }
}

export const submissionsDB = new SubmissionsDatabase();

// --- Actions DB ---
export interface ActionDef {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'environmental' | 'social' | 'economic' | 'health';
  icon: string;
  proofRequired: boolean;
}

class ActionsDatabase {
  private dbName = 'actionsDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (typeof window === 'undefined') throw new Error('IndexedDB is not available on server side');
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => { this.db = request.result; resolve(); };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('actions')) {
          db.createObjectStore('actions', { keyPath: 'id' });
        }
      };
    });
  }

  private getDb(): IDBDatabase {
    if (!this.db) throw new Error('Actions DB not initialized');
    return this.db;
  }

  async initIfNeeded() {
    if (!this.db) await this.init();
  }

  async listAll(): Promise<ActionDef[]> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['actions'], 'readonly');
      const store = tx.objectStore('actions');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async add(action: ActionDef): Promise<void> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['actions'], 'readwrite');
      const store = tx.objectStore('actions');
      const req = store.add({ ...action });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async remove(id: string): Promise<void> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['actions'], 'readwrite');
      const store = tx.objectStore('actions');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

export const actionsDB = new ActionsDatabase();
