import { Package, Shield, Truck, Headphones } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: '100% Authentic',
    description: 'Every product is sourced directly from authorized distributors',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Complimentary delivery on orders above ₹1,999 across India',
  },
  {
    icon: Package,
    title: 'Premium Packaging',
    description: 'Elegant gift-ready packaging for every order',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    description: 'Our fragrance experts are here to help you choose',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 lg:py-24 bg-cream-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-4">
            Why Choose <span className="text-gold">LuxeIndulge</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're committed to delivering an exceptional experience from browsing to unboxing
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="text-center p-6 bg-card rounded-xl shadow-elegant hover:shadow-elegant-lg transition-shadow animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gold/10 rounded-full mb-4">
                <feature.icon className="w-7 h-7 text-gold" />
              </div>
              <h3 className="font-display text-lg font-medium mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
