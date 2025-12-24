import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { WebAuthn } from './Webauthn';

interface RegistrationFormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

interface LoginFormData {
  username: string;
  password?: string;
}

export const PasskeyAuth: React.FC = () => {
  const { login, register, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);
  const [createdUser, setCreatedUser] = useState<any | null>(null);

  const [loginForm, setLoginForm] = useState<LoginFormData>({
    username: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState<RegistrationFormData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [showSavePasskeyOffer, setShowSavePasskeyOffer] = useState(false);
  const [offeredUsername, setOfferedUsername] = useState('');
  const [showPasskeyNotFoundOptions, setShowPasskeyNotFoundOptions] = useState(false);
  const [failedLoginUsername, setFailedLoginUsername] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any | null>(null);
  const [showRegisterPasskeyPrompt, setShowRegisterPasskeyPrompt] = useState(false);

  const webAuthn = new WebAuthn({
    registerOptionsChallengePath: '/q/webauthn/register-options-challenge',
    registerPath: '/q/webauthn/register',
    loginOptionsChallengePath: '/q/webauthn/login-options-challenge',
    loginPath: '/q/webauthn/login'
  });

  // Handle account creation (password required)
  const handleCreateAccount = async () => {
    setError('');

    if (!registerForm.username || !registerForm.firstName || !registerForm.lastName || !registerForm.email || !registerForm.password) {
      setError('Please fill in all required fields and set a password before creating an account');
      return;
    }

    setLoading(true);
    try {
      const registrationResponse = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerForm.username,
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
          email: registerForm.email,
          password: registerForm.password,
        }),
        credentials: 'include',
      });

      if (!registrationResponse.ok) {
        const errorData = await registrationResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Account creation failed');
      }

      const userData = await registrationResponse.json();
      setSuccess('Account created successfully. You can now add a passkey for easier login.');
      setAccountCreated(true);
      setCreatedUser(userData);
      register(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account creation failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a passkey to an existing account
  const handleAddPasskey = async () => {
    if (!accountCreated && !createdUser) {
      setError('Create an account first before adding a passkey');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await webAuthn.register({
        username: registerForm.username,
        displayName: `${registerForm.firstName} ${registerForm.lastName}`
      });

      setSuccess('Passkey registered successfully! You can now login with your passkey.');
      // Optionally refresh user info
      const resp = await fetch('/api/users/me', { method: 'GET', credentials: 'include' });
      if (resp.ok) {
        const userData = await resp.json();
        register(userData);
      }
      // reset local register form
      setRegisterForm({ username: '', firstName: '', lastName: '', email: '', password: '' });
      setAccountCreated(false);
      setCreatedUser(null);
      setTimeout(() => setActiveTab('login'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passkey registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Passkey Login
  const handlePasskeyLogin = async () => {
    if (!loginForm.username) {
      setError('Please enter your username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if passkeys exist for the user
      const passkeyCheckResponse = await fetch(`/api/users/${loginForm.username}/webauthn/credentials`);
      if (!passkeyCheckResponse.ok) {
        throw new Error('Failed to check for passkey existence.');
      }
      const hasPasskey = await passkeyCheckResponse.json();

      if (!hasPasskey) {
        setError('No passkey found for this account. Please login with your password first, then register a passkey.');
        setLoading(false);
        return;
      }

      // Proceed directly with challenge-based authentication
      await webAuthn.login({
        username: loginForm.username
      });

      // Fetch current user info
      const response = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        login(userData);
        setSuccess('Login successful!');
        setLoginForm({ username: '', password: '' });
      } else {
        throw new Error('Failed to fetch user information');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err || 'Passkey login failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Offer: save current passkey to the provided username
  const handleSavePasskeyForUsername = async () => {
    if (!offeredUsername) {
      setError('No username available to save the passkey');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await webAuthn.register({
        username: offeredUsername,
        displayName: offeredUsername,
      });

      // Optionally refresh user info
      const resp = await fetch('/api/users/me', { method: 'GET', credentials: 'include' });
      if (resp.ok) {
        const userData = await resp.json();
        register(userData);
      }

      setSuccess('Passkey saved to your account. You may now login with it.');
      setShowSavePasskeyOffer(false);
      setOfferedUsername('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save passkey');
    } finally {
      setLoading(false);
    }
  };

  // Handle register passkey from failed login (DEPRECATED - kept for reference)
  const handleRegisterPasskeyFromLogin = () => {
    // This is no longer used in the new flow
    // Pre-fill username in register form
    setRegisterForm({ ...registerForm, username: failedLoginUsername });
    setShowPasskeyNotFoundOptions(false);
    setError('');
    setActiveTab('register');
  };

  // Handle cross-device auth with QR code (DEPRECATED - kept for reference)
  const handleCrossDeviceAuth = () => {
    setShowQRCode(true);
    // In production, call backend to generate a session code for cross-device auth
    // backend should return a session ID that encodes the challenge
  };

  // Generate QR code (DEPRECATED - kept for reference)
  const generateQRCode = async () => {
    setError('');
    setLoading(true);
    try {
      // Placeholder: In production, call backend to create a cross-device session
      // Example: POST /api/users/webauthn/cross-device/start { username }
      // Response: { sessionId, challenge, qrUrl } or similar
      
      // For now, just show a message - real implementation would fetch QR from backend
      setSuccess('Scan this QR code with another device to authenticate.');
      // TODO: Display actual QR code from backend response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password-based Login
  const handlePasswordLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const userData = await response.json();
      setLoggedInUser(userData);
      setSuccess('Login successful!');
      
      // Show passkey registration prompt after successful password login
      setShowRegisterPasskeyPrompt(true);
      // Auto-login user context
      login(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Register passkey for logged-in user
  const handleRegisterPasskeyForLoggedInUser = async () => {
    if (!loggedInUser) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await webAuthn.register({
        username: loggedInUser.username,
        displayName: `${loggedInUser.firstName} ${loggedInUser.lastName}`
      });

      setSuccess('Passkey registered successfully!');
      setShowRegisterPasskeyPrompt(false);
      setLoggedInUser(null);
      setLoginForm({ username: '', password: '' });
      
      // Refresh user data
      const resp = await fetch('/api/users/me', { method: 'GET', credentials: 'include' });
      if (resp.ok) {
        const userData = await resp.json();
        login(userData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passkey registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Skip passkey registration
  const handleSkipPasskeyRegistration = () => {
    setShowRegisterPasskeyPrompt(false);
    setLoggedInUser(null);
    setLoginForm({ username: '', password: '' });
    setSuccess('');
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Tab */}
        {activeTab === 'login' && (
          <Card className="shadow-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Sign in with passkey or password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handlePasskeyLogin}
                  disabled={loading}
                  className="w-full"
                  variant="default"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                    <img src="/passkey_logo.jpg" alt="Passkey" className="mr-2 h-5 w-5 rounded" />
                  )}
                  Login with Passkey
                </Button>

                <Button
                  onClick={handlePasswordLogin}
                  disabled={loading || !loginForm.password}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Login with Password
                </Button>
              </div>

              {showSavePasskeyOffer && (
                <div className="mt-4 p-3 border rounded bg-yellow-50">
                  <p className="text-sm mb-2">Passkey not found for this account. Save this passkey to:</p>
                  <div className="flex gap-2">
                    <Input
                      value={offeredUsername}
                      onChange={(e) => setOfferedUsername(e.target.value)}
                      placeholder="username"
                      disabled={loading}
                    />
                    <Button onClick={handleSavePasskeyForUsername} disabled={loading} variant="default">Save</Button>
                    <Button onClick={() => { setShowSavePasskeyOffer(false); setOfferedUsername(''); }} disabled={loading} variant="outline">Cancel</Button>
                  </div>
                </div>
              )}

              {showRegisterPasskeyPrompt && loggedInUser && (
                <div className="mt-4 p-4 border rounded bg-green-50 space-y-3">
                  <p className="text-sm font-semibold text-gray-800">Great! You're logged in.</p>
                  <p className="text-sm text-gray-700">Would you like to register a passkey for faster login next time?</p>
                  <Button
                    onClick={handleRegisterPasskeyForLoggedInUser}
                    disabled={loading}
                    className="w-full"
                    variant="default"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                      <img src="/passkey_logo.jpg" alt="Passkey" className="mr-2 h-5 w-5 rounded" />
                    )}
                    Register Passkey Now
                  </Button>
                  <Button
                    onClick={handleSkipPasskeyRegistration}
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    Skip for Now
                  </Button>
                </div>
              )}

              {showQRCode && (
                <div className="mt-4 p-4 border rounded bg-amber-50 space-y-3">
                  <p className="text-sm font-semibold text-gray-800">Scan with another device</p>
                  <div className="flex justify-center p-4 bg-white border rounded">
                    {/* TODO: Replace with actual QR code image from backend */}
                    <div className="w-40 h-40 bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                      QR Code will appear here
                    </div>
                  </div>
                  <p className="text-xs text-gray-700">
                    Open Luxestore on another device and scan this code to authenticate.
                  </p>
                  <Button
                    onClick={generateQRCode}
                    disabled={loading}
                    className="w-full"
                    variant="default"
                  >
                    Generate QR Code
                  </Button>
                  <Button
                    onClick={() => {
                      setShowQRCode(false);
                      setShowPasskeyNotFoundOptions(true);
                    }}
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    Back
                  </Button>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => setActiveTab('register')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={loading}
                >
                  Don't have an account? Register
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Register Tab */}
        {activeTab === 'register' && (
          <Card className="shadow-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Register</CardTitle>
              <CardDescription>Create a new account — set a password first, then add a passkey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  type="text"
                  placeholder="Choose a username"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  type="text"
                  placeholder="Your first name"
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  type="text"
                  placeholder="Your last name"
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Button onClick={handleCreateAccount} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Account
                </Button>

                {accountCreated && (
                  <Button onClick={handleAddPasskey} disabled={loading} className="w-full" variant="outline">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                      <img src="/passkey_logo.jpg" alt="Passkey" className="mr-2 h-5 w-5 rounded" />
                    )}
                    Add Passkey
                  </Button>
                )}
              </div>

              <div className="text-center">
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={loading}
                >
                  Already have an account? Login
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
