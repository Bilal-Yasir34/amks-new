import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '../types';
import { formatPrice, getEffectivePrice, getDiscountPercent } from '../lib/utils';
import { useCartStore } from '../store/cart';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const price = getEffectivePrice(product.regular_price, product.sale_price);
  const discount = getDiscountPercent(product.regular_price, product.sale_price);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.has_variants) {
      window.location.href = `/product/${product.slug}`;
      return;
    }
    if (product.stock_quantity <= 0) {
      toast.error('This product is out of stock.');
      return;
    }
    addItem({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price,
      regular_price: product.regular_price,
      image_url: product.featured_image || '',
      quantity: 1,
      variant_combination_id: null,
      variant_description: null,
      sku: product.sku,
      stock: product.stock_quantity,
    });
    toast.success('Added to cart!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        <div className="relative overflow-hidden bg-ink-50 aspect-[3/4] mb-4">
          <img
            src={product.featured_image || ''}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-ink-900 text-white text-[10px] tracking-widest uppercase px-2 py-1">
              {discount}% Off
            </span>
          )}
          {product.stock_quantity <= 0 && (
            <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] tracking-widest uppercase px-2 py-1">
              Sold Out
            </span>
          )}
          <motion.button
            onClick={handleQuickAdd}
            className="absolute bottom-0 left-0 right-0 bg-ink-900 text-white py-3 text-xs tracking-widest uppercase flex items-center justify-center gap-2 opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-luxury"
          >
            <ShoppingBag className="w-4 h-4" />
            {product.has_variants ? 'View Options' : 'Quick Add'}
          </motion.button>
        </div>
        <div className="text-center">
          {product.category && (
            <p className="text-[10px] tracking-widest uppercase text-ink-400 mb-1">{product.category.name}</p>
          )}
          <h3 className="text-sm font-medium text-ink-900 group-hover:text-ink-500 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="mt-1 flex items-center justify-center gap-2">
            {product.sale_price && product.sale_price < product.regular_price && (
              <span className="text-xs text-ink-300 line-through">{formatPrice(product.regular_price)}</span>
            )}
            <span className="text-sm font-medium">{formatPrice(price)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
