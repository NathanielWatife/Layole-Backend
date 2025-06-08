#!/usr/bin/env node
require('dotenv').config();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');
const readline = require('readline');
const mongoose = require('mongoose');

// Create a more reliable readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Standard question function
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Password input with asterisks
function questionHidden(prompt) {
  return new Promise((resolve) => {
    const stdin = process.openStdin();
    let input = '';
    process.stdin.setRawMode(true);
    process.stdin.resume();

    const onData = (char) => {
      char = char.toString();
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':  // Ctrl-D
          process.stdin.setRawMode(false);
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(input);
          break;
        case '\u0003':  // Ctrl-C
          process.stdin.setRawMode(false);
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          process.exit();
          break;
        default:
          process.stdout.write('\x1B[2K\x1B[200D' + prompt + '*'.repeat(input.length + 1));
          input += char;
          break;
      }
    };

    process.stdin.on('data', onData);
    process.stdout.write(prompt);
  });
}

async function createAdmin() {
  try {
    await connectDB();
    console.log('\n=== Admin Account Creation ===\n');

    // Get all inputs
    const username = await question('Username (3-30 chars): ');
    const email = await question('Email: ');
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    const password = await questionHidden('Password (min 8 chars): ');
    const confirmPassword = await questionHidden('Confirm Password: ');
    const role = await question('Role (admin/super-admin/staff): ');

    // Validations
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    if (!['admin', 'super-admin', 'staff'].includes(role.toLowerCase())) {
      throw new Error('Invalid role. Use admin/super-admin/staff');
    }

    // Create and save admin
    const admin = new Admin({
      username,
      email: email.toLowerCase(),
      firstName,
      lastName,
      password: await bcrypt.hash(password, 12),
      role: role.toLowerCase(),
      isActive: true
    });

    await admin.save();

    console.log('\n✅ Admin created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    rl.close();
    process.exit(0);
  }
}

createAdmin();