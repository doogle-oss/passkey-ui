export interface Product {
  id: string;
  name: string;
  category: 'perfumes' | 'chocolates';
  subcategory: string;
  price: number;
  originalPrice?: number;
  description: string;
  details: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  brand: string;
  featured?: boolean;
  bestSeller?: boolean;
}

export const products: Product[] = [
  // Perfumes
  {
    id: 'perf-001',
    name: 'Midnight Oud',
    category: 'perfumes',
    subcategory: 'Unisex',
    price: 4999,
    originalPrice: 6499,
    description: 'A luxurious blend of aged oud wood, rich amber, and delicate rose petals. This captivating fragrance opens with spicy saffron and settles into a warm, sensual base.',
    details: [
      'Top Notes: Saffron, Bergamot',
      'Heart Notes: Rose, Oud',
      'Base Notes: Amber, Sandalwood, Musk',
      'Concentration: Eau de Parfum',
      'Volume: 100ml'
    ],
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800',
      'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800'
    ],
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    stockCount: 45,
    brand: 'Maison Élégance',
    featured: true,
    bestSeller: true
  },
  {
    id: 'perf-002',
    name: 'Rose Imperiale',
    category: 'perfumes',
    subcategory: 'Women',
    price: 3799,
    description: 'An enchanting feminine fragrance featuring Bulgarian rose absolute, peony, and a whisper of vanilla. Perfect for the modern woman who appreciates timeless elegance.',
    details: [
      'Top Notes: Pink Pepper, Lychee',
      'Heart Notes: Bulgarian Rose, Peony',
      'Base Notes: Vanilla, White Musk',
      'Concentration: Eau de Parfum',
      'Volume: 75ml'
    ],
    images: [
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800',
      'https://images.unsplash.com/photo-1592945403244-b3fbabd7f539?w=800',
      'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800'
    ],
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    stockCount: 32,
    brand: 'Fleur de Paris',
    featured: true
  },
  {
    id: 'perf-003',
    name: 'Tobacco & Leather',
    category: 'perfumes',
    subcategory: 'Men',
    price: 5499,
    originalPrice: 6999,
    description: 'A bold, masculine fragrance that combines rich tobacco leaf with supple leather and warm spices. Sophisticated and unforgettable.',
    details: [
      'Top Notes: Cardamom, Black Pepper',
      'Heart Notes: Tobacco Leaf, Leather',
      'Base Notes: Tonka Bean, Vetiver',
      'Concentration: Eau de Parfum',
      'Volume: 100ml'
    ],
    images: [
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800',
      'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=800'
    ],
    rating: 4.9,
    reviewCount: 156,
    inStock: true,
    stockCount: 28,
    brand: 'Noble House',
    bestSeller: true
  },
  {
    id: 'perf-004',
    name: 'Ocean Breeze',
    category: 'perfumes',
    subcategory: 'Unisex',
    price: 2999,
    description: 'A refreshing aquatic fragrance inspired by the Indian Ocean. Notes of sea salt, driftwood, and white flowers create a clean, invigorating scent.',
    details: [
      'Top Notes: Sea Salt, Citrus',
      'Heart Notes: Jasmine, Driftwood',
      'Base Notes: Musk, Amber',
      'Concentration: Eau de Toilette',
      'Volume: 100ml'
    ],
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
      'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800'
    ],
    rating: 4.4,
    reviewCount: 67,
    inStock: true,
    stockCount: 55,
    brand: 'Azure Coast'
  },
  {
    id: 'perf-005',
    name: 'Velvet Jasmine',
    category: 'perfumes',
    subcategory: 'Women',
    price: 4299,
    description: 'A seductive floral fragrance built around night-blooming jasmine. Enriched with ylang-ylang and a creamy sandalwood base.',
    details: [
      'Top Notes: Ylang-Ylang, Neroli',
      'Heart Notes: Jasmine Sambac, Tuberose',
      'Base Notes: Sandalwood, Vanilla',
      'Concentration: Eau de Parfum',
      'Volume: 50ml'
    ],
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbabd7f539?w=800',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800',
      'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800'
    ],
    rating: 4.7,
    reviewCount: 98,
    inStock: true,
    stockCount: 18,
    brand: 'Fleur de Paris',
    featured: true
  },
  {
    id: 'perf-006',
    name: 'Sandalwood Royale',
    category: 'perfumes',
    subcategory: 'Men',
    price: 3599,
    description: 'A warm, woody fragrance centered on precious Indian sandalwood. Accented with spices and creamy vanilla for a refined finish.',
    details: [
      'Top Notes: Cinnamon, Nutmeg',
      'Heart Notes: Indian Sandalwood, Cedarwood',
      'Base Notes: Vanilla, Benzoin',
      'Concentration: Eau de Parfum',
      'Volume: 75ml'
    ],
    images: [
      'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=800',
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800'
    ],
    rating: 4.5,
    reviewCount: 76,
    inStock: true,
    stockCount: 42,
    brand: 'Noble House'
  },

  // Chocolates
  {
    id: 'choc-001',
    name: 'Royal Dark Collection',
    category: 'chocolates',
    subcategory: 'Dark Chocolate',
    price: 1899,
    originalPrice: 2299,
    description: 'An exquisite collection of single-origin dark chocolates from around the world. Each piece showcases unique flavor profiles from Ghana, Ecuador, and Madagascar.',
    details: [
      'Cocoa Content: 70-85%',
      'Net Weight: 250g',
      'Pieces: 24',
      'Shelf Life: 12 months',
      'Contains: Cocoa, Sugar, Cocoa Butter'
    ],
    images: [
      'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800',
      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800',
      'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800'
    ],
    rating: 4.9,
    reviewCount: 203,
    inStock: true,
    stockCount: 78,
    brand: 'Cocoa Atelier',
    featured: true,
    bestSeller: true
  },
  {
    id: 'choc-002',
    name: 'Truffle Treasure Box',
    category: 'chocolates',
    subcategory: 'Assorted',
    price: 2499,
    description: 'Handcrafted Belgian truffles in an elegant gift box. Features classic flavors including champagne, hazelnut, caramel, and raspberry.',
    details: [
      'Net Weight: 300g',
      'Pieces: 20 truffles',
      'Shelf Life: 6 months',
      'Storage: Cool, dry place',
      'Contains: Milk, Nuts, Alcohol'
    ],
    images: [
      'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800',
      'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800',
      'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800'
    ],
    rating: 4.8,
    reviewCount: 167,
    inStock: true,
    stockCount: 45,
    brand: 'Brussels Délices',
    featured: true
  },
  {
    id: 'choc-003',
    name: 'Milk Chocolate Pralines',
    category: 'chocolates',
    subcategory: 'Milk Chocolate',
    price: 1599,
    description: 'Silky smooth milk chocolate pralines filled with creamy hazelnut and almond paste. A timeless indulgence for chocolate lovers.',
    details: [
      'Cocoa Content: 35%',
      'Net Weight: 200g',
      'Pieces: 16',
      'Shelf Life: 9 months',
      'Contains: Milk, Hazelnuts, Almonds'
    ],
    images: [
      'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800',
      'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800',
      'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800'
    ],
    rating: 4.6,
    reviewCount: 134,
    inStock: true,
    stockCount: 62,
    brand: 'Swiss Maison',
    bestSeller: true
  },
  {
    id: 'choc-004',
    name: 'Indian Spice Fusion',
    category: 'chocolates',
    subcategory: 'Dark Chocolate',
    price: 1299,
    description: 'A unique fusion of premium dark chocolate infused with traditional Indian spices - cardamom, saffron, and rose. A celebration of heritage.',
    details: [
      'Cocoa Content: 72%',
      'Net Weight: 150g',
      'Pieces: 12',
      'Shelf Life: 10 months',
      'Contains: Cocoa, Spices, Rose Extract'
    ],
    images: [
      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800',
      'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800',
      'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800'
    ],
    rating: 4.7,
    reviewCount: 89,
    inStock: true,
    stockCount: 34,
    brand: 'Cocoa Atelier',
    featured: true
  },
  {
    id: 'choc-005',
    name: 'White Chocolate Dreams',
    category: 'chocolates',
    subcategory: 'White Chocolate',
    price: 1799,
    description: 'Luxurious white chocolate creations with vanilla bean, strawberry, and passion fruit centers. Light, creamy, and utterly delicious.',
    details: [
      'Net Weight: 220g',
      'Pieces: 18',
      'Shelf Life: 8 months',
      'Storage: Below 20°C',
      'Contains: Milk, Cocoa Butter, Fruits'
    ],
    images: [
      'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800',
      'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800',
      'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800'
    ],
    rating: 4.4,
    reviewCount: 56,
    inStock: true,
    stockCount: 28,
    brand: 'Brussels Délices'
  },
  {
    id: 'choc-006',
    name: 'Grand Gift Hamper',
    category: 'chocolates',
    subcategory: 'Assorted',
    price: 4999,
    originalPrice: 5999,
    description: 'The ultimate chocolate gift hamper featuring our finest selections - dark, milk, and white chocolates, truffles, and pralines in a luxury presentation box.',
    details: [
      'Net Weight: 750g',
      'Pieces: 48 assorted',
      'Shelf Life: 6 months',
      'Premium Gift Box Included',
      'Contains: Milk, Nuts, Alcohol, Soy'
    ],
    images: [
      'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800',
      'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800',
      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800',
      'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800'
    ],
    rating: 4.9,
    reviewCount: 245,
    inStock: true,
    stockCount: 15,
    brand: 'Maison Chocolat',
    featured: true,
    bestSeller: true
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: 'perfumes' | 'chocolates'): Product[] => {
  return products.filter(p => p.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(p => p.featured);
};

export const getBestSellers = (): Product[] => {
  return products.filter(p => p.bestSeller);
};

export const getSubcategories = (category: 'perfumes' | 'chocolates'): string[] => {
  const categoryProducts = products.filter(p => p.category === category);
  return [...new Set(categoryProducts.map(p => p.subcategory))];
};

export const getBrands = (category?: 'perfumes' | 'chocolates'): string[] => {
  const filtered = category ? products.filter(p => p.category === category) : products;
  return [...new Set(filtered.map(p => p.brand))];
};
