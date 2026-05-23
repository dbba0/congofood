import { Schema, model, Document } from 'mongoose';
import type { Order, OrderStatus, PaymentStatus, Currency } from '@wapi/types';

export interface OrderDocument extends Omit<Order, '_id' | 'client' | 'restaurant' | 'livreur'>, Document {
  client: Schema.Types.ObjectId;
  restaurant: Schema.Types.ObjectId;
  livreur?: Schema.Types.ObjectId;
}

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    selectedOptions: [
      {
        optionName: String,
        choiceLabel: String,
        priceDelta: Number,
        _id: false,
      },
    ],
  },
  { _id: false }
);

const timelineSchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        'pending', 'confirmed', 'preparing', 'ready',
        'picking_up', 'on_the_way', 'delivered', 'cancelled',
      ] as OrderStatus[],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    livreur: { type: Schema.Types.ObjectId, ref: 'User' },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: {
      type: String,
      enum: ['CDF', 'USD'] as Currency[],
      default: 'CDF',
    },
    status: {
      type: String,
      enum: [
        'pending', 'confirmed', 'preparing', 'ready',
        'picking_up', 'on_the_way', 'delivered', 'cancelled',
      ] as OrderStatus[],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'] as PaymentStatus[],
      default: 'pending',
    },
    deliveryAddress: {
      label: { type: String, required: true },
      coords: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
      instructions: { type: String },
    },
    timeline: { type: [timelineSchema], default: [] },
    estimatedDelivery: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const OrderModel = model<OrderDocument>('Order', orderSchema);
