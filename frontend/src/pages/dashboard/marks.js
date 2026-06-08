import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
const headers = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function Marks() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'teacher';
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_id: '', subject: '', exam_name: '', marks_obtained: '', total_marks: '' });
  const [reportCard, setReportCard] = useState(null);

  const loadMarks = () => {
    axios.get(`${API}/marks?limit=100`, headers()).then(r => setMarks(r.data.marks)).catch(() => {});
  };

  useEffect(() => {
    loadMarks();
    axios.get(`${API}/students?limit=200`, headers()).then(r => setStudents(r.data.students)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/marks`, form, headers());
      setShowForm(false);
      setForm({ student_id: '', subject: '', exam_name: '', marks_obtained: '', total_marks: '' });
      loadMarks();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving marks');
    }
  };

  const loadReportCard = async (studentId) => {
    try {
      const res = await axios.get(`${API}/marks/report-card/${studentId}`, headers());
      setReportCard(res.data);
    } catch (err) {
      alert('Error loading report card');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Marks Management</h2>
            {canManage && (
              <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                {showForm ? 'Cancel' : '+ Upload Marks'}
              </button>
            )}
          </div>

          {showForm && canManage && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Upload Marks</h3>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                <select className="input-field" value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} required>
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>
                  ))}
                </select>
                <input className="input-field" placeholder="Subject *" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
                <input className="input-field" placeholder="Exam Name *" value={form.exam_name} onChange={e => setForm({...form, exam_name: e.target.value})} required />
                <input className="input-field" type="number" step="0.01" placeholder="Marks Obtained *" value={form.marks_obtained} onChange={e => setForm({...form, marks_obtained: e.target.value})} required />
                <input className="input-field" type="number" step="0.01" placeholder="Total Marks *" value={form.total_marks} onChange={e => setForm({...form, total_marks: e.target.value})} required />
                <div>
                  <button type="submit" className="btn-primary">Save Marks</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 font-medium">Student</th>
                    <th className="text-left p-3 font-medium">Subject</th>
                    <th className="text-left p-3 font-medium">Exam</th>
                    <th className="text-left p-3 font-medium">Marks</th>
                    <th className="text-left p-3 font-medium">Grade</th>
                    <th className="text-left p-3 font-medium">Report</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map(m => (
                    <tr key={m.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{m.student_name}</td>
                      <td className="p-3">{m.subject}</td>
                      <td className="p-3">{m.exam_name}</td>
                      <td className="p-3">{m.marks_obtained}/{m.total_marks}</td>
                      <td className="p-3">
                        <span className={`font-bold ${m.grade === 'F' ? 'text-red-600' : 'text-green-600'}`}>{m.grade}</span>
                      </td>
                      <td className="p-3">
                        <button onClick={() => loadReportCard(m.student_id)} className="text-school-accent hover:underline text-xs">View Report</button>
                      </td>
                    </tr>
                  ))}
                  {marks.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-gray-400">No marks records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {reportCard && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">Report Card</h3>
                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>{reportCard.student?.name}</strong></p>
                  <p>Roll: {reportCard.student?.roll_number} | Class: {reportCard.student?.class} {reportCard.student?.section}</p>
                </div>
                <div className="space-y-3">
                  {Object.entries(reportCard.summary || {}).map(([exam, data]) => (
                    <div key={exam} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-sm">{exam}</p>
                      <p className="text-lg font-bold text-school-primary">{data.obtained}/{data.total}</p>
                      <p className="text-xs text-gray-500">{((data.obtained / data.total) * 100).toFixed(1)}% | {data.subjects} subjects</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setReportCard(null)} className="text-gray-500 hover:text-gray-700 text-sm mt-3">Close</button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
