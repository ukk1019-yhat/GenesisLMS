const express = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { search, class: cls, page = 1, limit = 50 } = req.query;
    let query = db.collection('students');
    let constraints = [];

    if (cls) {
      query = query.where('class', '==', cls);
    }

    const snapshot = await query.orderBy('name', 'asc').get();
    let students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (search) {
      const s = search.toLowerCase();
      students = students.filter(st =>
        st.name?.toLowerCase().includes(s) ||
        st.roll_number?.toLowerCase().includes(s) ||
        st.pen_number?.toLowerCase().includes(s) ||
        st.parent_phone?.includes(s)
      );
    }

    const total = students.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    students = students.slice(offset, offset + parseInt(limit));

    res.json({ students, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const doc = await db.collection('students').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const {
      photo_url, name, roll_number, class: cls, section,
      parent_name, parent_phone, parent_email, address,
      blood_group, transport_route, pen_number, student_type,
    } = req.body;

    if (!name || !roll_number || !cls) {
      return res.status(400).json({ error: 'Name, roll number, and class are required' });
    }

    const existing = await db.collection('students')
      .where('roll_number', '==', roll_number)
      .limit(1)
      .get();
    if (!existing.empty) {
      return res.status(400).json({ error: 'Roll number already exists' });
    }

    const docRef = await db.collection('students').add({
      photo_url: photo_url || '',
      name,
      roll_number,
      class: cls,
      section: section || '',
      parent_name: parent_name || '',
      parent_phone: parent_phone || '',
      parent_email: parent_email || '',
      address: address || '',
      blood_group: blood_group || '',
      transport_route: transport_route || '',
      pen_number: pen_number || '',
      student_type: student_type || 'dayscholar',
      admission_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await db.collection('audit_logs').add({
      user_id: req.user.id,
      action: 'CREATE_STUDENT',
      entity_type: 'student',
      entity_id: docRef.id,
      details: `Created student ${name} (${roll_number})`,
      created_at: new Date().toISOString(),
    });

    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const docRef = db.collection('students').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const {
      photo_url, name, roll_number, class: cls, section,
      parent_name, parent_phone, parent_email, address,
      blood_group, transport_route, pen_number, student_type,
    } = req.body;

    const updates = {};
    if (photo_url !== undefined) updates.photo_url = photo_url;
    if (name !== undefined) updates.name = name;
    if (roll_number !== undefined) updates.roll_number = roll_number;
    if (cls !== undefined) updates.class = cls;
    if (section !== undefined) updates.section = section;
    if (parent_name !== undefined) updates.parent_name = parent_name;
    if (parent_phone !== undefined) updates.parent_phone = parent_phone;
    if (parent_email !== undefined) updates.parent_email = parent_email;
    if (address !== undefined) updates.address = address;
    if (blood_group !== undefined) updates.blood_group = blood_group;
    if (transport_route !== undefined) updates.transport_route = transport_route;
    if (pen_number !== undefined) updates.pen_number = pen_number;
    if (student_type !== undefined) updates.student_type = student_type;
    updates.updated_at = new Date().toISOString();

    await docRef.update(updates);

    await db.collection('audit_logs').add({
      user_id: req.user.id,
      action: 'UPDATE_STUDENT',
      entity_type: 'student',
      entity_id: req.params.id,
      details: `Updated student ${updates.name || doc.data().name}`,
      created_at: new Date().toISOString(),
    });

    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const docRef = db.collection('students').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const data = doc.data();
    await docRef.delete();

    await db.collection('audit_logs').add({
      user_id: req.user.id,
      action: 'DELETE_STUDENT',
      entity_type: 'student',
      entity_id: req.params.id,
      details: `Deleted student ${data.name} (${data.roll_number})`,
      created_at: new Date().toISOString(),
    });

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/bulk-import', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Students array is required' });
    }

    let imported = 0;
    let errors = [];

    for (const s of students) {
      try {
        await db.collection('students').add({
          photo_url: '',
          name: s.name,
          roll_number: s.roll_number,
          class: s.class,
          section: s.section || '',
          parent_name: s.parent_name || '',
          parent_phone: s.parent_phone || '',
          parent_email: s.parent_email || '',
          address: s.address || '',
          blood_group: '',
          transport_route: '',
          pen_number: s.pen_number || '',
          student_type: s.student_type || 'dayscholar',
          admission_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        imported++;
      } catch (e) {
        errors.push({ student: s.name, error: e.message });
      }
    }

    await db.collection('audit_logs').add({
      user_id: req.user.id,
      action: 'BULK_IMPORT_STUDENTS',
      entity_type: 'student',
      details: `Imported ${imported} students, ${errors.length} errors`,
      created_at: new Date().toISOString(),
    });

    res.json({ imported, errors });
  } catch (err) {
    console.error('Bulk import error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
