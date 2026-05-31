import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const headers = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function Students() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', roll_number: '', class: '', section: '', parent_name: '', parent_phone: '', parent_email: '', address: '', blood_group: '', transport_route: '', photo_url: '' });

  const loadStudents = () => {
    axios.get(`${API}/students?search=${search}`, headers()).then(r => setStudents(r.data.students)).catch(() => {});
  };

  useEffect(() => { loadStudents(); }, [search]);

  const resetForm = () => {
    setForm({ name: '', roll_number: '', class: '', section: '', parent_name: '', parent_phone: '', parent_email: '', address: '', blood_group: '', transport_route: '', photo_url: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API}/students/${editing.id}`, form, headers());
      } else {
        await axios.post(`${API}/students`, form, headers());
      }
      resetForm();
      loadStudents();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving student');
    }
  };

  const handleEdit = (s) => {
    setForm(s);
    setEditing(s);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await axios.delete(`${API}/students/${id}`, headers());
      loadStudents();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting student');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Student Management</h2>
            {isAdmin && (
              <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
                + Add Student
              </button>
            )}
          </div>

          <div className="relative">
            <input
              className="input-field pl-10"
              placeholder="Search by name, roll number, or parent phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          {showForm && isAdmin && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Student' : 'Add New Student'}</h3>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input className="input-field" placeholder="Photo URL" value={form.photo_url} onChange={e => setForm({...form, photo_url: e.target.value})} />
                <input className="input-field" placeholder="Full Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                <input className="input-field" placeholder="Roll Number *" value={form.roll_number} onChange={e => setForm({...form, roll_number: e.target.value})} required />
                <input className="input-field" placeholder="Class *" value={form.class} onChange={e => setForm({...form, class: e.target.value})} required />
                <input className="input-field" placeholder="Section" value={form.section} onChange={e => setForm({...form, section: e.target.value})} />
                <input className="input-field" placeholder="Parent Name" value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} />
                <input className="input-field" placeholder="Parent Phone" value={form.parent_phone} onChange={e => setForm({...form, parent_phone: e.target.value})} />
                <input className="input-field" placeholder="Parent Email" type="email" value={form.parent_email} onChange={e => setForm({...form, parent_email: e.target.value})} />
                <input className="input-field" placeholder="Blood Group" value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})} />
                <input className="input-field" placeholder="Transport Route" value={form.transport_route} onChange={e => setForm({...form, transport_route: e.target.value})} />
                <textarea className="input-field md:col-span-2" placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                <div className="md:col-span-2 lg:col-span-3 flex space-x-3">
                  <button type="submit" className="btn-primary">{editing ? 'Update' : 'Save'} Student</button>
                  <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 font-medium">Photo</th>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Roll No</th>
                  <th className="text-left p-3 font-medium">Class</th>
                  <th className="text-left p-3 font-medium">Parent</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-left p-3 font-medium">Blood Group</th>
                  {isAdmin && <th className="text-left p-3 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {s.photo_url ? <img src={s.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 bg-school-light rounded-full flex items-center justify-center text-school-primary font-bold">{s.name[0]}</div>}
                    </td>
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3">{s.roll_number}</td>
                    <td className="p-3">{s.class} {s.section}</td>
                    <td className="p-3">{s.parent_name || '-'}</td>
                    <td className="p-3">{s.parent_phone || '-'}</td>
                    <td className="p-3">{s.blood_group || '-'}</td>
                    {isAdmin && (
                      <td className="p-3">
                        <button onClick={() => handleEdit(s)} className="text-school-accent hover:underline mr-3">Edit</button>
                        <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={isAdmin ? 8 : 7} className="p-6 text-center text-gray-400">No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
