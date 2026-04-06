import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Staff from './models/Staff.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    return seedData();
  })
  .then(() => {
    console.log('Seeding complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });

async function seedData() {
  const defaultStaff = [
    { username: 'admin', password: 'admin123', role: 'Admin' },
    { username: 'rider', password: 'rider123', role: 'Rider' }
  ];

  for (const s of defaultStaff) {
    const exists = await Staff.findOne({ username: s.username });
    if (!exists) {
      await Staff.create(s);
      console.log(`Created ${s.role}: ${s.username}`);
    } else {
      console.log(`${s.role} '${s.username}' already exists, skipping.`);
    }
  }
}
