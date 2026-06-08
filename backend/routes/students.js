const express = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const XLSX = require('xlsx');

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

router.post('/bulk-import-excel', authenticate, authorize('admin'), (req, res) => {
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');

  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const useDisk = !process.env.VERCEL;
  const storage = useDisk
    ? multer.diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => cb(null, `${Date.now()}-import.xlsx`),
      })
    : multer.memoryStorage();

  const excelUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (['.xlsx', '.xls'].includes(ext)) cb(null, true);
      else cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    },
  });

  excelUpload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    try {
      let wb;
      if (useDisk) {
        wb = XLSX.readFile(req.file.path);
        fs.unlink(req.file.path, () => {});
      } else {
        wb = XLSX.read(req.file.buffer, { type: 'buffer' });
      }

      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      // Key normalization helper (e.g. "Roll no" -> "rollno", "Father name" -> "fathername")
      const normalizeKey = (key) => key.toLowerCase().replace(/[^a-z0-9]/g, '');

      let imported = 0, errors = [];
      for (const row of rows) {
        try {
          const normRow = {};
          for (const k of Object.keys(row)) {
            normRow[normalizeKey(k)] = row[k];
          }

          const name = String(
            normRow.studentname !== undefined ? normRow.studentname :
            (normRow.fullname !== undefined ? normRow.fullname :
            (normRow.name || ''))
          ).trim();
          const roll_number = String(
            normRow.rollno !== undefined ? normRow.rollno :
            (normRow.rollnumber !== undefined ? normRow.rollnumber :
            (normRow.roll !== undefined ? normRow.roll : ''))
          ).trim();
          const cls = String(
            normRow.class !== undefined ? normRow.class :
            (normRow.grade !== undefined ? normRow.grade : '')
          ).trim();

          if (!name || !roll_number || !cls) {
            errors.push({ row: name || 'unknown', error: 'Name, Roll Number (Roll no/Roll Number/Roll), and Class are required' });
            continue;
          }

          let parent_name = '';
          if (normRow.fathername && normRow.mothername) {
            parent_name = `Father: ${normRow.fathername}, Mother: ${normRow.mothername}`;
          } else {
            parent_name = String(normRow.fathername || normRow.mothername || normRow.parentname || normRow.parent || '').trim();
          }

          const studentData = {
            photo_url: String(normRow.photo || normRow.photourl || normRow.image || '').trim(),
            name,
            roll_number,
            class: cls,
            section: String(normRow.section || '').trim(),
            parent_name,
            parent_phone: String(normRow.phone || normRow.parentphone || normRow.mobile || normRow.parentmobile || '').trim(),
            parent_email: String(normRow.parentemail || normRow.email || '').trim(),
            address: String(normRow.address || '').trim(),
            blood_group: String(normRow.bloodgroup || normRow.bg || '').trim(),
            transport_route: String(normRow.transportroute || normRow.route || '').trim(),
            pen_number: String(normRow.penno || normRow.pen || normRow.pennumber || '').trim(),
            student_type: String(normRow.studenttype || normRow.type || 'dayscholar').trim().toLowerCase().replace(/[^a-z]/g, ''),
            admission_date: normRow.admissiondate || new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          };

          const existing = await db.collection('students')
            .where('roll_number', '==', roll_number)
            .limit(1)
            .get();

          if (!existing.empty) {
            const docId = existing.docs[0].id;
            await db.collection('students').doc(docId).update(studentData);
          } else {
            await db.collection('students').add({
              ...studentData,
              created_at: new Date().toISOString(),
            });
          }
          imported++;
        } catch (e) {
          errors.push({ row: row.Name || row.name || 'unknown', error: e.message });
        }
      }

      await db.collection('audit_logs').add({
        user_id: req.user.id,
        action: 'BULK_IMPORT_EXCEL',
        entity_type: 'student',
        details: `Imported ${imported} students from Excel, ${errors.length} errors`,
        created_at: new Date().toISOString(),
      });

      res.json({ imported, errors });
    } catch (e) {
      res.status(500).json({ error: 'Error processing Excel file' });
    }
  });
});

module.exports = router;
