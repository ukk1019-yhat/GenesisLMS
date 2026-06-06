import Layout from '../components/Layout';
import { useState } from 'react';
import { LocationIcon, PhoneIcon, MailIcon, TimeIcon } from '../components/Icons';

export default function Contact() {
  const [sent, setSent] = useState(false);

  const contactItems = [
    { icon: LocationIcon, label: 'Address', value: 'Visakha A colony, Near Arch, Opposite SBI, Peddapadu Road, Srikakulam, AP 532001' },
    { icon: PhoneIcon, label: 'Phone', value: '+91 97030 33531 / +91 83283 73123' },
    { icon: MailIcon, label: 'Email', value: 'genesissrikakulam@gmail.com' },
    { icon: TimeIcon, label: 'Office Hours', value: 'Mon - Fri: 8:00 AM - 3:00 PM' },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600 mb-8">We'd love to hear from you. Reach out to us with any questions.</p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {contactItems.map((item, i) => (
              <div key={i} className="flex items-start">
                <span className="mr-4"><item.icon /></span>
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
