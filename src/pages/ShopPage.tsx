import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, Grid3X3, List, SlidersHorizontal, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { products, getSubcategories, getBrands } from '@/data/products';
import { cn } from '@/lib/utils';

const ShopPage = () => {
  const { category } = useParams<{ category: 'perfumes' | 'chocolates' }>();
  const [sortBy, setSortBy] = useState('featured');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const validCategory = category === 'perfumes' || category === 'chocolates' ? category : 'perfumes';
  const subcategories = getSubcategories(validCategory);
  const brands = getBrands(validCategory);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.category === validCategory);

    if (selectedSubcategory) {
      filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
    }

    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    filtered = filtered.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        // Featured first
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return filtered;
  }, [validCategory, selectedSubcategory, selectedBrand, priceRange, sortBy]);

  const clearFilters = () => {
    setSelectedSubcategory(null);
    setSelectedBrand(null);
    setPriceRange([0, 10000]);
  };

  const hasActiveFilters = selectedSubcategory || selectedBrand || priceRange[0] > 0 || priceRange[1] < 10000;

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 bg-chocolate overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-chocolate to-chocolate-light opacity-90" />
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-accent-foreground capitalize">
              {validCategory}
            </h1>
            <p className="text-accent-foreground/80 mt-2">
              Discover our exquisite collection of {validCategory === 'perfumes' ? 'luxury fragrances' : 'artisanal chocolates'}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={cn(
              "lg:w-64 flex-shrink-0 space-y-6",
              showFilters ? "block" : "hidden lg:block"
            )}
          >
            {/* Mobile filter header */}
            <div className="flex items-center justify-between lg:hidden">
              <h3 className="font-display text-lg font-medium">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active filters</span>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}

            {/* Subcategory Filter */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm uppercase tracking-wider">Category</h4>
              <div className="space-y-2">
                {subcategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(selectedSubcategory === sub ? null : sub)}
                    className={cn(
                      "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedSubcategory === sub
                        ? "bg-gold text-primary-foreground"
                        : "hover:bg-secondary"
                    )}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm uppercase tracking-wider">Brand</h4>
              <div className="space-y-2">
                {brands.map(brand => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                    className={cn(
                      "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedBrand === brand
                        ? "bg-gold text-primary-foreground"
                        : "hover:bg-secondary"
                    )}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm uppercase tracking-wider">Price Range</h4>
              <div className="space-y-2">
                {[
                  { label: 'Under ₹2,000', range: [0, 2000] },
                  { label: '₹2,000 - ₹4,000', range: [2000, 4000] },
                  { label: '₹4,000 - ₹6,000', range: [4000, 6000] },
                  { label: 'Above ₹6,000', range: [6000, 10000] },
                ].map(({ label, range }) => (
                  <button
                    key={label}
                    onClick={() => setPriceRange(range as [number, number])}
                    className={cn(
                      "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      priceRange[0] === range[0] && priceRange[1] === range[1]
                        ? "bg-gold text-primary-foreground"
                        : "hover:bg-secondary"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden flex items-center gap-2 text-sm font-medium"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <p className="text-muted-foreground text-sm">
                  {filteredProducts.length} products
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="appearance-none bg-secondary px-4 py-2 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="newest">Newest</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>

                {/* View Mode */}
                <div className="hidden sm:flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === 'grid' ? "bg-gold text-primary-foreground" : "hover:bg-secondary"
                    )}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === 'list' ? "bg-gold text-primary-foreground" : "hover:bg-secondary"
                    )}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products found matching your criteria</p>
                <Button variant="gold" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-6",
                  viewMode === 'grid'
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                )}
              >
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;
