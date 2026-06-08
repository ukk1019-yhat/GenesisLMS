const XLSX = require('xlsx');
const fs = require('fs');

async function test() {
  console.log('--- EXCEL EXPORT TEST ---');

  try {
    // 1. Submit an inquiry (public endpoint)
    console.log('Submitting a new inquiry...');
    const inquiryData = {
      name: 'Excel Export Tester',
      phone: '9999999999',
      email: 'tester@export.com',
      class: 'Class 5',
      message: 'This is a test inquiry for Excel export verification.'
    };

    const submitRes = await fetch('http://localhost:5000/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData)
    });

    if (!submitRes.ok) {
      throw new Error(`Inquiry submission failed with status ${submitRes.status}: ${await submitRes.text()}`);
    }
    console.log('Inquiry submitted successfully.');

    // 2. Log in as admin
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

    // 3. Request Excel export
    console.log('Requesting inquiries export...');
    const exportRes = await fetch('http://localhost:5000/api/inquiries/export', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!exportRes.ok) {
      throw new Error(`Export failed with status ${exportRes.status}: ${await exportRes.text()}`);
    }

    const contentType = exportRes.headers.get('content-type');
    console.log('Export Content-Type:', contentType);
    if (!contentType.includes('spreadsheetml')) {
      throw new Error(`Expected Excel content type, got: ${contentType}`);
    }

    const arrayBuffer = await exportRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`Received Excel sheet buffer: ${buffer.length} bytes.`);

    // 4. Parse buffer and verify content
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);

    console.log(`Excel sheet parsed. Total rows found: ${rows.length}`);

    const testInquiryRow = rows.find(r => r.Name === 'Excel Export Tester');
    if (!testInquiryRow) {
      throw new Error('Could not find the test inquiry in the exported Excel sheet!');
    }

    console.log('Verified exported inquiry details:');
    console.log(`- Name: ${testInquiryRow.Name}`);
    console.log(`- Phone: ${testInquiryRow.Phone}`);
    console.log(`- Class: ${testInquiryRow.Class}`);
    console.log(`- Message: ${testInquiryRow.Message}`);

    console.log('\nSUCCESS: Excel export verification passed!');
  } catch (err) {
    console.error('\nFAILURE:', err.message);
    process.exitCode = 1;
  }
}

test();
