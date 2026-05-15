import type { Currency } from './product';

export type PaymentMethod =
  | 'airtel_money'
  | 'orange_money'
  | 'mpesa'
  | 'cash';

export type PaymentStatusValue =
  | 'initiated'  // Paiement initié côté CongoFood
  | 'pending'    // En attente de confirmation du provider
  | 'success'    // Confirmé
  | 'failed';    // Échec

export interface Payment {
  _id: string;
  order: string;
  user: string;
  method: PaymentMethod;
  /** Nom du provider (ex: 'cinetpay') */
  provider: string;
  /** Identifiant de transaction côté provider */
  providerTxId?: string;
  amount: number;
  currency: Currency;
  status: PaymentStatusValue;
  /** Métadonnées brutes retournées par le provider */
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}
