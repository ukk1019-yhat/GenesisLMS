import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const headers = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function Fees() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'accountant';
  const [fees, setFees] = useState([]);
  const [totals, setTotals] = useState({ total: 0, paid: 0, pending: 0 });
  const [showForm, setShowForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ student_id: '', total_fee: '', paid_fee: '0', due_date: '', month: '', year: new Date().getFullYear() });

  const loadFees = () => {
    axios.get(`${API}/fees`, headers()).then(r => { setFees(r.data.fees); setTotals(r.data.totals); }).catch(() => {});
  };

  useEffect(() => {
    loadFees();
    axios.get(`${API}/students?limit=200`, headers()).then(r => setStudents(r.data.students)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/fees`, form, headers());
      setShowForm(false);
      setForm({ student_id: '', total_fee: '', paid_fee: '0', due_date: '', month: '', year: new Date().getFullYear() });
      loadFees();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating fee record');
    }
  };

  const handlePayment = async (feeId, amount) => {
    try {
      await axios.put(`${API}/fees/${feeId}/pay`, { amount }, headers());
      loadFees();
    } catch (err) {
      alert(err.response?.data?.error || 'Error processing payment');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Fee Management</h2>
            {canManage && (
              <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                {showForm ? 'Cancel' : '+ Add Fee Record'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Fees', value: `₹${totals.total.toLocaleString()}`, color: 'text-school-primary' },
              { label: 'Collected', value: `₹${totals.paid.toLocaleString()}`, color: 'text-green-600' },
              { label: 'Pending', value: `₹${totals.pending.toLocaleString()}`, color: 'text-red-600' },
            ].map((item, i) => (
              <div key={i} className="stat-card">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-gray-500 text-sm">{item.label}</p>
              </div>
            ))}
          </div>

          {showForm && canManage && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Add Fee Record</h3>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <select className="input-field" value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} required>
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>
                  ))}
                </select>
                <input className="input-field" type="number" step="0.01" placeholder="Total Fee *" value={form.total_fee} onChange={e => setForm({...form, total_fee: e.target.value})} required />
                <input className="input-field" type="number" step="0.01" placeholder="Paid Amount" value={form.paid_fee} onChange={e => setForm({...form, paid_fee: e.target.value})} />
                <input className="input-field" type="date" placeholder="Due Date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
                <input className="input-field" placeholder="Month (e.g. January)" value={form.month} onChange={e => setForm({...form, month: e.target.value})} />
                <input className="input-field" type="number" placeholder="Year" value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
                <div className="md:col-span-2 lg:col-span-3">
                  <button type="submit" className="btn-primary">Save Fee Record</button>
                </div>
              </form>
            </div>
          )}

          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 font-medium">Student</th>
                  <th className="text-left p-3 font-medium">Class</th>
                  <th className="text-left p-3 font-medium">Total Fee</th>
                  <th className="text-left p-3 font-medium">Paid</th>
                  <th className="text-left p-3 font-medium">Pending</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Month</th>
                  <th className="text-left p-3 font-medium">Receipt</th>
                  {canManage && <th className="text-left p-3 font-medium">Action</th>}
                </tr>
              </thead>
              <tbody>
                {fees.map(f => (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{f.student_name}</td>
                    <td className="p-3">{f.class}</td>
                    <td className="p-3">₹{parseFloat(f.total_fee).toLocaleString()}</td>
                    <td className="p-3 text-green-600">₹{parseFloat(f.paid_fee).toLocaleString()}</td>
                    <td className="p-3 text-red-600">₹{parseFloat(f.pending_fee).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.status === 'paid' ? 'bg-green-100 text-green-700' : f.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="p-3">{f.month} {f.year}</td>
                    <td className="p-3 text-xs">{f.receipt_number || '-'}</td>
                    {canManage && (
                      <td className="p-3">
                        {f.status !== 'paid' && (
                          <button onClick={() => { const amt = prompt('Enter payment amount:'); if (amt) handlePayment(f.id, parseFloat(amt)); }} className="btn-success text-xs py-1">
                            Collect Payment
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {fees.length === 0 && (
                  <tr><td colSpan={canManage ? 9 : 8} className="p-6 text-center text-gray-400">No fee records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
