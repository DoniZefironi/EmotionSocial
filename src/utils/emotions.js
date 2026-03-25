export const EMOTIONS = {
  happiness: { label: 'Счастлив', emoji: '😊', color: '#FFD93D', bgColor: '#FFF9E6' },
  sadness: { label: 'Грустный', emoji: '😢', color: '#74B9FF', bgColor: '#E8F4FF' },
  anger: { label: 'Злой', emoji: '😠', color: '#FF6B6B', bgColor: '#FFE8E8' },
  surprise: { label: 'Удивлён', emoji: '😮', color: '#A29BFE', bgColor: '#F0EEFF' },
  neutral: { label: 'Нейтральный', emoji: '😐', color: '#B2BEC3', bgColor: '#F4F5F7' },
  fear: { label: 'Испуган', emoji: '😨', color: '#00CEC9', bgColor: '#E0F8F7' },
  disgust: { label: 'Отвращение', emoji: '🤢', color: '#00B894', bgColor: '#E0F5F0' },
};

export function getDominantEmotion(emotionData) {
  if (!emotionData) return 'neutral';
  let maxVal = -1;
  let dominant = 'neutral';
  for (const [key, val] of Object.entries(emotionData)) {
    if (val > maxVal) {
      maxVal = val;
      dominant = key;
    }
  }
  return dominant;
}

export function getEmotionInfo(key) {
  return EMOTIONS[key] || EMOTIONS.neutral;
}

export function formatRelativeTime(date) {
  if (!date) return '';
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} д назад`;
}
