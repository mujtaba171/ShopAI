export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  LATE = 'LATE', // Treated as present but flagged
  OFF = 'OFF' // Weekend/Holiday
}

export enum Tab {
  DASHBOARD = 'Dashboard',
  EMPLOYEES = 'Staff',
  ATTENDANCE = 'Attendance',
  PAYROLL = 'Payroll',
  AI = 'AI Assistant'
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  baseSalary: number; // Monthly salary
  joiningDate: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // ISO Date string YYYY-MM-DD
  status: AttendanceStatus;
  overtimeHours: number;
  notes?: string;
}

export interface PayrollEntry {
  employeeId: string;
  employeeName: string;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  lateDays: number;
  totalOvertimeHours: number;
  baseSalary: number;
  grossPay: number;
  deductions: number;
  netPay: number;
}

export interface AppState {
  employees: Employee[];
  attendance: AttendanceRecord[];
}

export const SAMPLE_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Rahul Kumar', role: 'Sales Manager', phone: '9876543210', baseSalary: 25000, joiningDate: '2023-01-15', isActive: true },
  { id: '2', name: 'Priya Sharma', role: 'Cashier', phone: '9123456780', baseSalary: 18000, joiningDate: '2023-06-01', isActive: true },
  { id: '3', name: 'Amit Singh', role: 'Helper', phone: '9988776655', baseSalary: 12000, joiningDate: '2024-02-10', isActive: true },
];