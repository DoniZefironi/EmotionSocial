import { FACE_API_KEY, FACE_API_SECRET, FACE_API_URL, IS_DEMO_MODE } from '../config/faceConfig';

function generateDemoEmotions() {
  const keys = ['happiness', 'sadness', 'anger', 'surprise', 'neutral', 'fear', 'disgust'];
  const dominant = keys[Math.floor(Math.random() * keys.length)];
  const emotions = {};
  let remaining = 100;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      emotions[k] = remaining;
    } else if (k === dominant) {
      const val = 50 + Math.floor(Math.random() * 40);
      emotions[k] = val;
      remaining -= val;
    } else {
      const val = Math.floor(Math.random() * (remaining / (keys.length - i)));
      emotions[k] = val;
      remaining -= val;
    }
  });
  return emotions;
}

export async function detectEmotion(base64Image) {
  if (IS_DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return { emotions: generateDemoEmotions(), isDemo: true };
  }

  const formData = new FormData();
  formData.append('api_key', FACE_API_KEY);
  formData.append('api_secret', FACE_API_SECRET);
  formData.append('image_base64', base64Image);
  formData.append('return_attributes', 'emotion');

  const response = await fetch(FACE_API_URL, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (data.error_message) {
    throw new Error(data.error_message);
  }

  if (!data.faces || data.faces.length === 0) {
    return null; // Лицо не найдено
  }

  return { emotions: data.faces[0].attributes.emotion, isDemo: false };
}
