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
