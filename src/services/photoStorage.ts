import { Directory, File, Paths } from 'expo-file-system';

const photosDirectory = new Directory(Paths.document, 'photos');

function ensurePhotosDirectory(): void {
  if (!photosDirectory.exists) {
    photosDirectory.create({ intermediates: true, idempotent: true });
  }
}

/** Copia la imagen elegida a la carpeta de documentos de la app con un nombre único. */
export async function persistPhoto(sourceUri: string): Promise<string> {
  ensurePhotosDirectory();
  const source = new File(sourceUri);
  const extension = source.extension || '.jpg';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
  const destination = new File(photosDirectory, uniqueName);
  await source.copy(destination);
  return destination.uri;
}

/** Borra la copia de la foto; tolerante a URI vacía, archivo inexistente o error. */
export async function deletePhoto(uri?: string): Promise<void> {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Tolerante: el borrado nunca debe lanzar hacia la UI.
  }
}

export function photoExists(uri: string): boolean {
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}
