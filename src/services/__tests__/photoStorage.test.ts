jest.mock('expo-file-system', () => {
  const registry = new Map<string, boolean>();

  class File {
    uri: string;
    extension: string;

    constructor(...parts: Array<string | { uri: string }>) {
      this.uri = parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/');
      const match = this.uri.match(/\.[a-zA-Z0-9]+$/);
      this.extension = match ? match[0] : '';
    }

    get exists() {
      return registry.get(this.uri) ?? false;
    }

    async copy(destination: { uri: string }) {
      registry.set(destination.uri, true);
    }

    delete() {
      registry.set(this.uri, false);
    }
  }

  class Directory {
    uri: string;

    constructor(...parts: Array<string | { uri: string }>) {
      this.uri = parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/');
    }

    get exists() {
      return true;
    }

    create() {
      // no-op en el mock
    }
  }

  const document = new Directory('file:///document');

  return { File, Directory, Paths: { document }, __registry: registry };
});

import { persistPhoto, deletePhoto, photoExists } from '../photoStorage';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __registry: registry } = require('expo-file-system');

describe('photoStorage', () => {
  afterEach(() => {
    registry.clear();
  });

  it('persistPhoto copia la imagen con nombre único y devuelve la URI de la copia', async () => {
    registry.set('file:///tmp/original.jpg', true);
    const copyUri = await persistPhoto('file:///tmp/original.jpg');
    expect(copyUri).toMatch(/document\/photos\/.+\.jpg$/);
    expect(photoExists(copyUri)).toBe(true);
  });

  it('dos copias de la misma fuente obtienen nombres distintos', async () => {
    registry.set('file:///tmp/original.jpg', true);
    const first = await persistPhoto('file:///tmp/original.jpg');
    const second = await persistPhoto('file:///tmp/original.jpg');
    expect(first).not.toBe(second);
  });

  it('deletePhoto borra la copia existente', async () => {
    registry.set('file:///document/photos/a.jpg', true);
    await deletePhoto('file:///document/photos/a.jpg');
    expect(photoExists('file:///document/photos/a.jpg')).toBe(false);
  });

  it('deletePhoto es tolerante a archivo inexistente', async () => {
    await expect(deletePhoto('file:///document/photos/missing.jpg')).resolves.toBeUndefined();
  });

  it('deletePhoto es tolerante a URI vacía', async () => {
    await expect(deletePhoto(undefined)).resolves.toBeUndefined();
    await expect(deletePhoto('')).resolves.toBeUndefined();
  });

  it('deletePhoto es tolerante a error al borrar', async () => {
    registry.set('file:///document/photos/broken.jpg', true);
    const { File } = require('expo-file-system');
    const original = File.prototype.delete;
    File.prototype.delete = () => {
      throw new Error('fail');
    };
    await expect(deletePhoto('file:///document/photos/broken.jpg')).resolves.toBeUndefined();
    File.prototype.delete = original;
  });
});
