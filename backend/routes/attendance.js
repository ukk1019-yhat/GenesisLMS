const express = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { student_id, date, class: cls, month, year, page = 1, limit = 50 } = req.query;
    let query = db.collection('attendance');

    if (student_id) query = query.where('student_id', '==', student_id);
    if (date) query = query.where('date', '==', date);

    const snapshot = await query.orderBy('date', 'desc').get();
    let records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (month) records = records.filter(r => new Date(r.date).getMonth() + 1 == parseInt(month));
    if (year) records = records.filter(r => new Date(r.date).getFullYear() == parseInt(year));

    const studentIds = [...new Set(records.map(r => r.student_id))];
    const studentMap = {};
    for (const sid of studentIds) {
      const doc = await db.collection('students').doc(sid).get();
      if (doc.exists) {
        const s = doc.data();
        studentMap[sid] = { student_name: s.name, roll_number: s.roll_number, class: s.class };
      }
    }

    let result = records.map(r => ({ ...r, ...(studentMap[r.student_id] || {}) }));

    if (cls) result = result.filter(r => r.class === cls);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginated = result.slice(offset, offset + parseInt(limit));

    res.json({ attendance: paginated, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get attendance error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Attendance records array is required' });
    }

    let inserted = 0;
    let errors = [];

    for (const r of records) {
      try {
        const existing = await db.collection('attendance')
          .where('student_id', '==', r.student_id)
          .where('date', '==', r.date)
          .limit(1)
          .get();

        if (!existing.empty) {
          await existing.docs[0].ref.update({
            status: r.status,
            remarks: r.remarks || '',
          });
        } else {
          await db.collection('attendance').add({
            student_id: r.student_id,
            date: r.date,
            status: r.status,
            remarks: r.remarks || '',
            created_at: new Date().toISOString(),
          });
        }
        inserted++;
      } catch (e) {
        errors.push({ student_id: r.student_id, error: e.message });
      }
    }

    await db.collection('audit_logs').add({
      user_id: req.user.id,
      action: 'MARK_ATTENDANCE',
      entity_type: 'attendance',
      details: `Marked attendance for ${inserted} students`,
      created_at: new Date().toISOString(),
    });

    res.json({ inserted, errors });
  } catch (err) {
    console.error('Mark attendance error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/summary/:studentId', authenticate, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = db.collection('attendance').where('student_id', '==', req.params.studentId);
    const snapshot = await query.orderBy('date', 'desc').get();

    let records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (month) records = records.filter(r => new Date(r.date).getMonth() + 1 == parseInt(month));
    if (year) records = records.filter(r => new Date(r.date).getFullYear() == parseInt(year));

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;

    res.json({
      records,
      summary: {
        total, present, absent, late,
        percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0,
      },
    });
  } catch (err) {
    console.error('Attendance summary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/monthly-report', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { month, year, class: cls } = req.query;
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const studentsSnap = await db.collection('students').get();
    let students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (cls) students = students.filter(s => s.class === cls);

    const result = [];
    for (const s of students) {
      const attSnap = await db.collection('attendance')
        .where('student_id', '==', s.id)
        .get();

      const records = attSnap.docs.map(d => d.data()).filter(r => {
        const d = new Date(r.date);
        return d.getMonth() + 1 === targetMonth && d.getFullYear() === targetYear;
      });

      const totalDays = records.length;
      const presentDays = records.filter(r => r.status === 'present').length;
      const absentDays = records.filter(r => r.status === 'absent').length;
      const lateDays = records.filter(r => r.status === 'late').length;

      result.push({
        id: s.id,
        name: s.name,
        roll_number: s.roll_number,
        class: s.class,
        section: s.section,
        total_days: totalDays,
        present_days: presentDays,
        absent_days: absentDays,
        late_days: lateDays,
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Monthly report error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
