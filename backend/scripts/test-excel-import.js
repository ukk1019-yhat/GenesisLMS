const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function test() {
  console.log('--- EXCEL IMPORT TEST ---');

  // 1. Create a dummy Excel sheet
  const wb = XLSX.utils.book_new();
  const data = [
    {
      'photo': '',
      'Name': 'Kota kishvith ram',
      'Roll no': 2,
      'Pen no': '',
      'Class': 'UKG',
      'Father name': 'tejeswar rao',
      'Mother name': 'Rajeswari',
      'Phone': 6304110356,
      'blood group': '',
      'Actions': ''
    },
    {
      'photo': '',
      'Name': 'Routhu Jashvik',
      'Roll no': 4,
      'Pen no': 'PEN-444',
      'Class': 'UKG',
      'Father name': 'Barath',
      'Mother name': 'Vandana',
      'Phone': 8919409792,
      'blood group': 'B+',
      'Actions': ''
    }
  ];
  
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  
  const tempFilePath = path.join(__dirname, 'temp_test_students.xlsx');
  XLSX.writeFile(wb, tempFilePath);
  console.log('Created temporary Excel file.');

  try {
    // 2. Log in to get token
    console.log('Logging in to backend...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@school.com', password: 'admin123' })
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}: ${await loginRes.text()}`);
    }

    const { token } = await loginRes.json();
    console.log('Login successful. Token acquired.');

    // 3. Upload Excel file
    console.log('Uploading Excel file...');
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(tempFilePath);
    const fileBlob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    formData.append('file', fileBlob, 'temp_test_students.xlsx');

    const importRes = await fetch('http://localhost:5000/api/students/bulk-import-excel', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!importRes.ok) {
      throw new Error(`Import failed with status ${importRes.status}: ${await importRes.text()}`);
    }

    const result = await importRes.json();
    console.log('Import API Response:', result);

    if (result.imported !== 2 || result.errors.length > 0) {
      throw new Error(`Expected 2 imported records and 0 errors, got: ${JSON.stringify(result)}`);
    }
    console.log('Import request completed successfully!');

    // 4. Verify in the database
    console.log('Verifying records in students.json...');
    const studentsFile = path.join(__dirname, '../data/students.json');
    if (!fs.existsSync(studentsFile)) {
      throw new Error('students.json file not found!');
    }

    const students = JSON.parse(fs.readFileSync(studentsFile, 'utf8'));
    const kishvith = students.find(s => s.roll_number === '2');
    const jashvik = students.find(s => s.roll_number === '4');

    if (!kishvith) {
      throw new Error('Kota kishvith ram (Roll no: 2) was not created!');
    }
    console.log('Verified kishvith is created:', kishvith.name);
    console.log('Verified kishvith parent:', kishvith.parent_name);
    console.log('Verified kishvith phone:', kishvith.parent_phone);
    if (kishvith.parent_name !== 'Father: tejeswar rao, Mother: Rajeswari' || kishvith.parent_phone !== '6304110356') {
      throw new Error(`Kishvith fields did not match! Record: ${JSON.stringify(kishvith)}`);
    }

    if (!jashvik) {
      throw new Error('Routhu Jashvik (Roll no: 4) was not created!');
    }
    console.log('Verified jashvik is created:', jashvik.name);
    console.log('Verified jashvik PEN No:', jashvik.pen_number);
    console.log('Verified jashvik blood group:', jashvik.blood_group);
    if (jashvik.pen_number !== 'PEN-444' || jashvik.blood_group !== 'B+') {
      throw new Error(`Jashvik fields did not match! Record: ${JSON.stringify(jashvik)}`);
    }

    console.log('\nSUCCESS: Excel import verification passed!');
  } catch (err) {
    console.error('\nFAILURE:', err.message);
    process.exitCode = 1;
  } finally {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log('Cleaned up temporary Excel file.');
    }
  }
}

test();
