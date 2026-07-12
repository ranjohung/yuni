'use client';

interface ChatBubbleProps {
  content: string;
  isUser: boolean;
  timestamp?: Date;
}

export default function ChatBubble({ content, isUser, timestamp }: ChatBubbleProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-br-md'
            : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
        }`}
      >
        <p className="text-sm leading-relaxed">{content}</p>
        {timestamp && (
          <p className={`text-xs mt-1 ${isUser ? 'text-purple-200' : 'text-gray-400'}`}>
            {new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}