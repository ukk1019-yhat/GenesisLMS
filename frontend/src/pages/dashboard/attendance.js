import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
const headers = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function Attendance() {
  const { user } = useAuth();
  const canMark = user?.role === 'admin' || user?.role === 'teacher';
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [records, setRecords] = useState({});

  const loadAttendance = () => {
    const params = `date=${selectedDate}` + (selectedClass ? `&class=${selectedClass}` : '');
    axios.get(`${API}/attendance?${params}`, headers()).then(r => setAttendance(r.data.attendance)).catch(() => {});
  };

  useEffect(() => {
    loadAttendance();
    axios.get(`${API}/students?limit=500`, headers()).then(r => setStudents(r.data.students)).catch(() => {});
  }, [selectedDate, selectedClass]);

  const toggleStatus = (studentId, currentStatus) => {
    const next = { present: 'absent', absent: 'late', late: 'present' };
    setRecords(prev => ({ ...prev, [studentId]: next[currentStatus] || 'present' }));
  };

  const submitAttendance = async () => {
    const allRecords = students
      .filter(s => !selectedClass || s.class === selectedClass)
      .map(s => ({
        student_id: s.id,
        date: selectedDate,
        status: records[s.id] || 'present',
      }));
    try {
      await axios.post(`${API}/attendance`, { records: allRecords }, headers());
      alert('Attendance saved successfully!');
      loadAttendance();
      setRecords({});
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving attendance');
    }
  };

  const filteredStudents = students.filter(s => !selectedClass || s.class === selectedClass);
  const classes = [...new Set(students.map(s => s.class))].sort();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Attendance Management</h2>

          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input type="date" className="input-field" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Class (filter)</label>
              <select className="input-field" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {canMark && (
            <div className="flex space-x-3">
              <button onClick={submitAttendance} className="btn-primary">Save Today's Attendance</button>
            </div>
          )}

          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 font-medium">Student</th>
                  <th className="text-left p-3 font-medium">Roll No</th>
                  <th className="text-left p-3 font-medium">Class</th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {canMark ? (
                  filteredStudents.map(s => {
                    const existing = attendance.find(a => a.student_id === s.id);
                    const status = existing?.status || records[s.id] || 'present';
                    return (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{s.name}</td>
                        <td className="p-3">{s.roll_number}</td>
                        <td className="p-3">{s.class} {s.section}</td>
                        <td className="p-3">
                          <button
                            onClick={() => toggleStatus(s.id, status)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              status === 'present' ? 'bg-green-100 text-green-700' :
                              status === 'absent' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  attendance.map(a => (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{a.student_name}</td>
                      <td className="p-3">{a.roll_number}</td>
                      <td className="p-3">{a.class}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          a.status === 'present' ? 'bg-green-100 text-green-700' :
                          a.status === 'absent' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
                {canMark && filteredStudents.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-400">No students found for this class</td></tr>
                )}
                {!canMark && attendance.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-400">No attendance records for this date</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
