const express = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, async (req, res) => {
  try {
    const studentsSnap = await db.collection('students').get();
    const totalStudents = studentsSnap.size;

    const feesSnap = await db.collection('fees').get();
    let collected = 0, pending = 0;
    feesSnap.docs.forEach(doc => {
      const f = doc.data();
      collected += parseFloat(f.paid_fee) || 0;
      pending += (parseFloat(f.total_fee) - parseFloat(f.paid_fee)) || 0;
    });

    const today = new Date().toISOString().split('T')[0];
    const attSnap = await db.collection('attendance')
      .where('date', '==', today)
      .get();
    const totalToday = attSnap.size;
    const presentToday = attSnap.docs.filter(d => d.data().status === 'present').length;
    const attendancePct = totalToday > 0 ? ((presentToday / totalToday) * 100).toFixed(1) : 0;

    res.json({
      totalStudents,
      feesCollected: collected,
      pendingFees: pending,
      attendancePercentage: parseFloat(attendancePct),
      todayPresent: presentToday,
      todayTotal: totalToday,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/recent-activities', authenticate, async (req, res) => {
  try {
    const snapshot = await db.collection('audit_logs')
      .orderBy('created_at', 'desc')
      .limit(20)
      .get();

    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const userIds = [...new Set(logs.map(l => l.user_id).filter(Boolean))];
    const userMap = {};
    for (const uid of userIds) {
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) userMap[uid] = doc.data().name;
    }

    const result = logs.map(l => ({ ...l, user_name: userMap[l.user_id] || 'System' }));
    res.json(result);
  } catch (err) {
    console.error('Recent activities error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/class-distribution', authenticate, async (req, res) => {
  try {
    const snapshot = await db.collection('students').get();
    const dist = {};
    snapshot.docs.forEach(doc => {
      const cls = doc.data().class;
      dist[cls] = (dist[cls] || 0) + 1;
    });
    const result = Object.entries(dist).map(([key, value]) => ({ class: key, count: value }));
    result.sort((a, b) => a.class.localeCompare(b.class));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/fee-summary-by-month', authenticate, async (req, res) => {
  try {
    const snapshot = await db.collection('fees').get();
    const monthly = {};

    snapshot.docs.forEach(doc => {
      const f = doc.data();
      const key = `${f.month || 'Unknown'}-${f.year || 'Unknown'}`;
      if (!monthly[key]) monthly[key] = { month: f.month || 'Unknown', year: f.year || 0, total: 0, collected: 0 };
      monthly[key].total += parseFloat(f.total_fee) || 0;
      monthly[key].collected += parseFloat(f.paid_fee) || 0;
    });

    let result = Object.values(monthly);
    result.sort((a, b) => (b.year - a.year) || (b.month?.localeCompare?.(a.month) || 0));
    result = result.slice(0, 12);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
