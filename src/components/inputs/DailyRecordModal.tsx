// src/components/inputs/DailyRecordModal.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { formatDate } from '../../utils/formatters';
import { saveDailyRecord, getDailyData } from '../../services/apiService';

interface DailyRecordModalProps {
  date: string;
  onClose: () => void;
}

const DailyRecordModal: React.FC<DailyRecordModalProps> = ({ date, onClose }) => {
  const { state, dispatch } = useData();
  const existingRecord = state.userInput.dailyRecords[date];
  const [content, setContent] = useState(existingRecord?.content || '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Esc鍵關閉彈窗
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = async () => {
    if (!state.userInput.userName) {
      setError('請先輸入您的姓名');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      if (content.trim()) {
        // 準備記錄數據
        const recordData = {
          name: state.userInput.userName,
          job_name: state.userInput.job_name,
          dailyRecords: [{
            date,
            content: content.trim()
          }]
        };

        // 先調用 API 保存數據
        await saveDailyRecord(recordData);
        
        // 重新獲取最新數據（包含 ID）
        const updatedRecords = await getDailyData(state.userInput.userName);
        
        // 更新本地狀態
        if (updatedRecords.data) {
          dispatch({
            type: 'SET_DAILY_RECORDS',
            payload: updatedRecords.data
          });
        }
      }

      onClose();
    } catch (err) {
      console.error('保存記錄時出錯:', err);
      setError('保存記錄時發生錯誤，請稍後再試');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {formatDate(date)} 的工作記錄
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="請輸入這天的工作內容..."
          className="w-full h-40 p-3 border rounded-md mb-4"
          disabled={isSaving}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isSaving}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyRecordModal;