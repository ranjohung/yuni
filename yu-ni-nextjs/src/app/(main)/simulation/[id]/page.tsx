'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getSceneById, submitTrainingAnswer } from '@/server/actions/training';
import ChatBubble from '@/components/chat-bubble';
import { ArrowLeft, Play, Send, Star, CheckCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TrainingResult {
  score: number;
  dimensions: {
    empathy: number;
    expression: number;
    listening: number;
    confidence: number;
    strategy: number;
  };
  suggestions: string[];
  studyCardId?: string;
}

export default function ScenePage() {
  const params = useParams();
  const router = useRouter();
  const sceneId = parseInt(params.id as string);
  
  const [scene, setScene] = useState<{
    id: string;
    sceneName: string;
    description: string;
    difficulty: number;
    initialMessage: string;
  } | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<TrainingResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: session } = useSession();
  
  useEffect(() => {
    const fetchScene = async () => {
      try {
        const sceneData = await getSceneById(sceneId);
        if (sceneData) {
          const dialogTree = typeof sceneData.dialogTree === 'string' ? JSON.parse(sceneData.dialogTree) : sceneData.dialogTree;
          const initialMessage = dialogTree?.initialMessage || dialogTree?.firstMessage || '你好！';
          
          setScene({
            id: sceneData.id.toString(),
            sceneName: sceneData.sceneName,
            description: sceneData.background || '',
            difficulty: sceneData.difficulty,
            initialMessage,
          });
          setMessages([{ role: 'assistant', content: initialMessage, timestamp: new Date() }]);
        }
      } catch {
        router.push('/simulation');
      }
    };
    
    fetchScene();
  }, [sceneId, router]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || isComplete) return;
    if (!session?.user) return;
    
    setIsLoading(true);
    const userMessage = inputValue.trim();
    setInputValue('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    
    try {
      const response = await submitTrainingAnswer(session.user.id, sceneId, userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: '训练已提交，正在评估...', timestamp: new Date() }]);
      setResult(response);
      setIsComplete(true);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我现在无法回复。', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!scene) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-800">{scene.sceneName}</h1>
              <p className="text-xs text-gray-500">难度等级：{'★'.repeat(scene.difficulty)}{'☆'.repeat(5 - scene.difficulty)}</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Play className="w-5 h-5 text-purple-600" />
            </button>
          </div>
        </div>
      </div>
      
      {scene.description && (
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-sm text-purple-700">{scene.description}</p>
          </div>
        </div>
      )}
      
      <div className="max-w-lg mx-auto px-4 py-4 h-[calc(100vh-280px)] overflow-y-auto">
        {messages.map((msg, index) => (
          <ChatBubble
            key={index}
            content={msg.content}
            isUser={msg.role === 'user'}
            timestamp={msg.timestamp}
          />
        ))}
        
        {isComplete && result && (
          <div className="mt-4 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h3 className="font-bold text-gray-800">训练完成</h3>
            </div>
            
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{result.score}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mb-6">
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">{result.dimensions.empathy}</p>
                <p className="text-xs text-gray-500">同理心</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{result.dimensions.expression}</p>
                <p className="text-xs text-gray-500">表达</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{result.dimensions.listening}</p>
                <p className="text-xs text-gray-500">倾听</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-pink-600">{result.dimensions.confidence}</p>
                <p className="text-xs text-gray-500">自信</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-orange-600">{result.dimensions.strategy}</p>
                <p className="text-xs text-gray-500">策略</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">改进建议：</p>
              {result.suggestions?.map((suggestion, index) => (
                <p key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  {suggestion}
                </p>
              ))}
            </div>
            
            <button
              onClick={() => router.push('/simulation')}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-600 transition-all"
            >
              返回场景列表
            </button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {!isComplete && (
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="输入你的回应..."
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
      )}
    </div>
  );
}