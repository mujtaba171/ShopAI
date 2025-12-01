import React, { useState } from 'react';
import { Employee } from '../types';
import { UserPlus, Edit2, Trash2, Phone, Briefcase, IndianRupee, Search } from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
  onSave: (emp: Omit<Employee, 'id'> | Employee) => void;
  onDelete: (id: string) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Partial<Employee>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmp.name && editingEmp.role && editingEmp.baseSalary) {
      onSave(editingEmp as Employee);
      setIsModalOpen(false);
      setEditingEmp({});
    }
  };

  const openNew = () => {
    setEditingEmp({ isActive: true, joiningDate: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditingEmp({ ...emp });
    setIsModalOpen(true);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.phone.includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Staff Directory</h2>
           <p className="text-slate-500 text-sm">{employees.length} Active Employees</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={openNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0"
          >
            <UserPlus size={18} />
            <span className="hidden md:inline">Add Employee</span>
            <span className="md:hidden">Add</span>
          </button>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
           No employees found matching "{searchTerm}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                  <span className="text-xl font-bold">{emp.name.charAt(0)}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(emp)} className="text-slate-400 hover:text-blue-600 p-1">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDelete(emp.id)} className="text-slate-400 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800">{emp.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{emp.role}</p>
              
              <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" /> {emp.phone}
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee size={14} className="text-slate-400" /> {emp.baseSalary.toLocaleString('en-IN')}/mo
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-slate-400" /> Joined {emp.joiningDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{editingEmp.id ? 'Edit Employee' : 'New Employee'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingEmp.name || ''}
                  onChange={e => setEditingEmp({...editingEmp, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingEmp.role || ''}
                  onChange={e => setEditingEmp({...editingEmp, role: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingEmp.phone || ''}
                    onChange={e => setEditingEmp({...editingEmp, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Salary (Monthly)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingEmp.baseSalary || ''}
                    onChange={e => setEditingEmp({...editingEmp, baseSalary: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};