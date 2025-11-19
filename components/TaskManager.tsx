import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task, FilterStatus, TaskPriority, Repetition, RepetitionType } from '../types';
import TaskItem from './TaskItem';
import PlusIcon from './icons/PlusIcon';
import Calendar from './Calendar';
import CalendarIcon from './icons/CalendarIcon';
import XIcon from './icons/XIcon';

interface TaskManagerProps {
  userName: string;
  tasks: Task[];
  addTask: (text: string, deadline: string, priority?: TaskPriority[], repetition?: Repetition) => void;
  toggleTask: (id: string, date: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (task: Task) => void;
  onLogout: () => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ userName, tasks, addTask, toggleTask, deleteTask, updateTask, onLogout }) => {
  // Add Task Form State
  const [newTask, setNewTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<TaskPriority[]>([]);
  const [repetition, setRepetition] = useState<Repetition>({ type: RepetitionType.NONE });
  const [dateError, setDateError] = useState<string | null>(null);
  
  // UI State
  const [filter, setFilter] = useState<FilterStatus>(FilterStatus.ALL);
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [editTaskDeadline, setEditTaskDeadline] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority[]>([]);
  const [editTaskRepetition, setEditTaskRepetition] = useState<Repetition>({ type: RepetitionType.NONE });
  const [isEditCalendarOpen, setIsEditCalendarOpen] = useState(false);
  const [editDateError, setEditDateError] = useState<string | null>(null);

  // Refs
  const datePickerRef = useRef<HTMLDivElement>(null);
  const editDatePickerRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Populate edit form when editingTask changes
  useEffect(() => {
    if (editingTask) {
        setEditTaskText(editingTask.text);
        setEditTaskDeadline(editingTask.deadline);
        setEditTaskPriority(editingTask.priority || []);
        setEditTaskRepetition(editingTask.repetition || { type: RepetitionType.NONE });
        setEditDateError(null);
    }
  }, [editingTask]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    setDateError(null);

    if (deadline && new Date(deadline + 'T00:00:00') < today) {
        setDateError('Tidak bisa memilih tanggal yang telah lewat!');
        return;
    }

    if (newTask.trim() === '' || deadline === '') return;

    addTask(newTask.trim(), deadline, priority, repetition);
    setNewTask('');
    setDeadline('');
    setPriority([]);
    setRepetition({ type: RepetitionType.NONE });
    setDateError(null);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    setEditDateError(null);
    if (!editingTask || editTaskText.trim() === '' || editTaskDeadline === '') return;

     if (editTaskDeadline && new Date(editTaskDeadline + 'T00:00:00') < today) {
        setEditDateError('Tidak bisa memilih tanggal yang telah lewat!');
        return;
    }

    const updatedTaskData: Task = {
        ...editingTask,
        text: editTaskText.trim(),
        deadline: editTaskDeadline,
        priority: editTaskPriority,
        repetition: editTaskRepetition,
    };
    updateTask(updatedTaskData);
    setEditingTask(null);
  };
  
  const handleStartEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleDateSelect = (date: string) => {
    setDeadline(date);
    setIsCalendarOpen(false);
    if (new Date(date + 'T00:00:00') < today) {
        setDateError('Tidak bisa memilih tanggal yang telah lewat!');
    } else {
        setDateError(null);
    }
  };
  
  const handleEditDateSelect = (date: string) => {
    setEditTaskDeadline(date);
    setIsEditCalendarOpen(false);
    if (new Date(date + 'T00:00:00') < today) {
        setEditDateError('Tidak bisa memilih tanggal yang telah lewat!');
    } else {
        setEditDateError(null);
    }
  };

  const handleCalendarClick = (date: string) => {
    setModalDate(date);
  };
  
  const togglePriority = (p: TaskPriority) => {
    setPriority(prev => prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]);
  };

  const toggleEditPriority = (p: TaskPriority) => {
    setEditTaskPriority(prev => prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]);
  };

  const handleRepetitionTypeChange = (type: RepetitionType) => {
    setRepetition({ type, days: type === RepetitionType.CUSTOM ? [] : undefined });
  };
  
  const handleEditRepetitionTypeChange = (type: RepetitionType) => {
    setEditTaskRepetition({ type, days: type === RepetitionType.CUSTOM ? [] : undefined });
  };

  const handleCustomDayChange = (dayIndex: number) => {
    setRepetition(prev => {
        const currentDays = prev.days || [];
        const newDays = currentDays.includes(dayIndex)
            ? currentDays.filter(d => d !== dayIndex)
            : [...currentDays, dayIndex];
        return { ...prev, days: newDays.sort() };
    });
  };

  const handleEditCustomDayChange = (dayIndex: number) => {
    setEditTaskRepetition(prev => {
        const currentDays = prev.days || [];
        const newDays = currentDays.includes(dayIndex)
            ? currentDays.filter(d => d !== dayIndex)
            : [...currentDays, dayIndex];
        return { ...prev, days: newDays.sort() };
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
      if (editDatePickerRef.current && !editDatePickerRef.current.contains(event.target as Node)) {
        setIsEditCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const todayStr = useMemo(() => {
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  }, [today]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const baseTasks = sortedTasks;
    switch (filter) {
      case FilterStatus.ACTIVE:
        return baseTasks.filter(task => !(task.completions?.[todayStr]));
      case FilterStatus.COMPLETED:
        return baseTasks.filter(task => task.completions?.[todayStr]);
      default:
        return baseTasks;
    }
  }, [sortedTasks, filter, todayStr]);
  
  const tasksForModal = useMemo(() => {
    if (!modalDate) return [];
    
    const modalDateObj = new Date(modalDate + 'T00:00:00');
    const dayOfWeek = modalDateObj.getDay();

    return tasks.filter(task => {
        if (!task.deadline) return false;
        const startDate = new Date(task.deadline + 'T00:00:00');
        
        if (startDate > modalDateObj) return false;

        if (task.repetition?.type === RepetitionType.NONE) {
            return task.deadline === modalDate;
        }

        switch (task.repetition?.type) {
            case RepetitionType.DAILY: return true;
            case RepetitionType.WEEKLY: return startDate.getDay() === dayOfWeek;
            case RepetitionType.MONTHLY: return startDate.getDate() === modalDateObj.getDate();
            case RepetitionType.CUSTOM: return task.repetition.days?.includes(dayOfWeek) ?? false;
        }
        return false;
    });
  }, [tasks, modalDate]);

  const taskDateIndicators = useMemo(() => {
    type IndicatorType = 'important' | 'urgent' | 'combined' | 'none';
    const indicators: Record<string, Set<IndicatorType>> = {};
    const projectionLimit = new Date();
    projectionLimit.setFullYear(projectionLimit.getFullYear() + 1);

    const getIndicatorType = (task: Task): IndicatorType => {
        const isImportant = task.priority?.includes(TaskPriority.IMPORTANT);
        const isUrgent = task.priority?.includes(TaskPriority.URGENT);
        if (isImportant && isUrgent) return 'combined';
        if (isImportant) return 'important';
        if (isUrgent) return 'urgent';
        return 'none';
    };
    
    const addIndicator = (date: Date, indicator: IndicatorType) => {
        const dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        
        if (!indicators[dateString]) {
            indicators[dateString] = new Set();
        }
        indicators[dateString].add(indicator);
    };

    tasks.forEach(task => {
        if (!task.deadline) return;
        
        const indicator = getIndicatorType(task);
        const startDate = new Date(task.deadline + 'T00:00:00');
        
        if (!task.repetition || task.repetition.type === RepetitionType.NONE) {
            const dateString = task.deadline;
            if (!task.completions?.[dateString]) {
              addIndicator(startDate, indicator);
            }
            return;
        }
        
        let currentDate = new Date(startDate);
        
        while (currentDate <= projectionLimit) {
            const dateString = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            switch (task.repetition.type) {
                case RepetitionType.DAILY:
                    if (!task.completions?.[dateString]) addIndicator(currentDate, indicator);
                    currentDate.setDate(currentDate.getDate() + 1);
                    break;
                case RepetitionType.WEEKLY:
                    if (!task.completions?.[dateString]) addIndicator(currentDate, indicator);
                    currentDate.setDate(currentDate.getDate() + 7);
                    break;
                case RepetitionType.MONTHLY:
                    const originalDate = startDate.getDate();
                    let nextMonthDate = new Date(currentDate);
                    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
                    if (nextMonthDate.getDate() !== originalDate) {
                       nextMonthDate.setDate(0); // Last day of previous month
                    }
                    if (currentDate.getDate() === originalDate) {
                        if (!task.completions?.[dateString]) addIndicator(currentDate, indicator);
                    }
                    currentDate = nextMonthDate;
                    break;
                case RepetitionType.CUSTOM:
                    if (task.repetition.days && task.repetition.days.length > 0) {
                        if (task.repetition.days.includes(currentDate.getDay())) {
                            if (!task.completions?.[dateString]) addIndicator(currentDate, indicator);
                        }
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                    break;
                default:
                    // to prevent infinite loop
                     currentDate.setDate(currentDate.getDate() + 1);
            }
// Fix: Removed impossible condition that caused a TypeScript error.
// The type of `task.repetition.type` is narrowed before this loop,
// so it can never be `RepetitionType.NONE` here.
            if (task.repetition.type === RepetitionType.CUSTOM) {
                // This is a special case. For custom repetitions, we must check every day.
            } else {
                 if (task.repetition.type !== RepetitionType.DAILY && task.repetition.type !== RepetitionType.WEEKLY && task.repetition.type !== RepetitionType.MONTHLY) {
                    // This is a safeguard against infinite loops for unknown repetition types.
                    break;
                 }
            }
        }
    });

    return indicators;
  }, [tasks]);

  const formattedDeadline = useMemo(() => {
    if (!deadline) return null;
    return new Date(deadline + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, [deadline]);
  
   const formattedEditDeadline = useMemo(() => {
    if (!editTaskDeadline) return null;
    return new Date(editTaskDeadline + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, [editTaskDeadline]);

  const formattedModalDate = useMemo(() => {
    if (!modalDate) return '';
    return new Date(modalDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [modalDate]);
  
  const getPriorityDescription = (priorities: TaskPriority[]) => {
      const isImportant = priorities.includes(TaskPriority.IMPORTANT);
      const isUrgent = priorities.includes(TaskPriority.URGENT);

      let text = '';
      let color = 'text-slate-500';

      if (isImportant && isUrgent) {
          text = 'Kerjakan Sekarang: Ini SUPER PENTING dan MENDESAK! Ayo taklukkan!';
          color = 'text-red-600 font-bold';
      } else if (isImportant && !isUrgent) {
          text = 'Jadwalkan: Ini PENTING, tapi santai. Cari waktu yang pas ya!';
          color = 'text-green-600 font-semibold';
      } else if (!isImportant && isUrgent) {
          text = 'Delegasikan: MENDESAK nih, tapi mungkin ada pahlawan lain yang bisa bantu?';
          color = 'text-blue-600 font-semibold';
      } else {
          text = 'Santai Aja: Tugas ini bisa menunggu saat kamu senggang. Tidak perlu buru-buru!';
          color = 'text-slate-500';
      }
      
      return (
        <div className="w-full mt-3 text-center h-12 flex items-center justify-center">
            <p className={`text-sm ${color}`}>{text}</p>
        </div>
      );
  };

  const addPriorityDescription = useMemo(() => getPriorityDescription(priority), [priority]);
  const editPriorityDescription = useMemo(() => getPriorityDescription(editTaskPriority), [editTaskPriority]);

  const FilterButton: React.FC<{ status: FilterStatus; label: string }> = ({ status, label }) => (
    <button
      onClick={() => setFilter(status)}
      className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
        filter === status ? 'bg-teal-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border-2 border-slate-200'
      }`}
    >
      {label}
    </button>
  );
  
  const RepetitionButton: React.FC<{ type: RepetitionType; label: string; onClick: (type: RepetitionType) => void; isActive: boolean }> = ({ type, label, onClick, isActive }) => (
      <button
        type="button"
        onClick={() => onClick(type)}
        className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
            isActive ? 'bg-purple-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border-2 border-slate-200'
        }`}
      >
        {label}
      </button>
  );

  const DayButton: React.FC<{ dayIndex: number; label: string; onClick: (dayIndex: number) => void; isActive: boolean }> = ({ dayIndex, label, onClick, isActive }) => (
        <button
            type="button"
            onClick={() => onClick(dayIndex)}
            className={`w-10 h-10 rounded-full text-sm font-bold transition-all duration-200 flex items-center justify-center ${
                isActive ? 'bg-purple-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border-2 border-slate-200'
            }`}
        >
            {label}
        </button>
  );

  const isAddButtonDisabled = newTask.trim() === '' || deadline === '' || !!dateError;
  const isEditButtonDisabled = editTaskText.trim() === '' || editTaskDeadline === '' || !!editDateError;
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];


  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center p-4 sm:p-8">
       <div className="w-full max-w-4xl mx-auto">
        <header className="w-full flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-700 truncate">
            Halo, Selamat Datang Kembali <span className="text-orange-500">{userName}</span>!
          </h1>
           <nav>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition-transform transform hover:scale-105">
              Keluar
            </button>
          </nav>
        </header>

        <div className="mb-8">
            <Calendar 
                selectedDate={''}
                onDateSelect={handleCalendarClick}
                taskIndicators={taskDateIndicators}
            />
        </div>

        <div>
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 mb-6 shadow-lg">
              <form onSubmit={handleAddTask}>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Apa petualanganmu selanjutnya?"
                    className="flex-grow bg-slate-100 border-2 border-slate-200 rounded-full px-5 py-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all duration-200 text-slate-800 placeholder-slate-400"
                  />
                  <button 
                    type="submit" 
                    className={`bg-orange-500 text-white font-bold p-3 rounded-full transition-all duration-200 flex items-center justify-center aspect-square transform ${
                      isAddButtonDisabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-orange-600 hover:scale-110'
                    }`}
                    aria-label="Tambah petualangan"
                    disabled={isAddButtonDisabled}>
                    <PlusIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center justify-start gap-3">
                  <span className="text-sm font-semibold text-slate-500">Tentukan Deadline:</span>
                  <div>
                    <div className="relative" ref={datePickerRef}>
                        <button
                          type="button"
                          onClick={() => setIsCalendarOpen(prev => !prev)}
                          className="flex items-center justify-between w-40 bg-white border-2 border-slate-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all duration-200 text-slate-600 hover:bg-slate-50"
                        >
                          <span className={!deadline ? 'text-slate-400' : ''}>{formattedDeadline || 'Pilih tanggal'}</span>
                          <CalendarIcon className="w-5 h-5 text-slate-500" />
                        </button>
                        {isCalendarOpen && (
                          <div className="absolute top-full mt-2 z-20 left-0 animate-fadeInUp">
                            <Calendar selectedDate={deadline} onDateSelect={handleDateSelect} highlightToday={false} disablePastDates />
                          </div>
                        )}
                    </div>
                    {dateError && <p className="text-red-500 text-xs mt-1 ml-2">{dateError}</p>}
                  </div>
                </div>

                 <div className="flex flex-wrap items-center justify-start gap-3 mt-4 pt-4 border-t-2 border-slate-100">
                    <span className="text-sm font-semibold text-slate-500">Ulangi Tugas:</span>
                    <RepetitionButton type={RepetitionType.NONE} label="Tidak Diulang" onClick={handleRepetitionTypeChange} isActive={repetition.type === RepetitionType.NONE}/>
                    <RepetitionButton type={RepetitionType.DAILY} label="Harian" onClick={handleRepetitionTypeChange} isActive={repetition.type === RepetitionType.DAILY}/>
                    <RepetitionButton type={RepetitionType.WEEKLY} label="Mingguan" onClick={handleRepetitionTypeChange} isActive={repetition.type === RepetitionType.WEEKLY}/>
                    <RepetitionButton type={RepetitionType.MONTHLY} label="Bulanan" onClick={handleRepetitionTypeChange} isActive={repetition.type === RepetitionType.MONTHLY}/>
                    <RepetitionButton type={RepetitionType.CUSTOM} label="Custom" onClick={handleRepetitionTypeChange} isActive={repetition.type === RepetitionType.CUSTOM}/>
                </div>
                {repetition.type === RepetitionType.CUSTOM && (
                    <div className="mt-4 pt-4 border-t-2 border-slate-100 animate-fadeInUp" style={{animationDuration: '0.3s'}}>
                         <p className="text-sm font-semibold text-slate-500 mb-3">Pilih hari untuk pengulangan:</p>
                        <div className="flex flex-wrap items-center justify-start gap-2">
                           {daysOfWeek.map((day, index) => (
                             <DayButton key={index} dayIndex={index} label={day} onClick={handleCustomDayChange} isActive={repetition.days?.includes(index) ?? false}/>
                           ))}
                        </div>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t-2 border-slate-100">
                  <div className="flex flex-wrap items-center justify-start gap-3">
                    <span className="text-sm font-semibold text-slate-500">Prioritas:</span>
                    <button type="button" onClick={() => togglePriority(TaskPriority.IMPORTANT)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${priority.includes(TaskPriority.IMPORTANT) ? 'bg-green-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border-2 border-slate-200'}`}>Penting</button>
                    <button type="button" onClick={() => togglePriority(TaskPriority.URGENT)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${priority.includes(TaskPriority.URGENT) ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border-2 border-slate-200'}`}>Mendesak</button>
                  </div>
                  {addPriorityDescription}
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-y-2">
                <h2 className="text-2xl font-bold text-slate-700">Daftar Tugas</h2>
                <div className="flex gap-2 flex-wrap justify-end">
                  <FilterButton status={FilterStatus.ALL} label="Semua" />
                  <FilterButton status={FilterStatus.ACTIVE} label="Aktif" />
                  <FilterButton status={FilterStatus.COMPLETED} label="Selesai!" />
                </div>
              </div>
              {tasks.length > 0 ? (
                filteredTasks.length > 0 ? (
                  <ul>
                    {filteredTasks.map(task => (
                      <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onEdit={handleStartEdit} currentDate={todayStr}/>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    <p className="font-semibold text-lg">Tidak ada tugas yang cocok!</p>
                    <p>Coba ubah filter atau tambahkan tugas baru.</p>
                  </div>
                )
              ) : (
                <div className="text-center py-10 text-slate-500">
                  <p className="font-semibold text-lg">Hore, daftar tugasmu kosong!</p>
                  <p>Nikmati harimu atau tambahkan petualangan baru.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {modalDate && (
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 animate-fadeInUp" style={{animationDuration: '0.3s'}} onClick={() => setModalDate(null)}>
            <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-slate-200 shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-teal-600">Tugas untuk {formattedModalDate}</h2>
                <button onClick={() => setModalDate(null)} className="p-2 rounded-full hover:bg-slate-200 transition-colors" aria-label="Tutup modal"><XIcon className="w-6 h-6 text-slate-600" /></button>
              </div>
              <div className="overflow-y-auto pr-2">
                {tasksForModal.length > 0 ? (
                  <ul>
                    {tasksForModal.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onToggle={toggleTask} 
                        onDelete={deleteTask}
                        onEdit={handleStartEdit}
                        currentDate={modalDate}
                        noteForCurrentDate={task.notes?.[modalDate]}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    <p className="font-semibold text-lg">Hore, tidak ada tugas di tanggal ini!</p>
                    <p>Waktunya bersantai atau menambah petualangan baru.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {editingTask && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeInUp" style={{animationDuration: '0.2s'}} onClick={() => setEditingTask(null)}>
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
               <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-purple-600">Edit Tugas</h3>
                  <button onClick={() => setEditingTask(null)} className="p-2 rounded-full hover:bg-slate-200 transition-colors" aria-label="Tutup editor"><XIcon className="w-6 h-6 text-slate-600" /></button>
              </div>
              <form onSubmit={handleUpdateTask} className="overflow-y-auto pr-2 flex-grow">
                 <div className="mb-4">
                    <label htmlFor="edit-task-text" className="text-sm font-semibold text-slate-500 mb-1 block">Nama Tugas:</label>
                    <input
                        id="edit-task-text"
                        type="text"
                        value={editTaskText}
                        onChange={(e) => setEditTaskText(e.target.value)}
                        className="w-full bg-slate-100 border-2 border-slate-200 rounded-full px-5 py-3 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all duration-200 text-slate-800 placeholder-slate-400"
                    />
                 </div>
                <div className="flex flex-wrap items-center justify-start gap-3 mb-4">
                  <span className="text-sm font-semibold text-slate-500">Deadline Awal:</span>
                  <div>
                    <div className="relative" ref={editDatePickerRef}>
                        <button
                          type="button"
                          onClick={() => setIsEditCalendarOpen(prev => !prev)}
                          className="flex items-center justify-between w-40 bg-white border-2 border-slate-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all duration-200 text-slate-600 hover:bg-slate-50"
                        >
                          <span className={!editTaskDeadline ? 'text-slate-400' : ''}>{formattedEditDeadline || 'Pilih tanggal'}</span>
                          <CalendarIcon className="w-5 h-5 text-slate-500" />
                        </button>
                        {isEditCalendarOpen && (
                          <div className="absolute top-full mt-2 z-20 left-0 animate-fadeInUp">
                            <Calendar selectedDate={editTaskDeadline} onDateSelect={handleEditDateSelect} highlightToday={false} disablePastDates />
                          </div>
                        )}
                    </div>
                    {editDateError && <p className="text-red-500 text-xs mt-1 ml-2">{editDateError}</p>}
                  </div>
                </div>
                 <div className="flex flex-wrap items-center justify-start gap-3 mt-4 pt-4 border-t-2 border-slate-100">
                    <span className="text-sm font-semibold text-slate-500">Ulangi Tugas:</span>
                    <RepetitionButton type={RepetitionType.NONE} label="Tidak Diulang" onClick={handleEditRepetitionTypeChange} isActive={editTaskRepetition.type === RepetitionType.NONE}/>
                    <RepetitionButton type={RepetitionType.DAILY} label="Harian" onClick={handleEditRepetitionTypeChange} isActive={editTaskRepetition.type === RepetitionType.DAILY}/>
                    <RepetitionButton type={RepetitionType.WEEKLY} label="Mingguan" onClick={handleEditRepetitionTypeChange} isActive={editTaskRepetition.type === RepetitionType.WEEKLY}/>
                    <RepetitionButton type={RepetitionType.MONTHLY} label="Bulanan" onClick={handleEditRepetitionTypeChange} isActive={editTaskRepetition.type === RepetitionType.MONTHLY}/>
                    <RepetitionButton type={RepetitionType.CUSTOM} label="Custom" onClick={handleEditRepetitionTypeChange} isActive={editTaskRepetition.type === RepetitionType.CUSTOM}/>
                </div>
                {editTaskRepetition.type === RepetitionType.CUSTOM && (
                    <div className="mt-4 pt-4 border-t-2 border-slate-100 animate-fadeInUp" style={{animationDuration: '0.3s'}}>
                         <p className="text-sm font-semibold text-slate-500 mb-3">Pilih hari untuk pengulangan:</p>
                        <div className="flex flex-wrap items-center justify-start gap-2">
                           {daysOfWeek.map((day, index) => (
                             <DayButton key={index} dayIndex={index} label={day} onClick={handleEditCustomDayChange} isActive={editTaskRepetition.days?.includes(index) ?? false}/>
                           ))}
                        </div>
                    </div>
                )}
                 <div className="mb-4 mt-4 pt-4 border-t-2 border-slate-100">
                    <div className="flex flex-wrap items-center justify-start gap-3">
                        <span className="text-sm font-semibold text-slate-500">Prioritas:</span>
                        <button type="button" onClick={() => toggleEditPriority(TaskPriority.IMPORTANT)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${editTaskPriority.includes(TaskPriority.IMPORTANT) ? 'bg-green-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border-2 border-slate-200'}`}>Penting</button>
                        <button type="button" onClick={() => toggleEditPriority(TaskPriority.URGENT)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${editTaskPriority.includes(TaskPriority.URGENT) ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border-2 border-slate-200'}`}>Mendesak</button>
                    </div>
                    {editPriorityDescription}
                 </div>
                 <div className="mt-4 pt-4 border-t-2 border-slate-100">
                    <button
                        type="submit"
                        disabled={isEditButtonDisabled}
                        className="w-full mt-2 px-4 py-3 bg-purple-500 text-white font-bold rounded-full hover:bg-purple-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Simpan Perubahan
                    </button>
                 </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default TaskManager;