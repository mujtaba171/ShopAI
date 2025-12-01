import { Employee, AttendanceRecord, SAMPLE_EMPLOYEES, AttendanceStatus } from '../types';

const EMP_KEY = 'shopkeeper_employees';
const ATT_KEY = 'shopkeeper_attendance';

// Helper to generate IDs
const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const getEmployees = (): Employee[] => {
  const data = localStorage.getItem(EMP_KEY);
  if (!data) {
    // Seed data if empty
    localStorage.setItem(EMP_KEY, JSON.stringify(SAMPLE_EMPLOYEES));
    return SAMPLE_EMPLOYEES;
  }
  return JSON.parse(data);
};

export const saveEmployee = (employee: Omit<Employee, 'id'> | Employee): Employee => {
  const employees = getEmployees();
  let newEmp: Employee;

  if ('id' in employee) {
    // Update
    const index = employees.findIndex(e => e.id === employee.id);
    if (index !== -1) {
      employees[index] = employee as Employee;
      newEmp = employee as Employee;
    } else {
      newEmp = { ...employee, id: generateId() } as Employee;
      employees.push(newEmp);
    }
  } else {
    // Create
    newEmp = { ...employee, id: generateId(), isActive: true } as Employee;
    employees.push(newEmp);
  }
  
  localStorage.setItem(EMP_KEY, JSON.stringify(employees));
  return newEmp;
};

export const deleteEmployee = (id: string) => {
  const employees = getEmployees().filter(e => e.id !== id);
  localStorage.setItem(EMP_KEY, JSON.stringify(employees));
};

export const getAttendance = (): AttendanceRecord[] => {
  const data = localStorage.getItem(ATT_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveAttendance = (record: AttendanceRecord) => {
  const allRecords = getAttendance();
  // Check if record exists for this emp on this date
  const index = allRecords.findIndex(r => r.employeeId === record.employeeId && r.date === record.date);
  
  if (index !== -1) {
    allRecords[index] = record;
  } else {
    allRecords.push(record);
  }
  
  localStorage.setItem(ATT_KEY, JSON.stringify(allRecords));
};

export const bulkMarkAttendance = (date: string, employeeIds: string[], status: AttendanceStatus) => {
  const allRecords = getAttendance();
  
  employeeIds.forEach(empId => {
    const index = allRecords.findIndex(r => r.employeeId === empId && r.date === date);
    const newRecord: AttendanceRecord = {
      id: index !== -1 ? allRecords[index].id : generateId(),
      employeeId: empId,
      date,
      status,
      overtimeHours: index !== -1 ? allRecords[index].overtimeHours : 0
    };
    
    if (index !== -1) {
      allRecords[index] = newRecord;
    } else {
      allRecords.push(newRecord);
    }
  });
  
  localStorage.setItem(ATT_KEY, JSON.stringify(allRecords));
  return allRecords;
};