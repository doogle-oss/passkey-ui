import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBestSellers } from '@/data/products';
import { useCart } from '@/context/CartContext';

const BestSellers = () => {
  const bestSellers = getBestSellers();
  const { addToCart, openCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-16 lg:py-24 bg-chocolate text-accent-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-gold" />
            <div>
              <h2 className="font-display text-3xl lg:text-4xl font-semibold">
                Best Sellers
              </h2>
              <p className="text-accent-foreground/70">
                Our most loved products
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {bestSellers.slice(0, 3).map((product, index) => (
            <div
              key={product.id}
              className="group bg-accent/10 backdrop-blur-sm rounded-xl p-6 flex gap-6 hover:bg-accent/20 transition-colors animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link to={`/product/${product.id}`} className="flex-shrink-0">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-28 h-28 object-cover rounded-lg group-hover:scale-105 transition-transform"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 bg-gold/20 text-gold rounded-full capitalize">
                    {product.category}
                  </span>
                  <span className="text-xs text-accent-foreground/60">#{index + 1}</span>
                </div>
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-display text-lg font-medium mb-1 hover:text-gold transition-colors truncate">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-accent-foreground/70 mb-2">{product.brand}</p>
                
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating)
                          ? "text-gold fill-gold"
                          : "text-accent-foreground/30"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-accent-foreground/60 ml-1">
                    ({product.reviewCount})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-display text-xl font-semibold text-gold">
                    {formatPrice(product.price)}
                  </span>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => {
                      addToCart(product);
                      openCart();
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
