import React from 'react';
import type { OrderStatus } from '@wapi/types';
import { Badge } from './Badge';
import type { BadgeProps } from './Badge';

const STATUS_MAP: Record<
  OrderStatus,
  { label: string; variant: BadgeProps['variant'] }
> = {
  pending:    { label: 'En attente',    variant: 'warning' },
  confirmed:  { label: 'Confirmé',      variant: 'info' },
  preparing:  { label: 'En préparation', variant: 'orange' },
  ready:      { label: 'Prêt',          variant: 'lime' },
  picking_up: { label: 'Récupération',  variant: 'lime' },
  on_the_way: { label: 'En livraison',  variant: 'info' },
  delivered:  { label: 'Livré',         variant: 'success' },
  cancelled:  { label: 'Annulé',        variant: 'error' },
};

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: BadgeProps['size'];
}

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const { label, variant } = STATUS_MAP[status];
  return <Badge label={label} variant={variant} size={size} />;
}
