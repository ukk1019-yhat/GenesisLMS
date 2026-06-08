import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
const headers = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [filter, setFilter] = useState('');

  const load = () => {
    const params = filter ? `?status=${filter}` : '';
    axios.get(`${API}/inquiries${params}`, headers()).then(r => setInquiries(r.data.inquiries)).catch(() => {});
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/inquiries/${id}/status`, { status }, headers());
      load();
    } catch (err) { alert('Error updating status'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this inquiry?')) return;
    try {
      await axios.delete(`${API}/inquiries/${id}`, headers());
      load();
    } catch (err) { alert('Error deleting'); }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get(`${API}/inquiries/export`, {
        ...headers(),
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'admission-inquiries.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Error exporting inquiries');
    }
  };

  const statusBadge = (status) => {
    const colors = { new: 'bg-blue-100 text-blue-700', contacted: 'bg-yellow-100 text-yellow-700', enrolled: 'bg-green-100 text-green-700' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Admission Inquiries</h2>
            <button onClick={handleExport} className="btn-secondary text-sm flex items-center space-x-1">Download Excel</button>
          </div>

          <div className="flex space-x-3">
            {['', 'new', 'contacted', 'enrolled'].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === s ? 'bg-school-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>

          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Class</th>
                  <th className="text-left p-3 font-medium">Message</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map(inq => (
                  <tr key={inq.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{inq.name}</td>
                    <td className="p-3">{inq.phone}</td>
                    <td className="p-3">{inq.email || '-'}</td>
                    <td className="p-3">{inq.class}</td>
                    <td className="p-3 max-w-[200px] truncate text-gray-500">{inq.message || '-'}</td>
                    <td className="p-3">{statusBadge(inq.status)}</td>
                    <td className="p-3 text-xs text-gray-400">{new Date(inq.created_at).toLocaleDateString()}</td>
                    <td className="p-3 flex space-x-2">
                      {inq.status === 'new' && <button onClick={() => updateStatus(inq.id, 'contacted')} className="text-yellow-600 hover:underline text-xs">Contacted</button>}
                      {inq.status === 'contacted' && <button onClick={() => updateStatus(inq.id, 'enrolled')} className="text-green-600 hover:underline text-xs">Enrolled</button>}
                      <button onClick={() => handleDelete(inq.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
                {inquiries.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-gray-400">No inquiries found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
