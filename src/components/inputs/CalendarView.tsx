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

    // 獲取上個月的最後幾天
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    // 填充上個月的日期
    for (let i = 0; i < firstDay; i++) {
      const day = prevMonthDays - firstDay + i + 1;
      days.push(
        <div key={`prev-${day}`} className="h-16 p-2 text-gray-400 border-b border-r border-gray-400">
          {day}
        </div>
      );
    }

    // 填充當月日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasRecord = !!state.userInput.dailyRecords[dateString];
      const isFirstDay = day === 1;

      days.push(
        <div
          key={dateString}
          className={`h-16 p-2 border-b border-r border-gray-400 relative cursor-pointer hover:bg-blue-50 ${
            hasRecord ? 'bg-blue-50' : ''
          }`}
          onClick={() => handleDateClick(dateString)}
        >
          <div className="flex items-start">
            <span className={`${hasRecord ? 'text-blue-600' : ''}`}>
              {isFirstDay ? `${month + 1}月${day}日` : day}
            </span>
            {hasRecord && (
              <div className="ml-1 w-1.5 h-1.5 bg-blue-600 rounded-full mt-1"></div>
            )}
          </div>
        </div>
      );
    }

    // 填充下個月的日期
    const totalDays = days.length;
    const remainingDays = 42 - totalDays; // 6 rows × 7 columns = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push(
        <div key={`next-${i}`} className="h-16 p-2 text-gray-400 border-b border-r border-gray-400">
          {i}
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
        <h3 className="text-2xl text-blue-600 font-medium">
          {`${currentMonth.toLocaleDateString('en-US', { month: 'long' })} ${currentMonth.getFullYear()}`}
        </h3>
        <div>
          <button onClick={handlePrevMonth} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">&lt;</button>
          <button onClick={handleNextMonth} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">&gt;</button>
        </div>
      </div>

      <div className="border border-gray-400 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50">
          {[ 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="text-center py-2 text-gray-600 font-medium border-b border-gray-400">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>

      {showModal && <DailyRecordModal
        date={selectedDate}
        onClose={() => setShowModal(false)}
      />}
    </div>
  );
};

export default CalendarView;