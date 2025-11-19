import React, { useState } from 'react';

type IndicatorType = 'important' | 'urgent' | 'combined' | 'none';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  highlightToday?: boolean;
  taskIndicators?: Record<string, Set<IndicatorType>>;
  disablePastDates?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, highlightToday = true, taskIndicators = {}, disablePastDates = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay(); // 0 for Sunday

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const calendarDays = [];
  // Add empty cells for days before the start of the month
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(<div key={`empty-start-${i}`} className="p-2 h-10"></div>);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(year, month, day);
    const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const isToday = dayDate.getTime() === today.getTime();
    const isPast = dayDate < today;
    const isSelected = selectedDate === dayString;
    const indicators = taskIndicators[dayString];

    const canClick = !(disablePastDates && isPast);
    
    calendarDays.push(
      <div 
        key={day} 
        onClick={() => canClick && onDateSelect(dayString)}
        className={`relative p-2 text-center rounded-full flex items-center justify-center transition-colors duration-200 w-10 h-10 mx-auto
          ${isSelected 
            ? 'bg-teal-500 text-white font-bold' 
            : isToday && highlightToday
            ? 'bg-orange-500 text-white font-bold' 
            : !canClick
            ? 'text-slate-300 cursor-not-allowed'
            : 'hover:bg-teal-100 cursor-pointer'}`}
      >
        {day}
        {indicators && indicators.size > 0 && !isSelected && (
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
            {Array.from(indicators).sort().map(p => {
              const getIndicatorClass = () => {
                if (p === 'important') return 'bg-green-500';
                if (p === 'urgent') return 'bg-blue-500';
                if (p === 'combined') return 'bg-red-500';
                return 'bg-slate-400';
              };
              return <div key={p} className={`w-3 h-[5px] rounded-full mb-[1px] ${getIndicatorClass()}`}></div>;
            })}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Bulan sebelumnya">
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-teal-600">
          {monthNames[month]} {year}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Bulan berikutnya">
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-4 mt-3">
        {calendarDays}
      </div>
    </div>
  );
};

export default Calendar;