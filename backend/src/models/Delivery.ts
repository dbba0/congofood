import { Schema, model, Document } from 'mongoose';
import type { Delivery, DeliveryStatus } from '@congofood/types';

export interface DeliveryDocument extends Omit<Delivery, '_id' | 'order' | 'livreur'>, Document {
  order: Schema.Types.ObjectId;
  livreur: Schema.Types.ObjectId;
}

const deliverySchema = new Schema<DeliveryDocument>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    livreur: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['assigned', 'picking_up', 'delivering', 'completed'] as DeliveryStatus[],
      default: 'assigned',
    },
    currentLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      updatedAt: { type: Date, default: Date.now },
    },
    distanceKm: { type: Number, default: 0 },
    earningsAmount: { type: Number, default: 0 },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

export const DeliveryModel = model<DeliveryDocument>('Delivery', deliverySchema);
