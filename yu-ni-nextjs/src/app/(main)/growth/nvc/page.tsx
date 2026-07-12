'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createNvcRecord, getNvcRecords, updateNvcRecord, deleteNvcRecord } from '@/server/actions/nvc';
import { Plus, Trash2, ArrowLeft, MessageCircle, Eye, Heart, Lightbulb, Edit2 } from 'lucide-react';

interface NvcRecord {
  id: string;
  observation: string;
  feeling: string;
  need: string;
  request: string;
  feedback: string;
  createdAt: string;
}

export default function NvcPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [records, setRecords] = useState<NvcRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    observation: '',
    feeling: '',
    need: '',
    request: '',
  });

  const loadRecords = useCallback(async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const data = await getNvcRecords(session.user.id);
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
      if (editingId) {
        await updateNvcRecord(session.user.id, editingId, formData);
      } else {
        await createNvcRecord(session.user.id, formData);
      }
      setFormData({
        observation: '',
        feeling: '',
        need: '',
        request: '',
      });
      setShowForm(false);
      setEditingId(null);
      await loadRecords();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleEdit = (record: NvcRecord) => {
    setFormData({
      observation: record.observation,
      feeling: record.feeling,
      need: record.need,
      request: record.request,
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!session?.user) return;
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      await deleteNvcRecord(session.user.id, id);
      await loadRecords();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-pink-600 to-rose-500 text-white p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">NVC记录</h1>
            <p className="text-pink-100 text-sm mt-1">非暴力沟通记录工具</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-pink-700 hover:to-rose-600 transition-all shadow-md mb-6"
        >
          <Plus className="h-5 w-5" />
          添加新记录
        </button>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-pink-500" />
              {editingId ? '编辑NVC记录' : '新建NVC记录'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Eye className="inline h-4 w-4 text-blue-500 mr-1" />
                  观察
                </label>
                <textarea
                  value={formData.observation}
                  onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                  placeholder="客观描述观察到的事实，不包含评价..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="inline h-4 w-4 text-pink-500 mr-1" />
                  感受
                </label>
                <textarea
                  value={formData.feeling}
                  onChange={(e) => setFormData({ ...formData, feeling: e.target.value })}
                  placeholder="表达自己的感受（如：开心、难过、生气、担心）..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lightbulb className="inline h-4 w-4 text-yellow-500 mr-1" />
                  需要
                </label>
                <textarea
                  value={formData.need}
                  onChange={(e) => setFormData({ ...formData, need: e.target.value })}
                  placeholder="识别感受背后的需求（如：被尊重、安全感、被理解）..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageCircle className="inline h-4 w-4 text-green-500 mr-1" />
                  请求
                </label>
                <textarea
                  value={formData.request}
                  onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                  placeholder="提出具体、可操作的请求..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-pink-600 to-rose-500 text-white py-3 rounded-xl font-medium hover:from-pink-700 hover:to-rose-600 transition-all"
                >
                  {editingId ? '保存修改' : '保存记录'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : records.length > 0 ? (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-pink-500" />
                    <span className="font-medium text-gray-800">
                      {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(record)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id.toString())}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1">观察</p>
                    <p className="text-gray-700">{record.observation}</p>
                  </div>

                  <div className="bg-pink-50 p-3 rounded-lg">
                    <p className="text-xs text-pink-600 font-medium mb-1">感受</p>
                    <p className="text-gray-700">{record.feeling}</p>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-xs text-yellow-600 font-medium mb-1">需要</p>
                    <p className="text-gray-700">{record.need}</p>
                  </div>

                  {record.request && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-600 font-medium mb-1">请求</p>
                      <p className="text-gray-700">{record.request}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">还没有NVC记录</p>
            <p className="text-gray-400 text-sm mt-2">点击上方按钮添加第一条记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
