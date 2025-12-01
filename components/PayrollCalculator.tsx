import React, { useState, useMemo } from 'react';
import { Employee, AttendanceRecord, AttendanceStatus, PayrollEntry } from '../types';
import { IndianRupee, Download, AlertTriangle, Printer } from 'lucide-react';

interface PayrollCalculatorProps {
  employees: Employee[];
  attendanceHistory: AttendanceRecord[];
}

export const PayrollCalculator: React.FC<PayrollCalculatorProps> = ({ employees, attendanceHistory }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const payrollData: PayrollEntry[] = useMemo(() => {
    return employees.map(emp => {
      const [year, month] = selectedMonth.split('-').map(Number);
      
      const records = attendanceHistory.filter(r => {
        const d = new Date(r.date);
        return r.employeeId === emp.id && d.getMonth() + 1 === month && d.getFullYear() === year;
      });

      let present = 0;
      let half = 0;
      let late = 0;
      let absent = 0;
      let otHours = 0;

      records.forEach(r => {
        if (r.status === AttendanceStatus.PRESENT) present++;
        if (r.status === AttendanceStatus.HALF_DAY) half++;
        if (r.status === AttendanceStatus.LATE) { late++; present++; } 
        if (r.status === AttendanceStatus.ABSENT) absent++;
        otHours += (r.overtimeHours || 0);
      });

      const daysInMonth = 30; 
      const dailyRate = emp.baseSalary / daysInMonth;
      const payableDays = present + (half * 0.5); 
      const salaryEarned = payableDays * dailyRate;
      const hourlyRate = dailyRate / 9;
      const otPay = otHours * hourlyRate;
      const deductionDays = absent + (half * 0.5);
      const deductions = deductionDays * dailyRate;
      const netPay = Math.max(0, emp.baseSalary - deductions + otPay);

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        presentDays: present + late,
        absentDays: absent,
        halfDays: half,
        lateDays: late,
        totalOvertimeHours: otHours,
        baseSalary: emp.baseSalary,
        grossPay: emp.baseSalary + otPay,
        deductions: deductions,
        netPay: Math.round(netPay)
      };
    });
  }, [employees, attendanceHistory, selectedMonth]);

  const totalPayout = payrollData.reduce((acc, curr) => acc + curr.netPay, 0);

  const downloadCSV = () => {
    const headers = ["Employee ID", "Name", "Base Salary", "Present Days", "Absent Days", "Half Days", "OT Hours", "OT Pay", "Deductions", "Net Pay"];
    const rows = payrollData.map(p => [
      p.employeeId,
      p.employeeName,
      p.baseSalary,
      p.presentDays,
      p.absentDays,
      p.halfDays,
      p.totalOvertimeHours,
      Math.round(p.grossPay - p.baseSalary),
      Math.round(p.deductions),
      p.netPay
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payroll_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Monthly Payroll</h2>
          <p className="text-slate-500 text-sm">Review calculated salaries for {selectedMonth}</p>
        </div>
        <div className="flex items-center gap-4">
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg p-2 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handlePrint}
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <Printer size={18} /> Print
            </button>
            <button 
              onClick={downloadCSV}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-900 transition-colors"
            >
                <Download size={18} /> Export CSV
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg print:border print:border-slate-300 print:text-black">
          <p className="text-blue-100 font-medium mb-1 print:text-slate-500">Total Payout</p>
          <h3 className="text-3xl font-bold flex items-center">
            <IndianRupee size={24} className="mr-1" />
            {totalPayout.toLocaleString('en-IN')}
          </h3>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium mb-1">Total Overtime Pay</p>
            <h3 className="text-2xl font-bold text-slate-800 flex items-center">
              <IndianRupee size={20} className="mr-1" />
              {Math.round(payrollData.reduce((acc, c) => acc + (c.grossPay - c.baseSalary), 0)).toLocaleString('en-IN')}
            </h3>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium mb-1">Total Deductions</p>
            <h3 className="text-2xl font-bold text-red-600 flex items-center">
              - <IndianRupee size={20} className="mr-1" />
              {Math.round(payrollData.reduce((acc, c) => acc + c.deductions, 0)).toLocaleString('en-IN')}
            </h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left print:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 print:bg-slate-100">
                <th className="p-4">Employee</th>
                <th className="p-4">Summary</th>
                <th className="p-4 text-right">Base Salary</th>
                <th className="p-4 text-right">OT Pay</th>
                <th className="p-4 text-right">Deductions</th>
                <th className="p-4 text-right font-bold text-slate-700">Net Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrollData.map(entry => (
                <tr key={entry.employeeId} className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-800">{entry.employeeName}</td>
                  <td className="p-4 text-sm text-slate-600">
                    <div>P: {entry.presentDays} <span className="text-slate-300">|</span> A: {entry.absentDays} <span className="text-slate-300">|</span> H: {entry.halfDays}</div>
                    <div className="text-xs text-slate-400 mt-1">Late: {entry.lateDays} • OT: {entry.totalOvertimeHours}h</div>
                  </td>
                  <td className="p-4 text-right font-mono text-slate-600">
                    {entry.baseSalary.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right font-mono text-green-600">
                    +{Math.round(entry.grossPay - entry.baseSalary).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right font-mono text-red-600">
                    -{Math.round(entry.deductions).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-slate-800 text-lg">
                    {entry.netPay.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payrollData.length === 0 && (
           <div className="p-8 text-center text-slate-500 flex flex-col items-center">
             <AlertTriangle className="mb-2 text-yellow-500" />
             No data available for this month.
           </div>
        )}
      </div>
    </div>
  );
};