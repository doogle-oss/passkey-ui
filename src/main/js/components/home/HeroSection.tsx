import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center gradient-hero overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 lg:space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full">
              <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gold">Premium Gifting Collection</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.1] tracking-tight">
              Indulge in
              <span className="block text-gold">Luxury</span>
              <span className="block text-chocolate-light">Fragrances & Chocolates</span>
            </h1>

            <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
              Discover our curated collection of the world's finest perfumes and artisanal chocolates. 
              Perfect for gifting or personal indulgence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button variant="gold" size="xl" asChild>
                <Link to="/shop/perfumes">
                  Shop Perfumes
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="elegant-outline" size="xl" asChild>
                <Link to="/shop/chocolates">
                  Shop Chocolates
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                100% Authentic
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                Pan India Delivery
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-elegant-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <img
                    src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"
                    alt="Luxury Perfume"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                </div>
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-elegant-lg animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <img
                    src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800"
                    alt="Premium Chocolates"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-elegant-lg animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <img
                    src="https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800"
                    alt="Chocolate Truffles"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-elegant-lg animate-slide-up" style={{ animationDelay: '0.5s' }}>
                  <img
                    src="https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800"
                    alt="Elegant Fragrance"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-card p-4 rounded-xl shadow-elegant-lg border border-border animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <p className="text-xs text-muted-foreground">Trusted by</p>
              <p className="font-display text-2xl font-semibold text-gold">10,000+</p>
              <p className="text-sm">Happy Customers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
