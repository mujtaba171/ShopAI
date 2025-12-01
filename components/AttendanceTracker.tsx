import React, { useState, useEffect } from 'react';
import { Employee, AttendanceRecord, AttendanceStatus } from '../types';
import { Calendar as CalendarIcon, Clock, CheckCircle, Save, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';
import { saveAttendance } from '../services/storageService';

interface AttendanceTrackerProps {
  employees: Employee[];
  attendanceHistory: AttendanceRecord[];
  onUpdate: () => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ employees, attendanceHistory, onUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempRecords, setTempRecords] = useState<Record<string, AttendanceStatus>>({});
  const [overtime, setOvertime] = useState<Record<string, number>>({});
  const [successMsg, setSuccessMsg] = useState('');

  // Load existing data for selected date
  useEffect(() => {
    const dailyRecords: Record<string, AttendanceStatus> = {};
    const dailyOT: Record<string, number> = {};
    
    employees.forEach(emp => {
      const record = attendanceHistory.find(r => r.employeeId === emp.id && r.date === selectedDate);
      if (record) {
        dailyRecords[emp.id] = record.status;
        dailyOT[emp.id] = record.overtimeHours;
      } else {
        dailyRecords[emp.id] = AttendanceStatus.PRESENT; // Default
        dailyOT[emp.id] = 0;
      }
    });

    setTempRecords(dailyRecords);
    setOvertime(dailyOT);
  }, [selectedDate, attendanceHistory, employees]);

  const handleStatusChange = (empId: string, status: AttendanceStatus) => {
    setTempRecords(prev => ({ ...prev, [empId]: status }));
  };

  const handleOTChange = (empId: string, hours: number) => {
    setOvertime(prev => ({ ...prev, [empId]: hours }));
  };

  const markAllAs = (status: AttendanceStatus) => {
    const newRecords = { ...tempRecords };
    employees.forEach(emp => {
      newRecords[emp.id] = status;
    });
    setTempRecords(newRecords);
  };

  const changeDate = (offset: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + offset);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const saveDay = () => {
    employees.forEach(emp => {
      saveAttendance({
        id: `att-${Math.random()}`, // Service handles upsert logic primarily by composite key (empId + date)
        employeeId: emp.id,
        date: selectedDate,
        status: tempRecords[emp.id],
        overtimeHours: overtime[emp.id] || 0
      });
    });
    onUpdate();
    setSuccessMsg('Attendance saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch(status) {
      case AttendanceStatus.PRESENT: return 'bg-green-100 text-green-700 border-green-200';
      case AttendanceStatus.ABSENT: return 'bg-red-100 text-red-700 border-red-200';
      case AttendanceStatus.HALF_DAY: return 'bg-orange-100 text-orange-700 border-orange-200';
      case AttendanceStatus.LATE: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case AttendanceStatus.OFF: return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-gray-100';
    }
  };

  // Stats for the current view
  const stats = {
    present: Object.values(tempRecords).filter(s => s === AttendanceStatus.PRESENT || s === AttendanceStatus.LATE).length,
    absent: Object.values(tempRecords).filter(s => s === AttendanceStatus.ABSENT).length,
    half: Object.values(tempRecords).filter(s => s === AttendanceStatus.HALF_DAY).length
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Attendance Tracker</h2>
          <p className="text-slate-500 text-sm">Manage daily presence and overtime</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-100 rounded text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 px-2 border-x border-slate-100">
            <CalendarIcon size={18} className="text-slate-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="outline-none text-slate-700 font-medium bg-transparent text-center"
            />
          </div>
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-100 rounded text-slate-500">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 animate-pulse border border-green-100">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Daily Summary Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-6 items-center">
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Day Summary:</div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="font-medium text-slate-700">{stats.present} Present</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="font-medium text-slate-700">{stats.absent} Absent</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span className="font-medium text-slate-700">{stats.half} Half Day</span>
        </div>
        
        <div className="flex-1"></div>
        
        <button 
          onClick={() => markAllAs(AttendanceStatus.PRESENT)}
          className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded border border-blue-200 transition-colors flex items-center gap-1"
        >
          <CheckSquare size={14} /> Mark All Present
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-600">Employee</th>
                <th className="p-4 font-semibold text-slate-600">Status</th>
                <th className="p-4 font-semibold text-slate-600">Overtime (Hrs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{emp.name}</div>
                    <div className="text-xs text-slate-500">{emp.role}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      {(Object.values(AttendanceStatus) as AttendanceStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(emp.id, status)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            tempRecords[emp.id] === status 
                              ? getStatusColor(status) + ' ring-1 ring-offset-1 ring-slate-300 shadow-sm scale-105' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          {status === AttendanceStatus.HALF_DAY ? 'HALF DAY' : status}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-slate-400" />
                      <input 
                        type="number" 
                        min="0"
                        max="12"
                        step="0.5"
                        value={overtime[emp.id]}
                        onChange={(e) => handleOTChange(emp.id, parseFloat(e.target.value) || 0)}
                        className="w-20 p-2 border border-slate-200 rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">
                    No employees found. Add staff to start tracking attendance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-end sticky bottom-6 z-10">
        <button 
          onClick={saveDay}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 shadow-xl shadow-blue-600/20 transition-all active:scale-95 font-medium"
        >
          <Save size={20} />
          Save Changes
        </button>
      </div>
    </div>
  );
};