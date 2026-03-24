import type { Types } from 'mongoose';
import type { SubcategoryLean } from '../repositories/subcategory.repository';
import type {
  CategoryDto,
  DeliveryOptionDto,
  PaymentOptionDto,
  ProductDto,
  SubcategoryDto,
} from '../types/product.types';
import type { OrderDto, OrderItemDto } from '../types/order.types';

interface LeanCategory {
  _id: Types.ObjectId;
  name: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LeanProduct {
  _id: Types.ObjectId;
  categoryId: Types.ObjectId;
  subcategoryId?: Types.ObjectId;
  title: string;
  price: number;
  currency: string;
  image: string;
  description?: string;
  specs?: unknown;
  condition?: string;
  warranty?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LeanDelivery {
  _id: string;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

interface LeanPayment {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LeanOrderItem {
  productId: Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
}

interface LeanOrder {
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
  status: string;
  total: number;
  items: LeanOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export const mapCategoryToDto = (doc: LeanCategory): CategoryDto => ({
  id: String(doc._id),
  name: doc.name,
  image: doc.image,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

export const mapSubcategoryToDto = (doc: SubcategoryLean): SubcategoryDto => ({
  id: String(doc._id),
  categoryId: String(doc.categoryId),
  name: doc.name,
  image: doc.image,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

export const mapProductToDto = (doc: LeanProduct): ProductDto => ({
  id: String(doc._id),
  categoryId: String(doc.categoryId),
  ...(doc.subcategoryId
    ? { subcategoryId: String(doc.subcategoryId) }
    : {}),
  title: doc.title,
  price: doc.price,
  currency: doc.currency,
  image: doc.image,
  description: doc.description,
  specs: doc.specs,
  condition: doc.condition,
  warranty: doc.warranty,
  location: doc.location,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

export const mapDeliveryToDto = (doc: LeanDelivery): DeliveryOptionDto => ({
  id: doc._id,
  name: doc.name,
  price: doc.price,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

export const mapPaymentToDto = (doc: LeanPayment): PaymentOptionDto => ({
  id: doc._id,
  name: doc.name,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

export const mapOrderItemToDto = (item: LeanOrderItem): OrderItemDto => ({
  productId: String(item.productId),
  title: item.title,
  price: item.price,
  quantity: item.quantity,
});

export const mapOrderToDto = (doc: LeanOrder): OrderDto => ({
  id: String(doc._id),
  telegramId: doc.telegramId,
  phone: doc.phone,
  address: doc.address,
  deliveryId: doc.deliveryId,
  paymentId: doc.paymentId,
  comments: doc.comments,
  status: doc.status,
  total: doc.total,
  items: doc.items.map(mapOrderItemToDto),
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});
