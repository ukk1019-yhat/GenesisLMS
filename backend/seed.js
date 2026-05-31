const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seed() {
  console.log('Seeding Firestore...');

  // Seed users
  const users = [
    { name: 'School Admin', email: 'admin@school.com', password: await bcrypt.hash('admin123', 10), role: 'admin', phone: '9876543210' },
    { name: 'John Teacher', email: 'teacher@school.com', password: await bcrypt.hash('admin123', 10), role: 'teacher', phone: '9876543211' },
    { name: 'Jane Accountant', email: 'accountant@school.com', password: await bcrypt.hash('admin123', 10), role: 'accountant', phone: '9876543212' },
  ];

  for (const u of users) {
    const existing = await db.collection('users').where('email', '==', u.email).limit(1).get();
    if (existing.empty) {
      await db.collection('users').add({
        ...u,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      console.log(`Created user: ${u.email}`);
    } else {
      console.log(`User already exists: ${u.email}`);
    }
  }

  // Seed some sample students
  const sampleStudents = [
    { name: 'Aarav Sharma', roll_number: 'S001', class: 'Class 10', section: 'A', parent_name: 'Rahul Sharma', parent_phone: '9876500001', parent_email: 'rahul@example.com', address: '123 Main St, City', blood_group: 'O+' },
    { name: 'Priya Patel', roll_number: 'S002', class: 'Class 10', section: 'A', parent_name: 'Anita Patel', parent_phone: '9876500002', parent_email: 'anita@example.com', address: '456 Oak Ave, City', blood_group: 'A+' },
    { name: 'Rohit Singh', roll_number: 'S003', class: 'Class 9', section: 'B', parent_name: 'Vikram Singh', parent_phone: '9876500003', parent_email: 'vikram@example.com', address: '789 Pine Rd, City', blood_group: 'B+' },
    { name: 'Sneha Gupta', roll_number: 'S004', class: 'Class 9', section: 'A', parent_name: 'Neha Gupta', parent_phone: '9876500004', parent_email: 'neha@example.com', address: '321 Elm St, City', blood_group: 'AB+' },
    { name: 'Arjun Kumar', roll_number: 'S005', class: 'Class 8', section: 'A', parent_name: 'Sunil Kumar', parent_phone: '9876500005', parent_email: 'sunil@example.com', address: '654 Birch Ln, City', blood_group: 'O-' },
  ];

  for (const s of sampleStudents) {
    const existing = await db.collection('students').where('roll_number', '==', s.roll_number).limit(1).get();
    if (existing.empty) {
      const ref = await db.collection('students').add({
        ...s,
        photo_url: '',
        transport_route: '',
        admission_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Add sample fee records for each student
      const months = ['January', 'February', 'March'];
      for (const month of months) {
        await db.collection('fees').add({
          student_id: ref.id,
          total_fee: 5000,
          paid_fee: month === 'March' ? 3000 : 5000,
          due_date: new Date(2024, months.indexOf(month), 10).toISOString().split('T')[0],
          payment_date: month !== 'March' ? new Date(2024, months.indexOf(month), 5).toISOString() : '',
          status: month === 'March' ? 'partial' : 'paid',
          month,
          year: 2024,
          receipt_number: `RCP-${ref.id}-${month}`,
          created_at: new Date().toISOString(),
        });
      }

      // Add sample marks
      const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies'];
      for (const subject of subjects) {
        const obtained = Math.floor(Math.random() * 30) + 60;
        await db.collection('marks').add({
          student_id: ref.id,
          subject,
          exam_name: 'Mid Term 2024',
          marks_obtained: obtained,
          total_marks: 100,
          grade: obtained >= 90 ? 'A+' : obtained >= 80 ? 'A' : obtained >= 70 ? 'B+' : obtained >= 60 ? 'B' : 'C',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Add sample attendance
      for (let d = 1; d <= 20; d++) {
        const date = `2024-03-${String(d).padStart(2, '0')}`;
        const status = d % 7 === 0 ? 'absent' : d % 5 === 0 ? 'late' : 'present';
        await db.collection('attendance').add({
          student_id: ref.id,
          date,
          status,
          remarks: '',
          created_at: new Date().toISOString(),
        });
      }

      console.log(`Created student: ${s.name} (${s.roll_number}) with fees, marks, attendance`);
    } else {
      console.log(`Student already exists: ${s.roll_number}`);
    }
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
