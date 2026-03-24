import mongoose from 'mongoose';
import { loadConfig } from './config';
import { CategoryModel } from './models/category.model';
import { SubcategoryModel } from './models/subcategory.model';
import { DeliveryOptionModel } from './models/delivery-option.model';
import { PaymentOptionModel } from './models/payment-option.model';

const main = async (): Promise<void> => {
  const config = loadConfig();
  await mongoose.connect(config.MONGODB_URI);

  const delivery = await DeliveryOptionModel.bulkWrite([
    {
      updateOne: {
        filter: { _id: 'courier' },
        update: { $set: { name: 'Курьер', price: 20000 } },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: { _id: 'pickup' },
        update: { $set: { name: 'Самовывоз', price: 0 } },
        upsert: true,
      },
    },
  ]);
  console.log('DeliveryOption upsert:', delivery);

  const payment = await PaymentOptionModel.bulkWrite([
    {
      updateOne: {
        filter: { _id: 'cash' },
        update: { $set: { name: 'Наличные' } },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: { _id: 'payme' },
        update: { $set: { name: 'Payme' } },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: { _id: 'click' },
        update: { $set: { name: 'Click' } },
        upsert: true,
      },
    },
  ]);
  console.log('PaymentOption upsert:', payment);

  const categoryNames = ['Ноутбуки', 'Мониторы', 'Комплектующие', 'Аксессуары'];
  const image = 'https://placehold.co/400x300';
  for (const name of categoryNames) {
    const res = await CategoryModel.findOneAndUpdate(
      { name },
      { $set: { image } },
      { upsert: true, new: true },
    ).lean();
    console.log('Category upsert:', name, res?._id);
  }

  const laptops = await CategoryModel.findOne({ name: 'Ноутбуки' }).lean();
  if (laptops?._id) {
    const subNames = ['Игровые', 'Офисные', 'Ультрабуки', 'Для учёбы'];
    for (const name of subNames) {
      const sub = await SubcategoryModel.findOneAndUpdate(
        { categoryId: laptops._id, name },
        { $set: { image } },
        { upsert: true, new: true },
      ).lean();
      console.log('Subcategory upsert (Ноутбуки):', name, sub?._id);
    }
  }

  await mongoose.disconnect();
};

void main();
