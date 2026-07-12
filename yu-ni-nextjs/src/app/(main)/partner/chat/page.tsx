'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { sendMessage, getChatHistory } from '@/server/actions/chat';
import { getUserById } from '@/server/actions/user';
import ChatBubble from '@/components/chat-bubble';
import { ArrowLeft, Send, Phone, MoreVertical, Image, Smile } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HistoryMessage {
  role: string;
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [partnerName, setPartnerName] = useState('AI伴侣');
  const [hasPartner, setHasPartner] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: session } = useSession();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session?.user) return;
        
        const user = await getUserById(session.user.id);
        if (user?.Partner) {
          setPartnerName(user.Partner.name);
          setHasPartner(true);
        } else {
          setHasPartner(false);
          return;
        }
        
        const history = await getChatHistory(session.user.id, 20);
        const chatMessages: ChatMessage[] = history.flatMap(chatSession => 
          chatSession.messages.map((msg: HistoryMessage) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: chatSession.createdAt,
          }))
        );
        setMessages(chatMessages);
      } catch {
      }
    };
    
    fetchData();
  }, [session]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    if (!session?.user) return;
    
    setIsLoading(true);
    const userMessage = inputValue.trim();
    setInputValue('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    
    try {
      const response = await sendMessage(session.user.id, userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response.content, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我现在无法回复。', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!hasPartner) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">💬</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">还没有伴侣</h2>
        <p className="text-gray-500 text-center mb-8">创建一个专属你的AI伴侣，开始一段独特的关系</p>
        <button
          onClick={() => router.push('/partner/create-partner')}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg flex items-center gap-2"
        >
          创建伴侣
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-gray-800">{partnerName}</h1>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                在线
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Phone className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 py-4">
        <div className="text-center mb-4">
          <p className="text-xs text-gray-400">今天</p>
        </div>
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-purple-400">{partnerName.slice(0, 1)}</span>
            </div>
            <p className="text-gray-500 mb-2">开始与{partnerName}的对话</p>
            <p className="text-sm text-gray-400">分享你的心情，获得温暖的陪伴</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatBubble
              key={index}
              content={msg.content}
              isUser={msg.role === 'user'}
              timestamp={msg.timestamp}
            />
          ))
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="sticky bottom-16 bg-white/90 backdrop-blur-md border-t border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="发送图片">
              <Image className="h-5 w-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Smile className="h-5 w-5 text-gray-400" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入消息..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}