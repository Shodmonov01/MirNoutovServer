import { Types } from 'mongoose';
import { OrderModel } from '../models/order.model';

export interface OrderCreateInput {
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
  status?: 'pending' | 'confirmed' | 'delivering' | 'done' | 'cancelled';
  total: number;
  items: {
    productId: Types.ObjectId;
    title: string;
    price: number;
    quantity: number;
  }[];
}

export interface OrderFilters {
  status?: string;
}

export const orderRepository = {
  create: async (data: OrderCreateInput) => {
    return OrderModel.create(data);
  },

  findAll: async (filters: OrderFilters) => {
    const q: Record<string, unknown> = {};
    if (filters.status) {
      q.status = filters.status;
    }
    return OrderModel.find(q).sort({ createdAt: -1 }).lean().exec();
  },

  findById: async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return OrderModel.findById(id).lean().exec();
  },

  updateStatus: async (id: string, status: string) => {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return OrderModel.findByIdAndUpdate(id, { status }, { new: true }).lean().exec();
  },
};
