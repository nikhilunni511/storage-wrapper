import { StorageWrapper } from '../src';

describe('StorageWrapper', () => {
  let localStorageWrapper: StorageWrapper;
  let sessionStorageWrapper: StorageWrapper;

  beforeEach(() => {
    localStorageWrapper = new StorageWrapper('local', 'testApp');
    sessionStorageWrapper = new StorageWrapper('session', 'testApp');
    localStorage.clear();
    sessionStorage.clear();
  });

  test('should set and get items with localStorage', () => {
    localStorageWrapper.set('key', 'value');
    expect(localStorageWrapper.get<string>('key')).toBe('value');
  });

  test('should set and get items with sessionStorage', () => {
    sessionStorageWrapper.set('key', 'value');
    expect(sessionStorageWrapper.get<string>('key')).toBe('value');
  });

  test('should handle expiration', () => {
    localStorageWrapper.set('key', 'value', 1 / 60); // expires in 1 second
    expect(localStorageWrapper.get<string>('key')).toBe('value');
    setTimeout(() => {
      expect(localStorageWrapper.get<string>('key')).toBeNull();
    }, 2000);
  });

  test('should remove items', () => {
    localStorageWrapper.set('key', 'value');
    localStorageWrapper.remove('key');
    expect(localStorageWrapper.get<string>('key')).toBeNull();
  });

  test('should clear items within namespace', () => {
    localStorageWrapper.set('key1', 'value1');
    localStorageWrapper.set('key2', 'value2');
    localStorageWrapper.clear();
    expect(localStorageWrapper.get<string>('key1')).toBeNull();
    expect(localStorageWrapper.get<string>('key2')).toBeNull();
  });
});
