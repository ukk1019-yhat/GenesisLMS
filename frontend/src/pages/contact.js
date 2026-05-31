import Layout from '../components/Layout';
import { useState } from 'react';

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600 mb-8">We'd love to hear from you. Reach out to us with any questions.</p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {[
              { icon: '📍', label: 'Address', value: '123 School Street, Education City, State - 123456' },
              { icon: '📞', label: 'Phone', value: '+91 98765 43210' },
              { icon: '✉️', label: 'Email', value: 'info@schoolname.edu' },
              { icon: '🕐', label: 'Office Hours', value: 'Mon - Fri: 8:00 AM - 3:00 PM' },
            ].map((item, i) => (
              <div key={i} className="flex items-start">
                <span className="text-2xl mr-4">{item.icon}</span>
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-gray-600">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
            {sent ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg">Message sent successfully! We'll get back to you soon.</div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="space-y-4">
                <input className="input-field" placeholder="Your Name" required />
                <input className="input-field" type="email" placeholder="Your Email" required />
                <input className="input-field" placeholder="Subject" required />
                <textarea className="input-field" placeholder="Message" rows={4} required />
                <button type="submit" className="btn-primary w-full">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
