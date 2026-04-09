import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/contexts/StoreContext';
import { useStore } from '@/contexts/StoreContext';

type Props = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
};

const CountdownStars = ({ rating, count }: { rating: number; count: number }) => {
  const rounded = Math.round(rating);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          style={{ fill: i <= rounded ? '#fbbf24' : 'none', color: '#fbbf24' }}
        />
      ))}
      <span style={{ fontWeight: 800, fontSize: 13 }}>{rating.toFixed(1)}</span>
      <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>({count})</span>
    </div>
  );
};

const ProductQuickViewModal = ({ open, product, onClose }: Props) => {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImg, setSelectedImg] = useState(0);

  const reviews = product?.reviews || [];
  const avgRating = useMemo(() => {
    if (!reviews.length) return null;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  const variants = product?.variants || [];
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);

  const defaultSize = useMemo(() => {
    if (!variants.length) return '';
    const inStock = variants.find((v) => v.stock > 0);
    if (inStock) return inStock.size;
    return product?.preorder ? variants[0].size : '';
  }, [variants]);

  useEffect(() => {
    if (!open || !product) return;
    setSelectedImg(0);
    setSelectedSize(defaultSize);
  }, [open, product?.id, defaultSize]);

  if (!open || !product) return null;

  const canAdd = Boolean(selectedSize) && (totalStock > 0 || Boolean(product.preorder));
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 980,
          maxHeight: '90vh',
          overflow: 'auto',
          borderRadius: 20,
          background: 'hsl(0 0% 10%)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 12, background: 'rgba(255,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 900, color: '#ff0000' }}>YT</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, color: '#f1f5f9', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.name}
              </div>
              <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{product.series}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => toggleWishlist(product.id)}
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.1)',
                background: isWishlisted ? 'rgba(255,0,0,0.12)' : 'transparent',
                color: isWishlisted ? '#ff0000' : 'hsl(var(--muted-foreground))',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Toggle wishlist"
            >
              <Heart size={18} fill={isWishlisted ? '#ff0000' : 'none'} />
            </button>
            <button
              onClick={onClose}
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: 'hsl(var(--muted-foreground))',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 18 }}>
          <div>
            <div
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                background: 'hsl(var(--secondary))',
                position: 'relative',
                aspectRatio: '3 / 4',
              }}
            >
              <div className="img-zoom" style={{ width: '100%', height: '100%' }}>
                <img
                  src={product.images[selectedImg] || product.images[0]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {product.originalPrice && (
                <div style={{ position: 'absolute', top: 12, left: 12, background: '#ff0000', color: 'white', fontSize: 10, fontWeight: 900, padding: '6px 10px', borderRadius: 8 }}>
                  SALE
                </div>
              )}

              {product.limitedEdition && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.65)', color: '#ff0000', fontSize: 10, fontWeight: 900, padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,0,0,0.25)' }}>
                  LIMITED
                </div>
              )}
              {product.preorder && (
                <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(30,64,175,0.8)', color: '#bfdbfe', fontSize: 10, fontWeight: 900, padding: '6px 10px', borderRadius: 8 }}>
                  PREORDER
                </div>
              )}

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImg((i) => (i - 1 + product.images.length) % product.images.length)}
                    style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: 999, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedImg((i) => (i + 1) % product.images.length)}
                    style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: 999, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                {product.images.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setSelectedImg(i)}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 14,
                      overflow: 'hidden',
                      border: `2px solid ${i === selectedImg ? '#ff0000' : 'rgba(255,255,255,0.08)'}`,
                      background: 'transparent',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                    aria-label={`Select image ${i + 1}`}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ padding: 8 }}>
              {avgRating && reviews.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <CountdownStars rating={avgRating} count={reviews.length} />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#ff0000' }}>₹{product.price.toLocaleString()}</div>
                {product.originalPrice && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 18, color: 'hsl(var(--muted-foreground))', textDecoration: 'line-through' }}>
                      ₹{product.originalPrice.toLocaleString()}
                    </div>
                    <div style={{ background: '#ff0000', color: 'white', fontSize: 12, fontWeight: 900, padding: '4px 8px', borderRadius: 8 }}>
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </div>
                  </div>
                )}
              </div>

              {totalStock <= 5 && totalStock > 0 && (
                <div style={{ marginBottom: 14, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#f97316', borderRadius: 999, padding: '8px 12px', fontWeight: 800, fontSize: 12 }}>
                  ⚡ Only {totalStock} left!
                </div>
              )}

              <div style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: 16, padding: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>Select Size</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {variants.map((v) => (
                    <button
                      key={v.size}
                      disabled={v.stock === 0 && !product.preorder}
                      onClick={() => setSelectedSize(v.size)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 12,
                        border: `2px solid ${selectedSize === v.size ? '#ff0000' : 'hsl(var(--border))'}`,
                        background: selectedSize === v.size ? 'rgba(255,0,0,0.08)' : 'transparent',
                        color: v.stock === 0 && !product.preorder ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))',
                        cursor: v.stock === 0 && !product.preorder ? 'not-allowed' : 'pointer',
                        opacity: v.stock === 0 && !product.preorder ? 0.55 : 1,
                        fontWeight: selectedSize === v.size ? 900 : 500,
                        fontSize: 13,
                      }}
                    >
                      {v.size}
                      {v.stock > 0 && v.stock <= 3 && (
                        <span style={{ marginLeft: 8, color: 'white', background: '#f97316', borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 900 }}>
                        {v.stock}
                      </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <button
                  className="btn-yt"
                  disabled={!canAdd}
                  style={{ flex: 1, padding: '14px 12px', justifyContent: 'center', borderRadius: 14, fontSize: 14, opacity: canAdd ? 1 : 0.6 }}
                  onClick={() => {
                    if (!selectedSize) return;
                    addToCart(product, selectedSize);
                    onClose();
                  }}
                >
                  <ShoppingCart size={16} />
                  {product.preorder && totalStock === 0 ? 'Preorder' : 'Add'}
                </button>
                <Link
                  to={`/product/${product.id}`}
                  className="btn-ghost"
                  style={{ flex: 1, padding: '14px 12px', justifyContent: 'center', borderRadius: 14, fontSize: 14, textDecoration: 'none', opacity: 0.95, display: 'inline-flex' }}
                  onClick={onClose}
                >
                  Full
                </Link>
              </div>

              {totalStock === 0 && !product.preorder ? (
                <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, padding: 12, color: 'hsl(var(--muted-foreground))', fontSize: 13, lineHeight: 1.6 }}>
                  Out of stock. Use “Notify me” on the product page to be first when it’s back.
                </div>
              ) : product.preorder && totalStock === 0 ? (
                <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: 12, color: '#bfdbfe', fontSize: 13, lineHeight: 1.6 }}>
                  Preorder is live for this item. Your order will be fulfilled when stock arrives.
                </div>
              ) : (
                <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: 13, lineHeight: 1.6 }}>
                  🔒 Limited run. Never restocking once sold out.
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
            Tip: add to cart in one click, then choose size at checkout if needed.
          </div>
          <button onClick={onClose} style={{ border: '1px solid hsl(var(--border))', background: 'transparent', color: 'hsl(var(--muted-foreground))', borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickViewModal;

