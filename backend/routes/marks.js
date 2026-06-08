const express = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const calculateGrade = (obtained, total) => {
  const pct = (obtained / total) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
};

router.get('/', authenticate, async (req, res) => {
  try {
    const { student_id, exam_name, subject, page = 1, limit = 50 } = req.query;
    let query = db.collection('marks');

    if (student_id) query = query.where('student_id', '==', student_id);
    if (exam_name) query = query.where('exam_name', '==', exam_name);

    const snapshot = await query.orderBy('created_at', 'desc').get();
    let marks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (subject) {
      marks = marks.filter(m => m.subject?.toLowerCase().includes(subject.toLowerCase()));
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginated = marks.slice(offset, offset + parseInt(limit));

    const studentIds = [...new Set(paginated.map(m => m.student_id))];
    const studentMap = {};
    for (const sid of studentIds) {
      const doc = await db.collection('students').doc(sid).get();
      if (doc.exists) {
        const s = doc.data();
        studentMap[sid] = { student_name: s.name, roll_number: s.roll_number, class: s.class, section: s.section };
      }
    }

    const marksWithNames = paginated.map(m => ({
      ...m,
      ...(studentMap[m.student_id] || {}),
    }));

    res.json({ marks: marksWithNames, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get marks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { student_id, subject, exam_name, marks_obtained, total_marks } = req.body;
    if (!student_id || !subject || !exam_name || marks_obtained === undefined || !total_marks) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const grade = calculateGrade(parseFloat(marks_obtained), parseFloat(total_marks));
    const docRef = await db.collection('marks').add({
      student_id,
      subject,
      exam_name,
      marks_obtained: parseFloat(marks_obtained),
      total_marks: parseFloat(total_marks),
      grade,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    db.collection('audit_logs').add({
      user_id: req.user.id,
      action: 'CREATE_MARK',
      entity_type: 'mark',
      entity_id: docRef.id,
      details: `Added marks: ${subject} ${exam_name} = ${marks_obtained}/${total_marks} (${grade})`,
      created_at: new Date().toISOString(),
    }).catch(() => {});

    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Create mark error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const docRef = db.collection('marks').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Mark record not found' });

    const existing = doc.data();
    const { marks_obtained, total_marks, subject, exam_name } = req.body;

    const marks = marks_obtained !== undefined ? parseFloat(marks_obtained) : existing.marks_obtained;
    const total = total_marks !== undefined ? parseFloat(total_marks) : existing.total_marks;
    const grade = calculateGrade(marks, total);

    const updates = {
      marks_obtained: marks,
      total_marks: total,
      grade,
      updated_at: new Date().toISOString(),
    };
    if (subject !== undefined) updates.subject = subject;
    if (exam_name !== undefined) updates.exam_name = exam_name;

    await docRef.update(updates);
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error('Update mark error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/report-card/:studentId', authenticate, async (req, res) => {
  try {
    const snapshot = await db.collection('marks')
      .where('student_id', '==', req.params.studentId)
      .orderBy('exam_name')
      .orderBy('subject')
      .get();

    const marks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let studentInfo = null;
    if (marks.length > 0) {
      const sDoc = await db.collection('students').doc(req.params.studentId).get();
      if (sDoc.exists) {
        const s = sDoc.data();
        studentInfo = { name: s.name, roll_number: s.roll_number, class: s.class, section: s.section };
      }
    }

    const summary = {};
    for (const m of marks) {
      if (!summary[m.exam_name]) {
        summary[m.exam_name] = { total: 0, obtained: 0, subjects: 0 };
      }
      summary[m.exam_name].total += m.total_marks;
      summary[m.exam_name].obtained += m.marks_obtained;
      summary[m.exam_name].subjects++;
    }

    res.json({ student: studentInfo, marks, summary });
  } catch (err) {
    console.error('Report card error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
