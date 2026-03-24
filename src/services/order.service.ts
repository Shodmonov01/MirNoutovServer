import { Types } from 'mongoose';
import { ServiceError } from '../lib/service-error';
import { deliveryOptionRepository } from '../repositories/delivery-option.repository';
import { orderRepository } from '../repositories/order.repository';
import { paymentOptionRepository } from '../repositories/payment-option.repository';
import { productRepository } from '../repositories/product.repository';

export interface CreateOrderInput {
  items: { productId: string; quantity: number }[];
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
}

export const orderService = {
  create: async (data: CreateOrderInput, telegramUserId: number) => {
    const productIds = data.items.map((i) => i.productId);
    const uniqueIds = [...new Set(productIds)];
    const products = await productRepository.findByIds(uniqueIds);
    if (products.length !== uniqueIds.length) {
      throw new ServiceError(400, 'One or more products not found');
    }
    const byId = new Map(products.map((p) => [String(p._id), p]));
    const delivery = await deliveryOptionRepository.findById(data.deliveryId);
    if (!delivery) {
      throw new ServiceError(400, 'Invalid delivery option');
    }
    const payment = await paymentOptionRepository.findById(data.paymentId);
    if (!payment) {
      throw new ServiceError(400, 'Invalid payment option');
    }
    let subtotal = 0;
    const items = data.items.map((item) => {
      const p = byId.get(item.productId);
      if (!p) {
        throw new ServiceError(400, 'One or more products not found');
      }
      subtotal += p.price * item.quantity;
      return {
        productId: p._id as Types.ObjectId,
        title: p.title,
        price: p.price,
        quantity: item.quantity,
      };
    });
    const total = subtotal + delivery.price;
    const order = await orderRepository.create({
      telegramId: String(telegramUserId),
      phone: data.phone,
      address: data.address,
      deliveryId: data.deliveryId,
      paymentId: data.paymentId,
      comments: data.comments,
      total,
      items,
    });
    return {
      id: String(order._id),
      status: order.status,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
    };
  },
};
