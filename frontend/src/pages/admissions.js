import Layout from '../components/Layout';
import { useState } from 'react';

export default function Admissions() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', class: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Admissions</h1>
        <p className="text-lg text-gray-600 mb-8">Join SchoolName for the academic year 2024-25. Admissions are open for classes Nursery to XII.</p>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Admission Process</h2>
            <ol className="space-y-4 text-gray-600">
              {[
                'Fill the inquiry form',
                'Visit school for interaction',
                'Submit required documents',
                'Complete the admission formalities',
              ].map((step, i) => (
                <li key={i} className="flex items-start">
                  <span className="bg-school-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Documents Required</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Birth Certificate</li>
              <li>Previous School Report Card</li>
              <li>Transfer Certificate (if applicable)</li>
              <li>Passport size photographs (4 copies)</li>
              <li>Aadhar Card copy</li>
            </ul>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Inquiry Form</h2>
            {submitted ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                Thank you for your inquiry! We will contact you soon.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input className="input-field" placeholder="Student Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                <input className="input-field" placeholder="Parent Phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <select className="input-field" value={form.class} onChange={e => setForm({...form, class: e.target.value})} required>
                  <option value="">Select Class</option>
                  {['Nursery', 'LKG', 'UKG', ...Array.from({length:12}, (_,i) => `Class ${i+1}`)].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <textarea className="input-field" placeholder="Message (optional)" rows={3} value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
                <button type="submit" className="btn-primary w-full">Submit Inquiry</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
