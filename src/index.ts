export class StorageWrapper {
  private storage: Storage;
  private namespace: string;

  constructor(storageType: 'local' | 'session', namespace: string = '') {
    this.storage = storageType === 'local' ? localStorage : sessionStorage;
    this.namespace = namespace;
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
  }

  get<T>(key: string): T | null {
    const fullKey = this.getFullKey(key);
    const itemStr = this.storage.getItem(fullKey);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (item.expiration && new Date().getTime() > item.expiration) {
      this.storage.removeItem(fullKey);
      return null;
    }
    return item.value;
  }

  remove(key: string): void {
    const fullKey = this.getFullKey(key);
    this.storage.removeItem(fullKey);
  }

  clear(): void {
    if (this.namespace) {
      Object.keys(this.storage).forEach(key => {
        if (key.startsWith(`${this.namespace}:`)) {
          this.storage.removeItem(key);
        }
      });
    } else {
      this.storage.clear();
    }
  }
}
