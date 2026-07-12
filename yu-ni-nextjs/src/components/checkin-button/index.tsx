'use client';

import { useState } from 'react';
import { Calendar, Check } from 'lucide-react';
import { checkIn } from '@/server/actions/checkin';
import { useSession } from 'next-auth/react';

interface CheckInButtonProps {
  streakCount: number;
  checkedIn: boolean;
}

export default function CheckInButton({ streakCount, checkedIn }: CheckInButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [localCheckedIn, setLocalCheckedIn] = useState(checkedIn);
  const [localStreak, setLocalStreak] = useState(streakCount);

  const handleCheckIn = async () => {
    if (localCheckedIn || isLoading || !session?.user) return;
    
    setIsLoading(true);
    
    try {
      const result = await checkIn(session.user.id);
      if (result.success) {
        setLocalCheckedIn(true);
        setLocalStreak(result.streakCount);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckIn}
      disabled={localCheckedIn || isLoading}
      className={`bg-white/20 rounded-xl px-4 py-3 flex-1 flex flex-col items-center gap-2 transition-all ${
        !localCheckedIn ? 'hover:bg-white/30 cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className="flex items-center gap-2">
        {localCheckedIn ? (
          <Check className="h-5 w-5 text-green-400" />
        ) : (
          <Calendar className="h-5 w-5 text-green-300" />
        )}
        <span className="text-sm text-purple-100">
          {localCheckedIn ? '已签到' : '签到'}
        </span>
      </div>
      <p className="text-xl font-bold">{localStreak}天</p>
    </button>
  );
}