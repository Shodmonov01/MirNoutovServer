import mongoose, { Schema } from 'mongoose';

export interface IDeliveryOption {
  _id: string;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryOptionSchema = new Schema<IDeliveryOption>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const DeliveryOptionModel = mongoose.model<IDeliveryOption>(
  'DeliveryOption',
  deliveryOptionSchema,
);
