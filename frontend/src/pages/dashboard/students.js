import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { UploadIcon, SearchIcon, CheckIcon, AlertIcon } from '../../components/Icons';

const API = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '/api' : 'http://127.0.0.1:5000/api');
const headers = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append('photo', file);
  const res = await axios.post(`${API}/upload/photo`, formData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
}

async function uploadExcel(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API}/students/bulk-import-excel`, formData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export default function Students() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', roll_number: '', class: '', section: '', parent_name: '', parent_phone: '', parent_email: '', address: '', blood_group: '', transport_route: '', photo_url: '', pen_number: '', student_type: 'dayscholar' });
  const [showBulk, setShowBulk] = useState(false);
  const [bulkTab, setBulkTab] = useState('json');
  const [bulkData, setBulkData] = useState('');
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadStudents = () => {
    const params = new URLSearchParams({ search });
    if (classFilter) params.append('class', classFilter);
    axios.get(`${API}/students?${params}`, headers()).then(r => {
      setStudents(r.data.students);
      const unique = [...new Set(r.data.students.map(s => s.class).filter(Boolean))].sort();
      setClasses(prev => prev.length ? prev : unique);
    }).catch(() => {});
  };

  useEffect(() => { loadStudents(); }, [search, classFilter]);

  const loadAllClasses = () => {
    axios.get(`${API}/students?limit=500`, headers()).then(r => {
      const unique = [...new Set(r.data.students.map(s => s.class).filter(Boolean))].sort();
      setClasses(unique);
    }).catch(() => {});
  };

  useEffect(() => { loadAllClasses(); }, []);

  const resetForm = () => {
    setForm({ name: '', roll_number: '', class: '', section: '', parent_name: '', parent_phone: '', parent_email: '', address: '', blood_group: '', transport_route: '', photo_url: '', pen_number: '', student_type: 'dayscholar' });
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

  const handleBulkImport = async () => {
    let students;
    try {
      students = JSON.parse(bulkData);
    } catch {
      alert('Invalid JSON. Please check the format.');
      return;
    }
    if (!Array.isArray(students) || students.length === 0) {
      alert('Please provide an array of student objects.');
      return;
    }
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const res = await axios.post(`${API}/students/bulk-import`, { students }, headers());
      setBulkResult(res.data);
      setBulkData('');
      loadStudents();
      loadAllClasses();
    } catch (err) {
      alert(err.response?.data?.error || 'Error importing students');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Student Management</h2>
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <button onClick={() => { setShowBulk(!showBulk); setShowForm(false); }} className="btn-secondary text-sm flex items-center space-x-1">
                  <UploadIcon /><span>Bulk Import</span>
                </button>
              )}
              {isAdmin && (
                <button onClick={() => { resetForm(); setShowForm(true); setShowBulk(false); }} className="btn-primary">
                  + Add Student
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <input
                className="input-field pl-10"
                placeholder="Search by name, roll number, or parent phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400"><SearchIcon /></span>
            </div>
            <select
              className="input-field w-auto"
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {showBulk && isAdmin && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Bulk Import Students</h3>
              <div className="flex space-x-2 mb-4">
                <button onClick={() => setBulkTab('json')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${bulkTab === 'json' ? 'bg-school-primary text-white' : 'bg-gray-100 text-gray-600'}`}>JSON</button>
                <button onClick={() => setBulkTab('excel')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${bulkTab === 'excel' ? 'bg-school-primary text-white' : 'bg-gray-100 text-gray-600'}`}>Excel</button>
              </div>

              {bulkTab === 'json' && (
                <>
                  <p className="text-sm text-gray-500 mb-3">
                    Paste a JSON array of student objects. Required fields: <code>name</code>, <code>roll_number</code>, <code>class</code>.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg mb-3 text-xs font-mono text-gray-600">
                    [{'{'}"name":"John Doe","roll_number":"2401","class":"Class 1","section":"A","parent_name":"Jane Doe","parent_phone":"9876543210","parent_email":"jane@example.com","pen_number":"PEN123","student_type":"dayscholar"{'}'}]
                  </div>
                  <textarea
                    className="input-field font-mono text-sm"
                    rows={8}
                    placeholder='[{ "name": "...", "roll_number": "...", "class": "...", "section": "...", "parent_name": "...", "parent_phone": "...", "pen_number": "...", "student_type": "dayscholar" }]'
                    value={bulkData}
                    onChange={e => setBulkData(e.target.value)}
                  />
                  <div className="flex space-x-3 mt-3">
                    <button onClick={handleBulkImport} disabled={bulkLoading} className="btn-primary">
                      {bulkLoading ? 'Importing...' : 'Import Students'}
                    </button>
                  </div>
                </>
              )}

              {bulkTab === 'excel' && (
                <>
                  <p className="text-sm text-gray-500 mb-3">
                    Upload an Excel file (.xlsx). Columns: <code>Name</code>, <code>Roll Number</code>, <code>Class</code>, <code>Section</code>, <code>Parent Name</code>, <code>Parent Phone</code>, <code>PEN Number</code>, <code>Student Type</code>.
                  </p>
                  <input type="file" accept=".xlsx,.xls" className="input-field" onChange={async e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setBulkLoading(true);
                    setBulkResult(null);
                    try {
                      const res = await uploadExcel(file);
                      setBulkResult(res);
                      loadStudents();
                      loadAllClasses();
                    } catch (err) {
                      alert(err.response?.data?.error || 'Error importing Excel');
                    } finally { setBulkLoading(false); }
                  }} />
                  {bulkLoading && <p className="text-sm text-gray-500 mt-2">Uploading and importing...</p>}
                </>
              )}

              <div className="flex space-x-3 mt-3">
                <button onClick={() => { setShowBulk(false); setBulkResult(null); setBulkData(''); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              </div>

              {bulkResult && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${bulkResult.errors?.length ? 'bg-yellow-50 text-yellow-800' : 'bg-green-50 text-green-700'}`}>
                  <p className="flex items-center space-x-1"><CheckIcon /><span>{bulkResult.imported} students imported successfully.</span></p>
                  {bulkResult.errors?.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium flex items-center space-x-1"><AlertIcon /><span>{bulkResult.errors.length} errors:</span></p>
                      <ul className="list-disc list-inside text-xs mt-1">
                        {bulkResult.errors.map((e, i) => <li key={i}>{e.row}: {e.error}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {showForm && isAdmin && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Student' : 'Add New Student'}</h3>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm text-gray-600 mb-1">Photo (JPG format)</label>
                  <input type="file" accept=".jpg,.jpeg,.png" className="input-field" onChange={async e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                      const url = await uploadPhoto(file);
                      setForm({...form, photo_url: url});
                    } catch { alert('Photo upload failed'); }
                  }} />
                  {form.photo_url && <img src={form.photo_url} alt="preview" className="mt-2 h-20 w-20 rounded-lg object-cover" />}
                </div>
                <input className="input-field" placeholder="Full Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                <input className="input-field" placeholder="Roll Number *" value={form.roll_number} onChange={e => setForm({...form, roll_number: e.target.value})} required />
                <input className="input-field" placeholder="PEN Number" value={form.pen_number} onChange={e => setForm({...form, pen_number: e.target.value})} />
                <select className="input-field" value={form.class} onChange={e => setForm({...form, class: e.target.value})} required>
                  <option value="">Select Class</option>
                  {['Play Group', 'Nursery', 'LKG', 'UKG', ...Array.from({length:7}, (_,i) => `Class ${i+1}`)].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input className="input-field" placeholder="Section" value={form.section} onChange={e => setForm({...form, section: e.target.value})} />
                <select className="input-field" value={form.student_type} onChange={e => setForm({...form, student_type: e.target.value})}>
                  <option value="dayscholar">Day Scholar</option>
                  <option value="hosteler">Hosteler</option>
                </select>
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
                  <th className="text-left p-3 font-medium">PEN No</th>
                  <th className="text-left p-3 font-medium">Class</th>
                  <th className="text-left p-3 font-medium">Type</th>
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
                    <td className="p-3 text-xs">{s.pen_number || '-'}</td>
                    <td className="p-3">{s.class} {s.section}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.student_type === 'hosteler' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {s.student_type === 'hosteler' ? 'Hosteler' : 'Day Scholar'}
                      </span>
                    </td>
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
                  <tr><td colSpan={isAdmin ? 10 : 9} className="p-6 text-center text-gray-400">No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
