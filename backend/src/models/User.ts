import { Schema, model, Document } from 'mongoose';
import type { User, UserRole, UserAddress } from '@wapi/types';

/** Champs internes uniquement côté serveur, absents du type public User */
export interface UserDocument extends Omit<User, '_id'>, Document {
  password?: string;
  refreshToken?: string;   // stocké hashé SHA-256
  lastLoginAt?: Date;
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
    name: { type: String, default: '', trim: true },
    role: {
      type: String,
      enum: ['client', 'restaurant', 'livreur', 'admin'] as UserRole[],
      default: 'client',
    },
    address: { type: userAddressSchema, required: false },
    deviceToken: { type: String },
    isVerified: { type: Boolean, default: false },
    // Champs serveur — jamais renvoyés dans les réponses API
    password: { type: String, select: false },
    refreshToken: { type: String, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>('User', userSchema);
