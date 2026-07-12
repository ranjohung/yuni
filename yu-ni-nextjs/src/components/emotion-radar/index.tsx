'use client';

interface EmotionRadarProps {
  data: {
    empathy: number;
    expression: number;
    listening: number;
    confidence: number;
    strategy: number;
  };
  size?: number;
}

export default function EmotionRadar({ data, size = 200 }: EmotionRadarProps) {
  const labels = ['同理心', '表达', '倾听', '自信', '策略'];
  const values = [data.empathy, data.expression, data.listening, data.confidence, data.strategy];
  const points = values.map((value, index) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const radius = (value / 100) * (size / 2 - 30);
    return {
      x: size / 2 + radius * Math.cos(angle),
      y: size / 2 + radius * Math.sin(angle),
    };
  });

  const gridLines = [20, 40, 60, 80, 100].map((level) => {
    const radius = (level / 100) * (size / 2 - 30);
    return points.map((_, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      return {
        x: size / 2 + radius * Math.cos(angle),
        y: size / 2 + radius * Math.sin(angle),
      };
    });
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {gridLines.map((line, i) => (
        <polygon
          key={i}
          points={line.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}
      {points.map((point, i) => (
        <line
          key={i}
          x1={size / 2}
          y1={size / 2}
          x2={point.x}
          y2={point.y}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}
      <polygon
        points={points.map(p => `${p.x},${p.y}`).join(' ')}
        fill="rgba(139, 92, 246, 0.2)"
        stroke="url(#gradient)"
        strokeWidth="2"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      {points.map((point, i) => (
        <circle key={i} cx={point.x} cy={point.y} r="4" fill="#8b5cf6" />
      ))}
      {points.map((point, i) => (
        <text
          key={i}
          x={point.x}
          y={point.y - 8}
          textAnchor="middle"
          className="text-xs fill-gray-600 font-medium"
        >
          {labels[i]}
        </text>
      ))}
    </svg>
  );
}