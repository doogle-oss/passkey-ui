import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'perfumes',
    title: 'Perfumes',
    description: 'Luxurious fragrances for every occasion',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800',
    href: '/shop/perfumes',
    subcategories: ['Men', 'Women', 'Unisex'],
  },
  {
    id: 'chocolates',
    title: 'Chocolates',
    description: 'Artisanal chocolates crafted to perfection',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800',
    href: '/shop/chocolates',
    subcategories: ['Dark', 'Milk', 'White', 'Assorted'],
  },
];

const CategoriesSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our two signature collections, each curated for those who appreciate the finer things in life
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={category.href}
              className="group relative aspect-[4/3] lg:aspect-[16/10] overflow-hidden rounded-2xl shadow-elegant-lg animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end text-background">
                <div className="transform group-hover:-translate-y-2 transition-transform duration-300">
                  <h3 className="font-display text-3xl lg:text-4xl font-semibold mb-2">
                    {category.title}
                  </h3>
                  <p className="text-background/80 mb-4">{category.description}</p>

                  {/* Subcategories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {category.subcategories.map(sub => (
                      <span
                        key={sub}
                        className="px-3 py-1 bg-background/20 backdrop-blur-sm rounded-full text-sm"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-2 text-gold font-medium group-hover:gap-3 transition-all">
                    Shop Now
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
