import React from 'react';
import CalendarView from './CalendarView';
import { useData } from '../../contexts/DataContext';
import { formatDate } from '../../utils/formatters';

const clearStoredData = () => {
  localStorage.removeItem('dailyRecords');
  window.location.reload(); // 重新加載頁面以重置狀態
};


const DailyRecord: React.FC = () => {
  const { state } = useData();
  const recordCount = Object.keys(state.userInput.dailyRecords).length;


  return (
    <div>
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h3 className="text-lg font-medium mb-2">選擇日期記錄工作內容</h3>
          <p className="text-sm text-gray-600">
            目前已記錄 {recordCount} 天的工作內容。點擊日曆上的日期來添加或編輯記錄。
          </p>
        </div>
        <button className='text-red-500 text-sm hover:underline' onClick={clearStoredData}>清除所有紀錄</button>
      </div>
      <CalendarView />

      {recordCount > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">已記錄的日期：</h4>
          <div className="max-h-50 overflow-y-auto space-y-2 pr-2">
            {Object.entries(state.userInput.dailyRecords)
              .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
              .map(([date, record]) => (
                <div key={date} className="p-3 bg-gray-50 rounded-md">
                  <div className="font-medium text-sm text-blue-600">{formatDate(date)}</div>
                  <div className="text-sm mt-1 line-clamp-2">{record.content}</div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyRecord;