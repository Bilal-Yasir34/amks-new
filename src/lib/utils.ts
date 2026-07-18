export function formatPrice(price: number, currency = 'PKR'): string {
  const symbol = currency === 'PKR' ? 'Rs.' : currency;
  return `${symbol} ${price.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateOrderNumber(): string {
  const date = new Date();
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `AMKS-${ymd}-${random}`;
}

export function getEffectivePrice(regular: number, sale: number | null): number {
  return sale !== null && sale !== undefined && sale < regular ? sale : regular;
}

export function getDiscountPercent(regular: number, sale: number | null): number {
  if (!sale || sale >= regular) return 0;
  return Math.round(((regular - sale) / regular) * 100);
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
