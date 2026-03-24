import type { IPaymentOption } from '../models/payment-option.model';
import { PaymentOptionModel } from '../models/payment-option.model';

export const paymentOptionRepository = {
  findAll: async (): Promise<IPaymentOption[]> => {
    const rows = await PaymentOptionModel.find().sort({ _id: 1 }).lean().exec();
    return rows as IPaymentOption[];
  },

  findById: async (id: string): Promise<IPaymentOption | null> => {
    const row = await PaymentOptionModel.findById(id).lean().exec();
    return row as IPaymentOption | null;
  },
};
