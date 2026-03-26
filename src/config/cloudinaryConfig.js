export const CLOUDINARY_CLOUD_NAME = 'dzo9vbton';        
export const CLOUDINARY_UPLOAD_PRESET = 'EmotionSocial';  
export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const IS_CLOUDINARY_CONFIGURED =
  CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUD_NAME' &&
  CLOUDINARY_UPLOAD_PRESET !== 'YOUR_UPLOAD_PRESET';
