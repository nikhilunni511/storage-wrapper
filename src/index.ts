export type SWCallback = (key: string, value?: any) => void;

export type SWAction = 'set' | 'remove' | 'clear' | 'expired';

interface SWCallbacks {
  set?: Record<string, Function>;
  remove?: Record<string, Function>;
  clear?: Record<string, Function>;
  expired?: Record<string, Function>;
}

export class StorageWrapper {
  private storage: Storage;
  private namespace: string;
  private callbacks: SWCallbacks;

  constructor(storageType: 'local' | 'session', namespace: string = '') {
    this.storage = storageType === 'local' ? localStorage : sessionStorage;
    this.namespace = namespace;
    this.callbacks = { set: {}, remove: {}, clear: {}, expired: {} };
  }

  private executeCallbacks(action: keyof SWCallbacks, key: string, value?: any): void {
    const events = this.callbacks[action];
    if (events) {
      Object.keys(events).forEach((event) => {
        events[event](key, value);
      });
    }
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

  on(action: SWAction, event: string, callback: string): void {
    if(!this.callbacks[action]) {
      this.callbacks[action] = {};
    }
    const func = new Function('return ' + callback);
    this.callbacks[action] = {
      [event]: func()
    };
  }

  off(action: SWAction, event: string): void {
    if (this.callbacks[action]) {
      delete this.callbacks[action]?.[event];
    }
  }
}
