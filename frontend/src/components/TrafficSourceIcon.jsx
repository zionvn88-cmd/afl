// Traffic Source Logo Component
// Displays emoji/icon for traffic sources (no image files needed)

const TRAFFIC_SOURCE_ICONS = {
  'facebook': '📘',
  'google': '🔵',
  'tiktok': '🎵',
  'instagram': '📷',
  'twitter': '🐦',
  'youtube': '📺',
  'linkedin': '💼',
  'pinterest': '📌',
  'snapchat': '👻',
  'reddit': '🤖'
};

export function TrafficSourceIcon({ slug, icon, className = "w-6 h-6" }) {
  const emojiIcon = TRAFFIC_SOURCE_ICONS[slug?.toLowerCase()] || icon || '🌐';
  
  return (
    <span className={`text-2xl ${className}`} title={slug}>
      {emojiIcon}
    </span>
  );
}

export default TrafficSourceIcon;
