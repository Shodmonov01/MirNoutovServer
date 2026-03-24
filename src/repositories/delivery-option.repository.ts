import type { IDeliveryOption } from '../models/delivery-option.model';
import { DeliveryOptionModel } from '../models/delivery-option.model';

export const deliveryOptionRepository = {
  findAll: async (): Promise<IDeliveryOption[]> => {
    const rows = await DeliveryOptionModel.find().sort({ _id: 1 }).lean().exec();
    return rows as IDeliveryOption[];
  },

  findById: async (id: string): Promise<IDeliveryOption | null> => {
    const row = await DeliveryOptionModel.findById(id).lean().exec();
    return row as IDeliveryOption | null;
  },
};
