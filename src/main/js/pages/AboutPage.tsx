import Layout from '@/components/layout/Layout';

const AboutPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 lg:py-32 bg-chocolate overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/20 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-display text-4xl lg:text-6xl font-semibold text-accent-foreground mb-6 animate-fade-in">
            Our Story
          </h1>
          <p className="text-accent-foreground/80 text-lg max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Curating moments of luxury through exquisite fragrances and artisanal chocolates
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display text-3xl lg:text-4xl font-semibold">
                A Passion for <span className="text-gold">Excellence</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                LuxeIndulge was born from a simple belief: everyone deserves to experience moments of pure luxury. 
                We carefully curate the finest perfumes from renowned maisons and artisanal chocolates from master 
                chocolatiers around the world.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our journey began in Mumbai, where we recognized the growing appreciation for premium gifting 
                experiences in India. Today, we're proud to bring these exquisite collections to discerning 
                customers across the nation.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800"
                alt="Luxury perfume collection"
                className="rounded-2xl shadow-elegant-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-elegant-lg">
                <p className="font-display text-3xl font-semibold text-gold">5+</p>
                <p className="text-sm text-muted-foreground">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-cream">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Authenticity',
                description: 'Every product is sourced directly from authorized distributors, ensuring 100% genuine luxury.',
              },
              {
                title: 'Quality',
                description: 'We partner only with the finest brands known for their exceptional craftsmanship and quality.',
              },
              {
                title: 'Service',
                description: 'From selection to delivery, we ensure a premium experience that matches our products.',
              },
            ].map((value, index) => (
              <div key={value.title} className="text-center p-8 bg-card rounded-xl shadow-elegant animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <h3 className="font-display text-xl font-semibold mb-4 text-gold">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
