import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { WebAuthn } from '@/components/auth/Webauthn';

const OrderConfirmationPage = () => {
  const orderId = useMemo(() => `LI${Date.now().toString().slice(-8)}`, []);
  const [email] = useState(() => sessionStorage.getItem('lastCheckoutEmail') || '');
  const [paymentPasskeyExists, setPaymentPasskeyExists] = useState(false);
  const [showPaymentPasskeyPrompt, setShowPaymentPasskeyPrompt] = useState(false);
  const [paymentPasskeyLoading, setPaymentPasskeyLoading] = useState(false);
  const [checkingPasskey, setCheckingPasskey] = useState(false);
  const [windowExpired, setWindowExpired] = useState(false);
  const [countdown, setCountdown] = useState(120);

  const paymentPasskeyUsername = email ? `${email}_payment` : '';

  useEffect(() => {
    console.log('[OrderConfirmation] init', {
      orderId,
      email,
      paymentPasskeyUsername,
    });
  }, [orderId, email, paymentPasskeyUsername]);

  const paymentWebAuthn = useMemo(
    () =>
      new WebAuthn({
        registerPath: '/webauthn/register',
        loginPath: '/webauthn/login',
        callbackPath: '/webauthn/callback'
      }),
    []
  );

  const checkPaymentPasskey = async (showMissingEmailError = false) => {
    console.log('[OrderConfirmation] checkPaymentPasskey start', { paymentPasskeyUsername, showMissingEmailError });
    if (!paymentPasskeyUsername) {
      if (showMissingEmailError) {
        toast.error('Add the payment email used during checkout to manage your passkey.');
      }
      console.log('[OrderConfirmation] missing paymentPasskeyUsername, skipping check');
      return;
    }

    setCheckingPasskey(true);
    try {
      const resp = await fetch(`/webauthn/${encodeURIComponent(paymentPasskeyUsername)}/creds`);
      if (!resp.ok) {
        throw new Error('Could not check payment passkey status');
      }
      const exists = await resp.json();
      console.log('[OrderConfirmation] passkey status response', { exists });
      setPaymentPasskeyExists(!!exists);
      setShowPaymentPasskeyPrompt(!exists);
      if (!exists) {
        setWindowExpired(false);
        setCountdown(120);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to check payment passkey';
      console.error('[OrderConfirmation] passkey check failed', err);
      toast.error(msg);
    } finally {
      setCheckingPasskey(false);
      console.log('[OrderConfirmation] checkPaymentPasskey end');
    }
  };

  const handleRegisterPaymentPasskey = async () => {
    console.log('[OrderConfirmation] handleRegisterPaymentPasskey start', {
      paymentPasskeyUsername,
      showPaymentPasskeyPrompt,
      windowExpired,
    });
    if (!paymentPasskeyUsername) {
      toast.error('Add the payment email first.');
      console.warn('[OrderConfirmation] register aborted: missing paymentPasskeyUsername');
      return;
    }
    if (!showPaymentPasskeyPrompt || windowExpired) {
      toast.error('Check status to start a fresh 120-second registration window.');
      console.warn('[OrderConfirmation] register aborted: prompt not active or window expired', {
        showPaymentPasskeyPrompt,
        windowExpired,
      });
      return;
    }

    setPaymentPasskeyLoading(true);
    try {
      await paymentWebAuthn.register({
        username: paymentPasskeyUsername,
        name: paymentPasskeyUsername,
        displayName: `${email} (Payment Passkey)`,
      });
      toast.success('Payment passkey registered');
      setPaymentPasskeyExists(true);
      setShowPaymentPasskeyPrompt(false);
      console.log('[OrderConfirmation] register success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to register payment passkey';
      toast.error(msg);
      console.error('[OrderConfirmation] register failed', err);
    } finally {
      setPaymentPasskeyLoading(false);
      console.log('[OrderConfirmation] handleRegisterPaymentPasskey end');
    }
  };

  useEffect(() => {
    if (!paymentPasskeyUsername) return;
    const debounce = setTimeout(() => {
      console.log('[OrderConfirmation] triggering initial passkey check');
      checkPaymentPasskey();
    }, 300);
    return () => clearTimeout(debounce);
  }, [paymentPasskeyUsername]);

  useEffect(() => {
    if (!showPaymentPasskeyPrompt) return;
    setWindowExpired(false);
    setCountdown(120);
    console.log('[OrderConfirmation] passkey window opened for 120s');
    const timer = setInterval(() => {
      setCountdown(prev => {
        const next = Math.max(prev - 1, 0);
        if (next === 0) {
          setWindowExpired(true);
          setShowPaymentPasskeyPrompt(false);
          console.log('[OrderConfirmation] passkey window expired, prompt hidden');
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showPaymentPasskeyPrompt]);

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

          {paymentPasskeyUsername && showPaymentPasskeyPrompt && !paymentPasskeyExists && !windowExpired && (
            <div className="bg-card rounded-xl border border-border/60 p-6 mb-8 animate-fade-in" style={{ animationDelay: '0.35s' }}>
              <div className="flex items-start gap-3 text-left">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">Set up a payment passkey</p>
                    <span className="text-xs text-muted-foreground">
                      {`Expires in ${countdown}s`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Register a passkey tied to your payment email for faster, safer checkout next time.
                  </p>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                      Payment email: <span className="font-medium text-foreground">{email}</span>
                    </div>
                    <div className="flex gap-2 sm:justify-end">
                      <Button
                        type="button"
                        variant="gold"
                        className="inline-flex items-center gap-2"
                        onClick={handleRegisterPaymentPasskey}
                        disabled={
                          paymentPasskeyLoading ||
                          paymentPasskeyExists ||
                          !showPaymentPasskeyPrompt ||
                          windowExpired
                        }
                      >
                        {paymentPasskeyLoading ? (
                          'Registering...'
                        ) : (
                          <>
                            <img src="/passkey_logo.jpg" alt="Passkey" className="h-5 w-5 rounded" />
                            <span>Register passkey</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    Complete setup within the 120-second window. This offer hides automatically afterward.
                  </p>
                </div>
              </div>
            </div>
          )}

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
