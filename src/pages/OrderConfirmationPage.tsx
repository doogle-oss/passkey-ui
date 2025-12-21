import { Link } from 'react-router-dom';
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const OrderConfirmationPage = () => {
  const orderId = `LI${Date.now().toString().slice(-8)}`;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-scale-in">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>

          <h1 className="font-display text-3xl lg:text-4xl font-semibold mb-4 animate-fade-in">
            Thank You for Your Order!
          </h1>

          <p className="text-muted-foreground text-lg mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Your order has been successfully placed and is being processed.
          </p>

          <div className="bg-card rounded-xl shadow-elegant p-6 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Package className="w-5 h-5 text-gold" />
              <span className="font-medium">Order ID</span>
            </div>
            <p className="font-display text-2xl font-semibold text-gold">{orderId}</p>

            <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-border text-left">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="font-medium text-green-600">Order Placed</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Expected Delivery</p>
                <p className="font-medium">3-5 Business Days</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Mail className="w-5 h-5" />
            <span>A confirmation email has been sent to your email address</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button variant="gold" size="xl" asChild>
              <Link to="/orders">
                Track Your Order
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/shop/perfumes">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmationPage;
