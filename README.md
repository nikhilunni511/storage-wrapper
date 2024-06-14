# StorageWrapper

[![npm version](https://badge.fury.io/js/storage-wrapper.svg)](https://badge.fury.io/js/storage-wrapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A small utility for working with localStorage and sessionStorage in the browser, with support for type safety, expiration, and namespacing.

## Features

- Get, set, and remove items with type safety.
- Expiration support for stored items.
- Namespacing for avoiding key collisions.

## Installation

```sh
npm install storage-wrapper
```

## Usage

### TypeScript

```typescript
import { StorageWrapper } from 'storage-wrapper';

const localStorageWrapper = new StorageWrapper('local', 'myApp');
const sessionStorageWrapper = new StorageWrapper('session', 'myApp');

// Setting items
localStorageWrapper.set('user', { name: 'John Doe' }, 30); // Expires in 30 minutes
sessionStorageWrapper.set('sessionID', 'abc123');

// Getting items
console.log(localStorageWrapper.get('user')); // { name: 'John Doe' }
console.log(sessionStorageWrapper.get('sessionID')); // 'abc123'

// Removing items
localStorageWrapper.remove('user');
sessionStorageWrapper.remove('sessionID');

// Clearing all items in the namespace
localStorageWrapper.clear();
sessionStorageWrapper.clear();
```

## API

### `StorageWrapper`

#### `constructor(storageType: 'local' | 'session', namespace?: string)`

- `storageType`: Determines whether to use `localStorage` or `sessionStorage`.
- `namespace`: Optional namespace to avoid key collisions.

#### `set(key: string, value: any, expirationInMinutes?: number): void`

- `key`: The key under which the value is stored.
- `value`: The value to store.
- `expirationInMinutes`: Optional expiration time in minutes.

#### `get<T>(key: string): T | null`

- `key`: The key of the value to retrieve.
- Returns the value associated with the key, or `null` if the key doesn't exist or has expired.

#### `remove(key: string): void`

- `key`: The key of the value to remove.

#### `clear(): void`

- Clears all items within the namespace or all items if no namespace is specified.

## License

MIT

