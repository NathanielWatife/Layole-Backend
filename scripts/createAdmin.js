#!/usr/bin/env node
require('dotenv').config();
const bcrypt = require('bcryptjs');
const validator = require('validator');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');
const readline = require('readline');
const mongoose = require('mongoose');

// Enhanced readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Improved question function with validation
async function question(prompt, validate = null) {
  while (true) {
    const answer = (await new Promise(resolve => {
      rl.question(prompt, resolve);
    })).trim();

    if (!validate || validate(answer)) {
      return answer;
    }
    console.log('Invalid input. Please try again.');
  }
}

// Secure password input
async function questionHidden(prompt) {
  const stdin = process.openStdin();
  let input = '';
  process.stdin.setRawMode(true);
  process.stdin.resume();

  return new Promise((resolve) => {
    const onData = (char) => {
      char = char.toString();
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':  // Ctrl-D
          process.stdin.setRawMode(false);
          process.stdin.removeListener('data', onData);
          console.log();
          resolve(input);
          break;
        case '\u0003':  // Ctrl-C
          process.stdin.setRawMode(false);
          process.stdin.removeListener('data', onData);
          console.log();
          process.exit();
          break;
        case '\b':  // Backspace
        case '\x7f':
          input = input.slice(0, -1);
          process.stdout.write('\x1B[2K\x1B[200D' + prompt + '*'.repeat(input.length));
          break;
        default:
          input += char;
          process.stdout.write('\x1B[2K\x1B[200D' + prompt + '*'.repeat(input.length));
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

    // Get admin details
    const username = await question('Username (3-30 chars): ', 
      input => input.length >= 3 && input.length <= 30);
    
    const email = await question('Email: ', 
      validator.isEmail);
    
    const firstName = await question('First Name: ', 
      input => input.length > 0);
    
    const lastName = await question('Last Name: ', 
      input => input.length > 0);
    
    const password = await questionHidden('Password (min 8 chars): ');
    const confirmPassword = await questionHidden('Confirm Password: ');
    
    const role = await question('Role (admin/super-admin/staff) [admin]: ', 
      input => !input || ['admin', 'super-admin', 'staff'].includes(input.toLowerCase())) || 'admin';

    // Validations
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ 
      $or: [{ username }, { email }] 
    });
    if (existingAdmin) {
      throw new Error('Admin with this username or email already exists');
    }

    // Create admin
    const admin = new Admin({
      username,
      email: email.toLowerCase(),
      firstName,
      lastName,
      password: await bcrypt.hash(password, 12),
      role: role.toLowerCase(),
      isActive: true,
      createdAt: new Date()
    });

    await admin.save();

    console.log('\n✅ Admin created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
    console.log(`ID: ${admin._id}`);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    rl.close();
  }
}

createAdmin();