// src/components/inputs/CalendarView.tsx
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import DailyRecordModal from '../inputs/DailyRecordModal'

const CalendarView: React.FC = () => {
  const { state } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 獲取當月所有日期
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 獲取當月第一天是星期幾
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // 生成日曆網格
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];

    // 填充空白格
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasRecord = !!state.userInput.dailyRecords[dateString];

      days.push(
        <div
          key={dateString}
          className={`h-12 border rounded-sm border-gray-400 flex items-center justify-center relative cursor-pointer hover:bg-blue-50 ${hasRecord ? 'bg-blue-100' : ''
            }`}
          onClick={() => handleDateClick(dateString)}
        >
          <span>{day}</span>
          {hasRecord && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
          )}
        </div>
      );
    }

    return days;
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  // 處理月份導航
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // 彈窗相關狀態
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-1">&lt;</button>
        <h3>
          {currentMonth.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}
        </h3>
        <button onClick={handleNextMonth} className="p-1">&gt;</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="text-center font-medium">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      {showModal && <DailyRecordModal
        date={selectedDate}
        onClose={() => setShowModal(false)}
      />}
    </div>
  );
};

export default CalendarView;