import { Schema, model, Document } from 'mongoose';
import type { Product, Currency, ProductOption } from '@wapi/types';

export interface ProductDocument extends Omit<Product, '_id' | 'restaurant'>, Document {
  restaurant: Schema.Types.ObjectId;
}

const productOptionSchema = new Schema<ProductOption>(
  {
    name: { type: String, required: true },
    choices: [
      {
        label: { type: String, required: true },
        priceDelta: { type: Number, default: 0 },
        _id: false,
      },
    ],
  },
  { _id: false }
);

const productSchema = new Schema<ProductDocument>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      enum: ['CDF', 'USD'] as Currency[],
      default: 'CDF',
    },
    category: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    options: { type: [productOptionSchema], default: [] },
  },
  { timestamps: true }
);

export const ProductModel = model<ProductDocument>('Product', productSchema);
