interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: 'purple' | 'pink' | 'blue' | 'green' | 'orange';
  showPercentage?: boolean;
}

const colorClasses = {
  purple: 'bg-gradient-to-r from-purple-500 to-indigo-500',
  pink: 'bg-gradient-to-r from-pink-500 to-rose-500',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  green: 'bg-gradient-to-r from-green-500 to-emerald-500',
  orange: 'bg-gradient-to-r from-orange-500 to-amber-500',
};

export default function ProgressBar({ value, max, label, color = 'purple', showPercentage = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">{label}</span>
          {showPercentage && (
            <span className="text-xs font-medium text-gray-600">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}