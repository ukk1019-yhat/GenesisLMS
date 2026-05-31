const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const usersSnap = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (usersSnap.empty) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userDoc = usersSnap.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    await db.collection('audit_logs').add({
      user_id: user.id,
      action: 'LOGIN',
      entity_type: 'user',
      details: `User ${user.email} logged in`,
      created_at: new Date().toISOString(),
    });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.user.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = doc.data();
    res.json({ id: doc.id, name: user.name, email: user.email, role: user.role, phone: user.phone, created_at: user.created_at });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    updates.updated_at = new Date().toISOString();

    await db.collection('users').doc(req.user.id).update(updates);
    const doc = await db.collection('users').doc(req.user.id).get();
    const user = doc.data();
    res.json({ id: doc.id, name: user.name, email: user.email, role: user.role, phone: user.phone });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
