const express = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, student_id, month, year, page = 1, limit = 50 } = req.query;
    let query = db.collection('fees');

    if (status) query = query.where('status', '==', status);
    if (student_id) query = query.where('student_id', '==', student_id);

    const snapshot = await query.orderBy('created_at', 'desc').get();
    let fees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (month) fees = fees.filter(f => f.month === month);
    if (year) fees = fees.filter(f => f.year == parseInt(year));

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginated = fees.slice(offset, offset + parseInt(limit));

    const studentIds = [...new Set(paginated.map(f => f.student_id))];
    const studentMap = {};
    if (studentIds.length > 0) {
      for (const sid of studentIds) {
        const doc = await db.collection('students').doc(sid).get();
        if (doc.exists) {
          const s = doc.data();
          studentMap[sid] = { student_name: s.name, roll_number: s.roll_number, class: s.class };
        }
      }
    }

    const feesWithNames = paginated.map(f => ({
      ...f,
      ...(studentMap[f.student_id] || {}),
    }));

    let total = 0, paid = 0, pending = 0;
    fees.forEach(f => {
      total += parseFloat(f.total_fee) || 0;
      paid += parseFloat(f.paid_fee) || 0;
      pending += (parseFloat(f.total_fee) - parseFloat(f.paid_fee)) || 0;
    });

    res.json({
      fees: feesWithNames,
      totals: { total, paid, pending },
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Get fees error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { student_id, total_fee, paid_fee, due_date, month, year } = req.body;
    if (!student_id || total_fee === undefined) {
      return res.status(400).json({ error: 'Student ID and total fee are required' });
    }

    const paid = parseFloat(paid_fee) || 0;
    const total = parseFloat(total_fee);
    const status = paid >= total ? 'paid' : paid > 0 ? 'partial' : 'pending';

    const docRef = await db.collection('fees').add({
      student_id,
      total_fee: total,
      paid_fee: paid,
      due_date: due_date || '',
      payment_date: paid > 0 ? new Date().toISOString() : '',
      status,
      month: month || '',
      year: year ? parseInt(year) : new Date().getFullYear(),
      receipt_number: `RCP-${Date.now()}`,
      created_at: new Date().toISOString(),
    });

    db.collection('audit_logs').add({
      user_id: req.user.id,
      action: 'CREATE_FEE',
      entity_type: 'fee',
      entity_id: docRef.id,
      details: `Created fee record: ${status}, amount ${paid}/${total}`,
      created_at: new Date().toISOString(),
    }).catch(() => {});

    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Create fee error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/pay', authenticate, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const docRef = db.collection('fees').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Fee record not found' });

    const f = doc.data();
    const newPaid = parseFloat(f.paid_fee) + parseFloat(amount);
    const newStatus = newPaid >= parseFloat(f.total_fee) ? 'paid' : 'partial';

    await docRef.update({
      paid_fee: newPaid,
      status: newStatus,
      payment_date: new Date().toISOString(),
      receipt_number: `RCP-${Date.now()}`,
    });

    db.collection('audit_logs').add({
      user_id: req.user.id,
      action: 'PAYMENT',
      entity_type: 'fee',
      entity_id: req.params.id,
      details: `Payment of ${amount} received`,
      created_at: new Date().toISOString(),
    }).catch(() => {});

    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error('Pay fee error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/pending-reminders', authenticate, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const snapshot = await db.collection('fees')
      .where('status', 'in', ['pending', 'partial'])
      .orderBy('due_date', 'asc')
      .get();

    const fees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const result = [];
    for (const f of fees) {
      const sDoc = await db.collection('students').doc(f.student_id).get();
      if (sDoc.exists) {
        const s = sDoc.data();
        result.push({
          ...f,
          student_name: s.name,
          roll_number: s.roll_number,
          class: s.class,
          parent_phone: s.parent_phone,
          parent_email: s.parent_email,
        });
      }
    }

    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const filtered = result.filter(f => f.due_date && new Date(f.due_date) <= weekLater);

    res.json(filtered);
  } catch (err) {
    console.error('Pending reminders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
