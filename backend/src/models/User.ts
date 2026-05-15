import { Schema, model, Document } from 'mongoose';
import type { User, UserRole, UserAddress } from '@congofood/types';

/** Password non présent dans le type public User — ajouté uniquement côté Mongoose */
export interface UserDocument extends Omit<User, '_id'>, Document {
  password?: string;
}

const userAddressSchema = new Schema<UserAddress>(
  {
    label: { type: String, required: true },
    coords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    quartier: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<UserDocument>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      // Format attendu : +243XXXXXXXXX (numéros congolais)
      match: /^\+243[0-9]{9}$/,
    },
    email: { type: String, sparse: true, unique: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['client', 'restaurant', 'livreur', 'admin'] as UserRole[],
      default: 'client',
    },
    address: { type: userAddressSchema, required: false },
    deviceToken: { type: String },
    isVerified: { type: Boolean, default: false },
    // Stocké hashé avec bcrypt — jamais renvoyé dans les réponses API
    password: { type: String, select: false },
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>('User', userSchema);
