import { Schema, model, Document } from 'mongoose';
import type { Restaurant, RestaurantCategory, OpeningHour } from '@wapi/types';

export interface RestaurantDocument extends Omit<Restaurant, '_id' | 'owner'>, Document {
  owner: Schema.Types.ObjectId;
}

const openingHourSchema = new Schema<OpeningHour>(
  {
    day: { type: Number, enum: [0, 1, 2, 3, 4, 5, 6], required: true },
    open: { type: String, required: true },
    close: { type: String, required: true },
  },
  { _id: false }
);

const restaurantSchema = new Schema<RestaurantDocument>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    category: {
      type: String,
      enum: ['food', 'grocery', 'pharmacy', 'other'] as RestaurantCategory[],
      required: true,
    },
    address: {
      label: { type: String, required: true },
      coords: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
      quartier: { type: String, required: true },
    },
    openingHours: { type: [openingHourSchema], default: [] },
    isOpen: { type: Boolean, default: false },
    deliveryRadius: { type: Number, default: 5 },
    minOrderAmount: { type: Number, default: 0 },
    estimatedPrepTime: { type: Number, default: 30 },
    rating: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index géospatial pour les recherches par proximité
restaurantSchema.index({ 'address.coords': '2dsphere' });

export const RestaurantModel = model<RestaurantDocument>('Restaurant', restaurantSchema);
