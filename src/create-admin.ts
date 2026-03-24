import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { loadConfig } from './config';
import { AdminModel } from './models/admin.model';

const main = async (): Promise<void> => {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error('Usage: npx tsx src/create-admin.ts <email> <password>');
    process.exit(1);
  }
  const config = loadConfig();
  await mongoose.connect(config.MONGODB_URI);
  const existing = await AdminModel.findOne({ email }).lean().exec();
  if (existing) {
    console.error('Email already in use');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  await AdminModel.create({ email, password: hash });
  console.log(`Админ создан: ${email}`);
  await mongoose.disconnect();
};

void main();
