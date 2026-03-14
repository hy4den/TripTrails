import { MAX_PHOTO_SIZE_MB, ALLOWED_IMAGE_TYPES } from '../utils/constants';

export function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Yalnizca JPEG, PNG ve WebP dosyalari yuklenebilir.' };
  }
  if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Dosya boyutu ${MAX_PHOTO_SIZE_MB}MB sinirini asiyor.` };
  }
  return { valid: true };
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Dosya okunamadi.'));
    reader.readAsDataURL(file);
  });
}

async function uploadFile(file, filePath) {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${timestamp}_${safeName}`;

  const fileData = await readFileAsDataURL(file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, filePath, fileData }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Dosya yuklenemedi.');
  }

  const { url } = await response.json();
  return url;
}

export async function uploadPinPhoto(file, routeId, pinId) {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  return uploadFile(file, `routes/${routeId}/pins/${pinId}`);
}

export async function deletePinPhoto(_photoURL) {
  // Local dosyalar icin silme islemi gerekli degil (dev ortami)
}

export async function uploadAvatar(userId, file) {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  return uploadFile(file, `avatars/${userId}`);
}

export async function uploadPinPhotos(files, routeId, pinId, onProgress) {
  const urls = [];
  for (let i = 0; i < files.length; i++) {
    try {
      const url = await uploadPinPhoto(files[i], routeId, pinId);
      urls.push(url);
      onProgress?.({ completed: i + 1, total: files.length, url });
    } catch (error) {
      console.error(`Failed to upload ${files[i].name}:`, error);
      onProgress?.({ completed: i + 1, total: files.length, error: error.message });
    }
  }
  return urls;
}
