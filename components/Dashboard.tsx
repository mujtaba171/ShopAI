import React, { useMemo } from 'react';
import { Employee, AttendanceRecord, AttendanceStatus, Tab } from '../types';
import { Users, UserCheck, IndianRupee, TrendingUp, AlertCircle, ArrowRight, Calendar } from 'lucide-react';

interface DashboardProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  onNavigate: (tab: Tab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ employees, attendance, onNavigate }) => {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7);

  const stats = useMemo(() => {
    const totalStaff = employees.length;
    
    // Today's Attendance
    const todayRecords = attendance.filter(r => r.date === today);
    const presentToday = todayRecords.filter(r => 
      [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.HALF_DAY].includes(r.status)
    ).length;
    const pendingAttendance = totalStaff - todayRecords.length;

    // Monthly Payroll Estimate (Rough Calculation)
    const monthRecords = attendance.filter(r => r.date.startsWith(currentMonth));
    let estimatedCost = 0;
    
    // Pro-rated calculation just for the dashboard visualization
    employees.forEach(emp => {
      const empRecords = monthRecords.filter(r => r.employeeId === emp.id);
      const dailyRate = emp.baseSalary / 30;
      
      let payableDays = 0;
      let otCost = 0;

      empRecords.forEach(r => {
        if (r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE) payableDays += 1;
        if (r.status === AttendanceStatus.HALF_DAY) payableDays += 0.5;
        otCost += (r.overtimeHours || 0) * (dailyRate / 9);
      });

      estimatedCost += (payableDays * dailyRate) + otCost;
    });

    return { totalStaff, presentToday, pendingAttendance, estimatedCost };
  }, [employees, attendance, today, currentMonth]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Shop Overview</h2>
        <p className="text-slate-500">Welcome back! Here is what's happening today.</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Staff Card */}
        <div 
          onClick={() => onNavigate(Tab.EMPLOYEES)}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.totalStaff}</h3>
          <p className="text-slate-500 text-sm">Active Employees</p>
        </div>

        {/* Today's Attendance Card */}
        <div 
          onClick={() => onNavigate(Tab.ATTENDANCE)}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
              <UserCheck size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Today</span>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.presentToday}</h3>
            <span className="text-slate-400 text-sm mb-2">/ {stats.totalStaff}</span>
          </div>
          <p className="text-slate-500 text-sm">
            {stats.pendingAttendance > 0 
              ? `${stats.pendingAttendance} Pending` 
              : 'All Marked'}
          </p>
        </div>

        {/* Payroll Estimate Card */}
        <div 
          onClick={() => onNavigate(Tab.PAYROLL)}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <IndianRupee size={24} />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Current Month</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-1">
            {Math.round(stats.estimatedCost).toLocaleString('en-IN')}
          </h3>
          <p className="text-slate-500 text-sm">Estimated Payroll</p>
        </div>
      </div>

      {/* Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-yellow-400" />
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          
          <div className="space-y-3">
             <button 
               onClick={() => onNavigate(Tab.ATTENDANCE)}
               className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
             >
               <div className="flex items-center gap-3">
                 <Calendar size={20} className="text-blue-300" />
                 <div className="text-left">
                   <div className="font-medium">Mark Attendance</div>
                   <div className="text-xs text-slate-400">Update today's status</div>
                 </div>
               </div>
               <ArrowRight size={18} className="text-slate-400" />
             </button>

             <button 
               onClick={() => onNavigate(Tab.EMPLOYEES)}
               className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
             >
               <div className="flex items-center gap-3">
                 <Users size={20} className="text-green-300" />
                 <div className="text-left">
                   <div className="font-medium">Add New Employee</div>
                   <div className="text-xs text-slate-400">Expand your team</div>
                 </div>
               </div>
               <ArrowRight size={18} className="text-slate-400" />
             </button>
          </div>
        </div>

        {/* Alerts / Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
           <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
             <AlertCircle size={20} className="text-orange-500" />
             Notifications
           </h3>
           
           <div className="space-y-4">
             {stats.pendingAttendance > 0 ? (
               <div className="flex gap-3 p-3 bg-orange-50 text-orange-800 rounded-lg text-sm border border-orange-100">
                 <div className="shrink-0 mt-0.5">•</div>
                 <div>
                   <span className="font-semibold">Attendance Missing:</span> You haven't marked attendance for {stats.pendingAttendance} employees today.
                 </div>
               </div>
             ) : (
               <div className="flex gap-3 p-3 bg-green-50 text-green-800 rounded-lg text-sm border border-green-100">
                 <div className="shrink-0 mt-0.5">✓</div>
                 <div>
                   <span className="font-semibold">All Caught Up:</span> Today's attendance is fully marked.
                 </div>
               </div>
             )}

             <div className="flex gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
               <div className="shrink-0 mt-0.5">ℹ</div>
               <div>
                 <span className="font-semibold">Payroll Tip:</span> Ensure all overtime hours are logged before generating the month-end report.
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};