const express = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const XLSX = require('xlsx');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, phone, email, class: cls, message } = req.body;
    if (!name || !phone || !cls) {
      return res.status(400).json({ error: 'Name, phone, and class are required' });
    }
    const docRef = await db.collection('inquiries').add({
      name,
      phone,
      email: email || '',
      class: cls,
      message: message || '',
      status: 'new',
      created_at: new Date().toISOString(),
    });
    res.status(201).json({ id: docRef.id, message: 'Inquiry submitted successfully' });
  } catch (err) {
    console.error('Create inquiry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    let query = db.collection('inquiries').orderBy('created_at', 'desc');
    if (status) query = query.where('status', '==', status);
    const snapshot = await query.get();
    const inquiries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ inquiries });
  } catch (err) {
    console.error('Get inquiries error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    await db.collection('inquiries').doc(req.params.id).update({ status });
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await db.collection('inquiries').doc(req.params.id).delete();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/export', authenticate, authorize('admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('inquiries').orderBy('created_at', 'desc').get();
    const inquiries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const data = inquiries.map((inquiry, i) => ({
      '#': i + 1,
      Name: inquiry.name,
      Phone: inquiry.phone,
      Email: inquiry.email || '-',
      Class: inquiry.class,
      Message: inquiry.message || '-',
      Status: inquiry.status,
      Date: new Date(inquiry.created_at).toLocaleString(),
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Inquiries');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="admission-inquiries.xlsx"');
    res.send(buf);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;