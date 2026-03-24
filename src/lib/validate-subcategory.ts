import { ServiceError } from './service-error';
import { subcategoryRepository } from '../repositories/subcategory.repository';

export const assertSubcategoryBelongsToCategory = async (
  categoryId: string,
  subcategoryId: string | null | undefined,
): Promise<void> => {
  if (subcategoryId === undefined || subcategoryId === null) {
    return;
  }
  const sub = await subcategoryRepository.findById(subcategoryId);
  if (!sub) {
    throw new ServiceError(400, 'Subcategory not found');
  }
  if (String(sub.categoryId) !== categoryId) {
    throw new ServiceError(400, 'Subcategory does not belong to category');
  }
};
