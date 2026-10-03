import { requestBackendEndpoint } from './eventPortalApi';

export type OrderCustomer = {
  name: string;
  email: string;
  phone: string;
};

export type OrderEvent = {
  type: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  guests: string;
  notes: string;
};

export type OrderDraft = {
  templateId: string;
  customer: OrderCustomer;
  event: OrderEvent;
};

export type CreatedOrder = {
  folio: string;
  status: string;
  amount: number;
  currency: string;
  checkoutUrl: string | null;
};

type CreateOrderResponse = {
  success: boolean;
  message?: string;
  order?: {
    folio: string;
    status: string;
    amount: number;
    currency: string;
  };
  checkout_url?: string | null;
};

/* Envia el registro (datos + fotos ya optimizadas) y devuelve el folio y, si el pago en linea esta activo, la URL de pago. */
export const createOrder = async (draft: OrderDraft, photos: Blob[]): Promise<CreatedOrder> => {
  const body = new FormData();
  body.append('order', JSON.stringify(draft));
  photos.forEach((photo, index) => {
    const extension = photo.type === 'image/png' ? 'png' : photo.type === 'image/webp' ? 'webp' : 'jpg';
    body.append('photos[]', photo, `foto-${index + 1}.${extension}`);
  });

  const response = await requestBackendEndpoint<CreateOrderResponse>('orders.php', { action: 'create' }, { method: 'POST', body });

  if (!response.success || !response.order) {
    throw new Error(response.message ?? 'No pudimos registrar tu evento.');
  }

  return {
    folio: response.order.folio,
    status: response.order.status,
    amount: response.order.amount,
    currency: response.order.currency,
    checkoutUrl: response.checkout_url ?? null
  };
};
