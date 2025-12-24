import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Lock, Shield, ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { WebAuthn } from '@/components/auth/Webauthn';

type Step = 'address' | 'payment' | 'confirm';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { state, cartTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>('address');
  const [isProcessing, setIsProcessing] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [otpRemaining, setOtpRemaining] = useState(0);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentPasskeyLoading, setPaymentPasskeyLoading] = useState(false);
  const [showPaymentPasskeyPrompt, setShowPaymentPasskeyPrompt] = useState(false);
  const [paymentPasskeyExists, setPaymentPasskeyExists] = useState(false);
  const [payWithPasskeyLoading, setPayWithPasskeyLoading] = useState(false);

  const paymentWebAuthn = new WebAuthn({
    registerOptionsChallengePath: '/q/webauthn/register-options-challenge',
    registerPath: '/q/webauthn/register',
    loginOptionsChallengePath: '/q/webauthn/login-options-challenge',
    loginPath: '/q/webauthn/login',
  });

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    saveInfo: false,
    giftMessage: '',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const shipping = cartTotal > 1999 ? 0 : 99;
  const tax = Math.round(cartTotal * 0.18);
  const total = cartTotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.email || !formData.phone || !formData.firstName || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCurrentStep('payment');
  };

  const generateOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 60000;
    setGeneratedOtp(newOtp);
    setOtpExpiresAt(expires);
    setOtpRemaining(60);
    setOtp('');
    setShowOtpModal(true);
    console.log('Checkout OTP (demo):', newOtp);
    toast.info('OTP sent. Please enter it to proceed.');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cardNumber || !formData.cardName || !formData.expiry || !formData.cvv) {
      toast.error('Please fill in all payment details');
      return;
    }

    generateOtp();
  };

  const handleVerifyOtp = async () => {
    if (!generatedOtp) {
      toast.error('Request an OTP first');
      return;
    }
    if (!otp) {
      toast.error('Enter the OTP');
      return;
    }
    if (otpExpiresAt && Date.now() > otpExpiresAt) {
      toast.error('OTP expired. Request a new one.');
      return;
    }
    if (otp !== generatedOtp) {
      toast.error('Incorrect OTP');
      return;
    }

    setIsProcessing(true);
    toast.success('OTP verified');
    setShowOtpModal(false);
    setCurrentStep('confirm');
    setOrderPlaced(true);

    if (formData.email) {
      sessionStorage.setItem('lastCheckoutEmail', formData.email);
    }

    // Clear cart and stay on order confirmation page
    clearCart();
    navigate('/order-confirmation');

    // Offer to register a payment passkey if not present
    checkPaymentPasskey();
  };

  const handleRequestNewOtp = () => {
    generateOtp();
  };

  const paymentPasskeyUsername = formData.email ? `${formData.email}_payment` : '';

  const checkPaymentPasskey = async () => {
    if (!paymentPasskeyUsername) return;
    try {
      const resp = await fetch(`/api/users/${encodeURIComponent(paymentPasskeyUsername)}/webauthn/credentials`);
      if (!resp.ok) return;
      const exists = await resp.json();
      setPaymentPasskeyExists(!!exists);
      setShowPaymentPasskeyPrompt(!exists);
    } catch (err) {
      console.error('Payment passkey check failed:', err);
    }
  };

  const handleRegisterPaymentPasskey = async () => {
    if (!paymentPasskeyUsername) {
      toast.error('Email required to register payment passkey');
      return;
    }
    setPaymentPasskeyLoading(true);
    try {
      await paymentWebAuthn.register({
        username: paymentPasskeyUsername,
        displayName: `${formData.email} (Payment Passkey)`,
      });
      toast.success('Payment passkey registered');
      setPaymentPasskeyExists(true);
      setShowPaymentPasskeyPrompt(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to register payment passkey';
      toast.error(msg);
    } finally {
      setPaymentPasskeyLoading(false);
    }
  };

  const handlePayWithPasskey = async () => {
    if (!paymentPasskeyUsername) {
      toast.error('Email required for payment passkey');
      return;
    }
    if (!paymentPasskeyExists) {
      toast.error('No payment passkey found for this email');
      return;
    }

    setPayWithPasskeyLoading(true);
    setIsProcessing(true);
    try {
      await paymentWebAuthn.login({ username: paymentPasskeyUsername });
      toast.success('Payment authorized via passkey');
      if (formData.email) {
        sessionStorage.setItem('lastCheckoutEmail', formData.email);
      }
      setOrderPlaced(true);
      clearCart();
      navigate('/order-confirmation');
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Passkey payment failed. Please try again with your passkey. If it continues, use the OTP flow.');
      console.error('Passkey payment failed:', detail);
    } finally {
      setPayWithPasskeyLoading(false);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!otpExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000));
      setOtpRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  useEffect(() => {
    if (!paymentPasskeyUsername || currentStep !== 'payment') return;
    const debounce = setTimeout(() => {
      checkPaymentPasskey();
    }, 300);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPasskeyUsername, currentStep]);

  const renderOtpDialog = () => (
    <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter OTP</DialogTitle>
          <DialogDescription>
            We have generated a 6-digit OTP (printed to console for this demo). Enter it within 60 seconds to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Payment verification</span>
            {generatedOtp && (
              <span>{otpRemaining > 0 ? `Expires in ${otpRemaining}s` : 'OTP expired'}</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="flex-1 px-4 py-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Enter 6-digit OTP"
            />
            <Button
              type="button"
              variant="gold"
              onClick={handleVerifyOtp}
              disabled={isProcessing}
              className="sm:w-40"
            >
              Verify OTP
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button type="button" variant="outline" size="sm" disabled={isProcessing} onClick={handleRequestNewOtp}>
              Resend OTP
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={isProcessing} onClick={() => setShowOtpModal(false)}>
              Cancel
            </Button>
          </div>
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );

  const steps = [
    { id: 'address', label: 'Shipping', icon: '1' },
    { id: 'payment', label: 'Payment', icon: '2' },
    { id: 'confirm', label: 'Confirmation', icon: '3' },
  ];

  if (state.items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {renderOtpDialog()}
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      currentStep === step.id
                        ? "bg-gold text-primary-foreground"
                        : steps.findIndex(s => s.id === currentStep) > index
                        ? "bg-green-500 text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {steps.findIndex(s => s.id === currentStep) > index ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className="text-xs mt-2 hidden sm:block">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-4",
                      steps.findIndex(s => s.id === currentStep) > index
                        ? "bg-green-500"
                        : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {currentStep === 'address' && (
              <form onSubmit={handleAddressSubmit} className="bg-card rounded-xl shadow-elegant p-6 space-y-6">
                <h2 className="font-display text-xl font-semibold">Contact Information</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>
                </div>

                <h2 className="font-display text-xl font-semibold pt-4">Shipping Address</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Apartment, suite, etc.</label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium mb-2">PIN Code *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gift Message (Optional)</label>
                  <textarea
                    name="giftMessage"
                    value={formData.giftMessage}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                    placeholder="Add a personalized message..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveInfo"
                    name="saveInfo"
                    checked={formData.saveInfo}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-border text-gold focus:ring-gold"
                  />
                  <label htmlFor="saveInfo" className="text-sm text-muted-foreground">
                    Save this information for faster checkout
                  </label>
                </div>

                <Button variant="gold" size="xl" type="submit" className="w-full">
                  Continue to Payment
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            )}

            {currentStep === 'payment' && (
              <form onSubmit={handlePaymentSubmit} className="bg-card rounded-xl shadow-elegant p-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-gold" />
                  <h2 className="font-display text-xl font-semibold">Secure Payment</h2>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg mb-4">
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-8 h-8 text-gold" />
                    <span className="font-medium">Credit / Debit Card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-6" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Name on Card *</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                    <input
                      type="text"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gold/10 rounded-lg">
                  <Shield className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-gold">3D Secure Authentication</p>
                    <p className="text-muted-foreground">
                      Your payment is protected by American Express SafeKey / Visa Secure / Mastercard Identity Check. 
                      You may be asked to verify via OTP or biometric authentication.
                    </p>
                  </div>
                </div>

                {paymentPasskeyExists && paymentPasskeyUsername && (
                  <div className="p-4 border rounded-lg bg-secondary/60 text-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2 font-medium">
                      <img src="/passkey_logo.jpg" alt="Passkey" className="h-5 w-5 rounded" />
                      Pay with your saved payment passkey ({paymentPasskeyUsername})
                    </div>
                    <p className="text-muted-foreground">
                      Authorize with your passkey and skip OTP for this payment.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        variant="gold"
                        className="flex-1 inline-flex items-center justify-center gap-2"
                        onClick={handlePayWithPasskey}
                        disabled={payWithPasskeyLoading || isProcessing}
                      >
                        {payWithPasskeyLoading ? 'Authorizing...' : 'Pay with Passkey'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="xl"
                    type="button"
                    onClick={() => setCurrentStep('address')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    variant="gold"
                    size="xl"
                    type="submit"
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {`Pay ${formatPrice(total)}`}
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 'confirm' && (
              <div className="bg-card rounded-xl shadow-elegant p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="font-display text-2xl font-semibold mb-2">Payment Successful!</h2>
                <p className="text-muted-foreground mb-4">
                  Your order has been placed and you will receive a confirmation email shortly.
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to order confirmation...
                </p>

                {!paymentPasskeyExists && paymentPasskeyUsername && (
                  <div className="mt-6 p-4 border rounded-lg text-left bg-secondary/60">
                    <p className="font-semibold mb-2">Register a payment passkey?</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Save a passkey for faster, safer payments using {paymentPasskeyUsername}.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        variant="gold"
                        onClick={handleRegisterPaymentPasskey}
                        disabled={paymentPasskeyLoading}
                      >
                        {paymentPasskeyLoading ? (
                          'Registering...'
                        ) : (
                          <span className="inline-flex items-center">
                            <img src="/passkey_logo.jpg" alt="Passkey" className="h-5 w-5 mr-2 rounded" />
                            Register Passkey
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowPaymentPasskeyPrompt(false)}
                        disabled={paymentPasskeyLoading}
                      >
                        Maybe later
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-elegant p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {state.items.map(item => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="relative">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-primary-foreground text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{item.product.category}</p>
                      <p className="text-sm font-medium text-gold mt-1">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax (18% GST)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between font-display text-lg font-semibold pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-gold">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
