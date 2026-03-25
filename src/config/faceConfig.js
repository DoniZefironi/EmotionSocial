// Face++ API для распознавания эмоций (бесплатный тариф: 1000 запросов/месяц)
// Регистрация: https://www.faceplusplus.com/
// После регистрации создайте API Key в Dashboard

export const FACE_API_KEY = '2M6zvEMjfndPk8wD0qCaoUn_g9b6lXhm';
export const FACE_API_SECRET = 'DsEbQ7b2AS5-SdGX8BRc98mYJOX3cx8d';
export const FACE_API_URL = 'https://api-us.faceplusplus.com/facepp/v3/detect';

// Если API ключи не настроены, используется демо-режим (случайные эмоции)
export const IS_DEMO_MODE = !FACE_API_KEY || FACE_API_KEY === 'YOUR_FACE_API_KEY';
