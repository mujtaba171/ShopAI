import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Calculator, 
  Bot, 
  Menu,
  X,
  Store
} from 'lucide-react';
import { Employee, AttendanceRecord, Tab } from './types';
import { getEmployees, getAttendance, saveEmployee, deleteEmployee } from './services/storageService';
import { EmployeeList } from './components/EmployeeList';
import { AttendanceTracker } from './components/AttendanceTracker';
import { PayrollCalculator } from './components/PayrollCalculator';
import { AiAssistant } from './components/AiAssistant';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.DASHBOARD);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initial Load
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setEmployees(getEmployees());
    setAttendance(getAttendance());
  };

  const handleSaveEmployee = (emp: Employee | Omit<Employee, 'id'>) => {
    saveEmployee(emp);
    refreshData();
  };

  const handleDeleteEmployee = (id: string) => {
    if(window.confirm("Are you sure? This will remove the employee.")) {
      deleteEmployee(id);
      refreshData();
    }
  };

  const NavItem = ({ tab, icon: Icon }: { tab: Tab, icon: any }) => (
    <button
      onClick={() => { setCurrentTab(tab); setIsMobileMenuOpen(false); }}
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${
        currentTab === tab 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{tab}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
          <Store className="text-blue-600" /> ShopKeeper Pro
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 bg-white w-64 shadow-xl z-30 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:shadow-none border-r border-slate-200 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex flex-col h-full">
          <div className="hidden md:flex items-center gap-2 font-bold text-2xl text-slate-800 mb-8">
            <Store className="text-blue-600" size={28} /> ShopKeeper
          </div>

          <div className="space-y-2 flex-1">
            <NavItem tab={Tab.DASHBOARD} icon={LayoutDashboard} />
            <NavItem tab={Tab.ATTENDANCE} icon={CalendarCheck} />
            <NavItem tab={Tab.PAYROLL} icon={Calculator} />
            <NavItem tab={Tab.EMPLOYEES} icon={Users} />
            <NavItem tab={Tab.AI} icon={Bot} />
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 text-xs text-slate-400 text-center">
            v1.1.0 • React + Gemini
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto max-w-7xl mx-auto w-full">
        <header className="hidden md:block bg-white border-b border-slate-200 px-8 py-4 mb-6 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-800">{currentTab}</h1>
        </header>

        <div className="md:p-4">
          {currentTab === Tab.DASHBOARD && (
             <Dashboard 
                employees={employees} 
                attendance={attendance}
                onNavigate={setCurrentTab} 
             />
          )}

          {currentTab === Tab.EMPLOYEES && (
            <EmployeeList 
              employees={employees} 
              onSave={handleSaveEmployee} 
              onDelete={handleDeleteEmployee} 
            />
          )}

          {currentTab === Tab.ATTENDANCE && (
            <AttendanceTracker 
              employees={employees}
              attendanceHistory={attendance}
              onUpdate={refreshData}
            />
          )}

          {currentTab === Tab.PAYROLL && (
            <PayrollCalculator 
              employees={employees}
              attendanceHistory={attendance}
            />
          )}

          {currentTab === Tab.AI && (
            <div className="max-w-3xl mx-auto">
              <AiAssistant 
                employees={employees}
                attendance={attendance}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;