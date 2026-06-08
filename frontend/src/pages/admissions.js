import Layout from '../components/Layout';
import { useState } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '/api' : 'http://127.0.0.1:5000/api');

export default function Admissions() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', class: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/inquiries`, form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-school-primary to-school-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-school-accent font-semibold uppercase tracking-widest text-sm mb-2">Join Us</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Admissions Open</h1>
          <p className="text-gray-300 text-lg">
            Enrol at Genesis International Montessori and STEM School for the academic year 2026–27.
            Admissions are open for Play Group to Class VII.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Left column */}
          <div>
            <h2 className="text-2xl font-semibold text-school-primary mb-5">Admission Process</h2>
            <ol className="space-y-4 text-gray-600">
              {[
                'Fill the inquiry form online or visit our office.',
                'Attend a school interaction / entrance assessment.',
                'Submit all required documents.',
                'Complete admission formalities and fee payment.',
              ].map((step, i) => (
                <li key={i} className="flex items-start">
                  <span className="bg-school-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 shrink-0 font-bold">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>

            <h2 className="text-2xl font-semibold text-school-primary mt-10 mb-4">Documents Required</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Birth Certificate</li>
              <li>Previous School Report Card</li>
              <li>Transfer Certificate (if applicable)</li>
              <li>Passport size photographs (4 copies)</li>
              <li>National ID / Aadhar Card copy</li>
            </ul>

            <div className="mt-8 p-4 bg-school-light rounded-xl border border-yellow-200">
              <p className="text-school-primary font-semibold">Admissions Helpline</p>
              <p className="text-gray-600 mt-1">Call us at <strong>+91 97030 33531</strong> or email <strong>genesissrikakulam@gmail.com</strong></p>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-school-primary mb-4">Inquiry Form</h2>
            {submitted ? (
              <div className="bg-green-50 text-green-700 p-5 rounded-lg text-center">
                <p className="font-semibold">Thank you for your inquiry!</p>
                <p className="text-sm mt-1">Our admissions team will contact you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
                <input
                  className="input-field"
                  placeholder="Student Name"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Parent Phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
                <select
                  className="input-field"
                  value={form.class}
                  onChange={e => setForm({...form, class: e.target.value})}
                  required
                >
                  <option value="">Select Class</option>
                  {['Play Group', 'Nursery', 'LKG', 'UKG', ...Array.from({length:7}, (_,i) => `Class ${i+1}`)].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <textarea
                  className="input-field"
                  placeholder="Message (optional)"
                  rows={3}
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                />
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
