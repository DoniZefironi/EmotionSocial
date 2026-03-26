// загрузка в Cloudinary
import { CLOUDINARY_URL, CLOUDINARY_UPLOAD_PRESET, IS_CLOUDINARY_CONFIGURED } from '../config/cloudinaryConfig';

export async function uploadImage(imageUri) {
  if (!IS_CLOUDINARY_CONFIGURED) {
    return imageUri;
  }

  // Для веба: конвертируем URI в Blob
  if (imageUri.startsWith('http') || imageUri.startsWith('blob:')) {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, 'upload.jpg');
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const uploadResponse = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const err = await uploadResponse.json();
      throw new Error(err.error?.message || 'Ошибка загрузки изображения');
    }

    const data = await uploadResponse.json();
    return data.secure_url;
  }

  // Для React Native (мобильное приложение)
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  });
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  console.log('📤 Загрузка в Cloudinary:', {
    url: CLOUDINARY_URL,
    preset: CLOUDINARY_UPLOAD_PRESET,
    uri: imageUri,
  });

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });

  console.log('📥 Ответ Cloudinary:', {
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    const err = await response.json();
    console.error('❌ Ошибка Cloudinary:', err);
    throw new Error(err.error?.message || 'Ошибка загрузки изображения');
  }

  const data = await response.json();
  return data.secure_url;
}
