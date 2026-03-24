export interface OrderAddressDto {
  district: string;
  street: string;
  apartment: string;
  floor: string;
}

export interface OrderItemDto {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface OrderDto {
  id: string;
  telegramId: string;
  phone: string;
  address: OrderAddressDto;
  deliveryId: string;
  paymentId: string;
  comments?: string;
  status: string;
  total: number;
  items: OrderItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderCreateResponseDto {
  id: string;
  status: string;
  total: number;
  createdAt: string;
}
