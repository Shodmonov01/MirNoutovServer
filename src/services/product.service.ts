import { ServiceError } from '../lib/service-error';
import { productRepository, type ProductFilters } from '../repositories/product.repository';

export const productService = {
  getAll: async (filters: ProductFilters) => {
    return productRepository.findAll(filters);
  },

  getById: async (id: string) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new ServiceError(404, 'Not found');
    }
    return product;
  },
};
