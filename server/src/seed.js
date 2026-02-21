const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fleetflow';

const demoUsers = [
  { name: 'Fleet Manager',   email: 'manager@fleetflow.com',    password: 'manager123',    role: 'manager' },
  { name: 'Dispatcher',      email: 'dispatcher@fleetflow.com', password: 'dispatcher123', role: 'dispatcher' },
  { name: 'Safety Officer',  email: 'safety@fleetflow.com',     password: 'safety123',     role: 'safety_officer' },
  { name: 'Finance Analyst', email: 'analyst@fleetflow.com',    password: 'analyst123',    role: 'analyst' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (const u of demoUsers) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        // Update role and password if needed
        existing.name = u.name;
        existing.role = u.role;
        existing.password = u.password;
        await existing.save(); // triggers pre-save hash
        console.log(`Updated: ${u.email} (${u.role})`);
      } else {
        await User.create(u);
        console.log(`Created: ${u.email} (${u.role})`);
      }
    }

    console.log('\nDemo accounts ready:');
    demoUsers.forEach(u => console.log(`  ${u.role.padEnd(16)} => ${u.email} / ${u.password}`));

    await mongoose.disconnect();
    console.log('\nDone.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
