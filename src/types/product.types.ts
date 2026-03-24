export interface ProductDto {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  description?: string;
  specs?: unknown;
  condition?: string;
  warranty?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubcategoryDto {
  id: string;
  categoryId: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryOptionDto {
  id: string;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentOptionDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
