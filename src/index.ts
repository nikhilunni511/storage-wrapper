type Callback = (key: string, value?: any) => void;

interface Callbacks {
  set?: Callback[];
  remove?: Callback[];
  clear?: Callback[];
  expired?: Callback[];
}

export class StorageWrapper {
  private storage: Storage;
  private namespace: string;
  private callbacks: Callbacks;

  constructor(storageType: 'local' | 'session', namespace: string = '') {
    this.storage = storageType === 'local' ? localStorage : sessionStorage;
    this.namespace = namespace;
    this.callbacks = { set: [], remove: [], clear: [], expired: [] };
  }

  private executeCallbacks(event: keyof Callbacks, key: string, value?: any): void {
    this.callbacks[event]?.forEach((callback) => callback(key, value));
  }

  private getFullKey(key: string): string {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }

  set(key: string, value: any, expirationInMinutes: number | null = null): void {
    const fullKey = this.getFullKey(key);
    const item = {
      value,
      expiration: expirationInMinutes ? new Date().getTime() + expirationInMinutes * 60000 : null,
    };
    this.storage.setItem(fullKey, JSON.stringify(item));
    this.executeCallbacks('set', key, value);
  }

  get<T>(key: string): T | null {
    const fullKey = this.getFullKey(key);
    const itemStr = this.storage.getItem(fullKey);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (item.expiration && new Date().getTime() > item.expiration) {
      this.storage.removeItem(fullKey);
      this.executeCallbacks('expired', key);
      return null;
    }
    return item.value;
  }

  remove(key: string): void {
    const fullKey = this.getFullKey(key);
    this.storage.removeItem(fullKey);
    this.executeCallbacks('remove', key);
  }

  clear(): void {
    if (this.namespace) {
      Object.keys(this.storage).forEach(key => {
        if (key.startsWith(`${this.namespace}:`)) {
          this.storage.removeItem(key);
        }
      });
      this.executeCallbacks('clear', '');
    } else {
      this.storage.clear();
    }
  }

  on(event: keyof Callbacks, callback: Callback): void {
    if (this.callbacks[event]) {
      this.callbacks[event]!.push(callback);
    }
  }
}
