import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount, toggleCart } = useCart();
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop/perfumes', label: 'Perfumes' },
    { href: '/shop/chocolates', label: 'Chocolates' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top announcement bar */}
      <div className="bg-chocolate text-accent-foreground text-center py-2 px-4 text-xs sm:text-sm tracking-wide">
        <span className="text-gold">✦</span> Free Shipping on Orders Above ₹1,999 <span className="text-gold">✦</span> Pan India Delivery
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 font-display text-2xl lg:text-3xl font-semibold tracking-tight text-foreground"
          >
            <span className="text-gold">Luxe</span>Indulge
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium tracking-wide transition-colors duration-200 hover:text-gold relative py-2",
                  isActive(link.href) ? "text-gold" : "text-muted-foreground"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold" />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:text-gold transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              to="/wishlist"
              className="hidden sm:block p-2 hover:text-gold transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <Link
              to="/auth"
              className="p-2 hover:text-gold transition-colors"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={toggleCart}
              className="p-2 hover:text-gold transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-border animate-slide-down">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for perfumes, chocolates..."
                className="w-full pl-12 pr-4 py-3 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-slide-down">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "block py-3 text-base font-medium tracking-wide transition-colors",
                  isActive(link.href) ? "text-gold" : "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              <Link
                to="/wishlist"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 py-3 text-foreground"
              >
                <Heart className="w-5 h-5" />
                Wishlist
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
