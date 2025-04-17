import React from 'react';
import { useState } from 'react';

import CalendarView from './CalendarView';
import { useData } from '../../contexts/DataContext';
import { formatDate } from '../../utils/formatters';
import { X, Check } from 'lucide-react';
import { deleteDailyData, clearDailyRecords, getDailyData } from '../../services/apiService';

const DailyRecord: React.FC = () => {
  const { state, dispatch } = useData();
  const [name, setName] = useState(state.userInput.userName);
  const [job, setJob] = useState(state.userInput.job_name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordCount = Object.keys(state.userInput.dailyRecords).length;

  const handleDelete = async (id: number, date: string) => {
    try {
      await deleteDailyData(id);
      dispatch({ type: 'DELETE_DAILY_RECORD', payload: date });
    } catch (error) {
      console.error('刪除記錄時出錯:', error);
      setError('刪除記錄時發生錯誤');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const trimmedName = name.trim();
      const trimmedJob = job.trim();

      if (!trimmedName || !trimmedJob) {
        setError('請填寫職務和姓名');
        return;
      }

      dispatch({ type: 'SET_USER_NAME', payload: trimmedName });
      dispatch({ type: 'SET_USER_JOB', payload: trimmedJob });
      
    } catch (err) {
      console.error('Error submitting data:', err);
      setError('提交資料時發生錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearMonthRecords = async () => {
    if (!window.confirm('確定要清除本月所有記錄嗎？')) {
      return;
    }

    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      // 使用年月格式
      const yearMonth = `${year}-${String(month).padStart(2, '0')}`;

      await clearDailyRecords({
        yearMonth,
        userName: state.userInput.userName
      });

      // 重新獲取更新後的記錄
      const updatedRecords = await getDailyData(state.userInput.userName);
      if (updatedRecords.data) {
        dispatch({
          type: 'SET_DAILY_RECORDS',
          payload: updatedRecords.data
        });
      }

    } catch (error) {
      console.error('清除記錄時出錯:', error);
      setError('清除記錄時發生錯誤');
    }
  };

  return (
    <>
      <div className="container mx-auto px-8 py-8 max-w-7xl flex gap-10">
        <div className='w-1/2 relative after:content-[""] after:absolute after:top-0 after:right-[-20px] after:w-[1px] after:h-full after:bg-blue-900'>
          <h2 className="text-2xl font-semibold mb-4 text-blue-900">請先填入職務及名字</h2>
          {!state.userInput.userName || !state.userInput.job_name ? (
            <form onSubmit={handleSubmit} >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <label htmlFor="job" className=" text-sm font-medium text-gray-700 mb-1 mr-1.5">
                    職務
                  </label>
                  <input
                    id="job"
                    type="text"
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                    placeholder="請填寫您的職務"
                    className="w-40 px-4 py-2 border border-gray-300 rounded-md "
                    required
                    disabled={isSubmitting}
                  />
                  </div>
                  <div>
                  <label htmlFor="name" className=" text-sm font-medium text-gray-700 mb-1 mr-1.5">
                    姓名
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="請輸入您的姓名"
                    className="w-40 px-4 py-2 border rounded-md border-gray-300"
                    required
                    disabled={isSubmitting}
                  />
                  </div>
                <button
                  type="submit"
                  className={`w-20 bg-blue-900 text-white py-1 rounded-md hover:bg-blue-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting || !name.trim() || !job.trim()}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      提交中...
                    </span>
                  ) : 'submit'}
                </button>
                {error && (
                  <div className="text-red-500 text-sm mt-2">
                    {error}
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div >
              {/* <h3 className="text-sm font-medium text-gray-500 mb-3">已填寫資料</h3> */}
              <div className="flex mb-4 gap-10">
                <div className="flex items-center gap-2 p-2 ">
                  <span className="text-gray-700 font-medium">職務：</span>
                  <span className="text-gray-900">{state.userInput.job_name}</span>
                  <Check className="text-green-500 ml-auto" size={18} />
                </div>
                <div className="flex items-center gap-2 p-2 ">
                  <span className="text-gray-700 font-medium">姓名：</span>
                  <span className="text-gray-900">{state.userInput.userName}</span>
                  <Check className="text-green-500 ml-auto" size={18} />
                </div>
              </div>
            </div>
          )}
          {/* <h2 className='text-blue-900 text-2xl font-bold'> 您今天做了什麼？</h2> */}
          <div className="mb-4 w-full">
            <div className='mt-4 bg-gray-50 p-4'>
              <h3 className="text-lg font-medium mb-2">選擇日期記錄工作內容</h3>
              <p className="text-sm text-gray-600">
                目前已記錄 {recordCount} 天的工作內容。點擊日曆上的日期來添加或編輯記錄。
              </p>
            </div>
          </div>
          <CalendarView />
          <button 
            onClick={handleClearMonthRecords} 
            className='text-red-500 text-sm hover:underline mt-4'
          >
            清除本月紀錄
          </button>
        </div>
        <div>
          <h4 className="font-medium mb-4 text-blue-900 text-2xl font-bold">已記錄的日期：</h4>
          <div className="h-160 w-120 bg-gray-50">
          {recordCount > 0 && (
            <div className="mt-6">
              <div className="max-h-150 overflow-y-auto space-y-2 pr-2 w-120 bg-gray-50 p-4">
                {Object.entries(state.userInput.dailyRecords)
                  .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                  .map(([date, record]) => (
                    <div key={date} className="p-3 bg-white rounded-md relative group">
                      <div className="font-medium text-sm text-blue-600 ">{formatDate(date)}</div>
                      <div className="text-sm mt-1 line-clamp-2">{record.content}</div>
                      <button 
                        onClick={() => handleDelete(record.id, date)} 
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyRecord;