'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createCbtRecord, getCbtRecords, deleteCbtRecord } from '@/server/actions/cbt';
import { Plus, Trash2, ArrowLeft, BookOpen, AlertTriangle, Lightbulb, Smile } from 'lucide-react';

interface CbtRecord {
  id: string;
  situation: string;
  thought: string;
  emotion: string;
  evidenceFor: string;
  evidenceAgainst: string;
  alternativeThought: string;
  createdAt: string;
}

export default function CbtPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [records, setRecords] = useState<CbtRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    situation: '',
    thought: '',
    emotion: '',
    evidenceFor: '',
    evidenceAgainst: '',
    alternativeThought: '',
  });

  const loadRecords = useCallback(async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const data = await getCbtRecords(session.user.id);
      setRecords(data);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    try {
      await createCbtRecord(session.user.id, formData);
      setFormData({
        situation: '',
        thought: '',
        emotion: '',
        evidenceFor: '',
        evidenceAgainst: '',
        alternativeThought: '',
      });
      setShowForm(false);
      await loadRecords();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.user) return;
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      await deleteCbtRecord(session.user.id, id);
      await loadRecords();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">CBT记录</h1>
            <p className="text-blue-100 text-sm mt-1">认知行为疗法记录工具</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md mb-6"
        >
          <Plus className="h-5 w-5" />
          添加新记录
        </button>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              新建CBT记录
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertTriangle className="inline h-4 w-4 text-orange-500 mr-1" />
                  情境
                </label>
                <textarea
                  value={formData.situation}
                  onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                  placeholder="描述引发情绪的具体情境..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertTriangle className="inline h-4 w-4 text-red-500 mr-1" />
                  自动思维
                </label>
                <textarea
                  value={formData.thought}
                  onChange={(e) => setFormData({ ...formData, thought: e.target.value })}
                  placeholder="当时脑海中出现的自动想法..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Smile className="inline h-4 w-4 text-yellow-500 mr-1" />
                  情绪
                </label>
                <input
                  type="text"
                  value={formData.emotion}
                  onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                  placeholder="当时的情绪（如：焦虑、愤怒、悲伤）"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertTriangle className="inline h-4 w-4 text-orange-500 mr-1" />
                  支持证据
                </label>
                <textarea
                  value={formData.evidenceFor}
                  onChange={(e) => setFormData({ ...formData, evidenceFor: e.target.value })}
                  placeholder="支持自动思维的证据..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lightbulb className="inline h-4 w-4 text-green-500 mr-1" />
                  反对证据
                </label>
                <textarea
                  value={formData.evidenceAgainst}
                  onChange={(e) => setFormData({ ...formData, evidenceAgainst: e.target.value })}
                  placeholder="反对自动思维的证据..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lightbulb className="inline h-4 w-4 text-blue-500 mr-1" />
                  替代思维
                </label>
                <textarea
                  value={formData.alternativeThought}
                  onChange={(e) => setFormData({ ...formData, alternativeThought: e.target.value })}
                  placeholder="更理性、更积极的替代想法..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-600 transition-all"
                >
                  保存记录
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : records.length > 0 ? (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-gray-800">
                      {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(record.id.toString())}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-600 font-medium mb-1">情境</p>
                    <p className="text-gray-700">{record.situation}</p>
                  </div>

                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs text-red-600 font-medium mb-1">自动思维</p>
                    <p className="text-gray-700">{record.thought}</p>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-xs text-yellow-600 font-medium mb-1">情绪</p>
                    <p className="text-gray-700">{record.emotion}</p>
                  </div>

                  {record.evidenceFor && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xs text-orange-600 font-medium mb-1">支持证据</p>
                      <p className="text-gray-700">{record.evidenceFor}</p>
                    </div>
                  )}

                  {record.evidenceAgainst && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-600 font-medium mb-1">反对证据</p>
                      <p className="text-gray-700">{record.evidenceAgainst}</p>
                    </div>
                  )}

                  {record.alternativeThought && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium mb-1">替代思维</p>
                      <p className="text-gray-700">{record.alternativeThought}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">还没有CBT记录</p>
            <p className="text-gray-400 text-sm mt-2">点击上方按钮添加第一条记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
