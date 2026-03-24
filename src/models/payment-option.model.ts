import mongoose, { Schema } from 'mongoose';

export interface IPaymentOption {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentOptionSchema = new Schema<IPaymentOption>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const PaymentOptionModel = mongoose.model<IPaymentOption>(
  'PaymentOption',
  paymentOptionSchema,
);
