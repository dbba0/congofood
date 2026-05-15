import { Schema, model, Document } from 'mongoose';
import type { Payment, PaymentMethod, PaymentStatusValue, Currency } from '@congofood/types';

export interface PaymentDocument extends Omit<Payment, '_id' | 'order' | 'user'>, Document {
  order: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    method: {
      type: String,
      enum: ['airtel_money', 'orange_money', 'mpesa', 'cash'] as PaymentMethod[],
      required: true,
    },
    provider: { type: String, required: true },
    providerTxId: { type: String, sparse: true },
    amount: { type: Number, required: true },
    currency: {
      type: String,
      enum: ['CDF', 'USD'] as Currency[],
      default: 'CDF',
    },
    status: {
      type: String,
      enum: ['initiated', 'pending', 'success', 'failed'] as PaymentStatusValue[],
      default: 'initiated',
    },
    // Schema flexible pour stocker les webhooks bruts des providers
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const PaymentModel = model<PaymentDocument>('Payment', paymentSchema);
