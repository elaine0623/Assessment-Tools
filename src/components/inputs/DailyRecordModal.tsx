// src/components/inputs/DailyRecordModal.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { formatDate } from '../../utils/formatters';

interface DailyRecordModalProps {
  date: string;
  onClose: () => void;
}

const DailyRecordModal: React.FC<DailyRecordModalProps> = ({ date, onClose }) => {
  const { state, dispatch } = useData();
  const existingRecord = state.userInput.dailyRecords[date];
  const [content, setContent] = useState(existingRecord?.content || '');

  useEffect(() => {
    // Esc鍵關閉彈窗
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = () => {
    if (content.trim()) {
      dispatch({
        type: 'ADD_DAILY_RECORD',
        payload: { date, content }
      });
    } else if (existingRecord) {
      // 如果內容為空且之前存在記錄，則刪除
      dispatch({
        type: 'DELETE_DAILY_RECORD',
        payload: date
      });
    }

    onClose();
  };

  const emptyInput = () => {
    setContent('');
  }

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg z-60">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{formatDate(date)}的工作記錄</h3>
          <button onClick={onClose} className="p-1">
            <X size={20} />
          </button>
        </div>

        <textarea
          className="w-full h-48 p-3 border rounded-md mb-4"
          placeholder="請輸入這一天的工作內容..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
        ></textarea>

        <div className="flex justify-end space-x-2 ">
          <div className='w-[68%]'>
            <button
              className="px-4 py-2 text-cyan-500 rounded-md cursor-pointer"
              onClick={emptyInput}
            >
              一鍵清空
            </button>
          </div>

          <button
            className="px-4 py-2 border rounded-md cursor-pointer"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer"
            onClick={handleSave}
          >
            保存
          </button>

        </div>
      </div>
    </div>

  );
};

export default DailyRecordModal;