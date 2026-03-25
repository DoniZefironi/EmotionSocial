// Cloudinary — бесплатное хранилище изображений (25 ГБ/мес бесплатно)
// Регистрация: https://cloudinary.com/users/register/free
// После регистрации откройте Dashboard и скопируйте Cloud name
// Затем: Settings → Upload → Add upload preset → выбрать "Unsigned" → сохранить

export const CLOUDINARY_CLOUD_NAME = 'dzo9vbton';        // например: 'dxyz123abc'
export const CLOUDINARY_UPLOAD_PRESET = 'EmotionSocial';  // например: 'ml_default'
export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const IS_CLOUDINARY_CONFIGURED =
  CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUD_NAME' &&
  CLOUDINARY_UPLOAD_PRESET !== 'YOUR_UPLOAD_PRESET';
