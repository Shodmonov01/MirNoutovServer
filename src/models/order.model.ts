import mongoose, { type Document, Schema, type Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  telegramId: string;
  phone: string;
  address: {
    district: string;
    street: string;
    apartment: string;
    floor: string;
  };
  deliveryId: string;
  paymentId: string;
  comments?: string;
  status: 'pending' | 'confirmed' | 'delivering' | 'done' | 'cancelled';
  total: number;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    telegramId: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      district: { type: String, required: true },
      street: { type: String, required: true },
      apartment: { type: String, required: true },
      floor: { type: String, required: true },
    },
    deliveryId: { type: String, required: true },
    paymentId: { type: String, required: true },
    comments: { type: String, required: false },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'delivering', 'done', 'cancelled'],
      default: 'pending',
    },
    total: { type: Number, required: true },
    items: { type: [orderItemSchema], required: true },
  },
  { timestamps: true, versionKey: false },
);

export const OrderModel = mongoose.model<IOrder>('Order', orderSchema);
