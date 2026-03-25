import { CLOUDINARY_URL, CLOUDINARY_UPLOAD_PRESET, IS_CLOUDINARY_CONFIGURED } from '../config/cloudinaryConfig';

export async function uploadImage(imageUri) {
  if (!IS_CLOUDINARY_CONFIGURED) {
    return imageUri;
  }

  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  });
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Ошибка загрузки изображения');
  }

  const data = await response.json();
  return data.secure_url;
}
