export const buildOrderTrackingPath = (
  orderId: string,
  guestEmail?: string,
): string =>
  guestEmail
    ? `/order/${orderId}?email=${encodeURIComponent(guestEmail)}`
    : `/order/${orderId}`;
