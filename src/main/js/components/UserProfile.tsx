import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, User, Calendar, KeyRound, Loader2, Info } from 'lucide-react';
import { WebAuthn } from './auth/Webauthn';
import { useToast } from '../hooks/use-toast';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasPasskey, setHasPasskey] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (user?.username) {
      const checkPasskey = async () => {
        setIsChecking(true);
        try {
          const response = await fetch(`/api/users/${user.username}/webauthn/credentials`);
          if (response.ok) {
            const data = await response.json();
            setHasPasskey(data);
          } else {
            setHasPasskey(false);
          }
        } catch (error) {
          console.error('Error checking for passkey:', error);
          setHasPasskey(false);
        } finally {
          setIsChecking(false);
        }
      };
      checkPasskey();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleRegisterPasskey = async () => {
    setIsRegistering(true);
    try {
      const webAuthn = new WebAuthn();
      await webAuthn.register(user);
      setHasPasskey(true);
      toast({
        title: 'Passkey Registered!',
        description: 'You can now use your passkey to log in.',
      });
    } catch (error) {
      console.error('Passkey registration failed:', error);
      toast({
        title: 'Registration Failed',
        description: 'Could not register passkey. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{user.firstName} {user.lastName}</CardTitle>
            <CardDescription>@{user.username}</CardDescription>
          </div>
          <Badge variant="secondary" className="h-fit">
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium">{user.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">{joinDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user.id}</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-medium">#{user.id}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Security</h3>
          {isChecking ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking passkey status...</span>
            </div>
          ) : hasPasskey === true ? (
            <Alert variant="default">
              <KeyRound className="h-4 w-4" />
              <AlertTitle>Passkey Active</AlertTitle>
              <AlertDescription>
                You have a passkey registered with this account.
              </AlertDescription>
            </Alert>
          ) : hasPasskey === false ? (
             <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Register a Passkey</AlertTitle>
              <AlertDescription>
                You don't have a passkey registered. Add one for faster, more secure logins.
              </AlertDescription>
              <div className="mt-4">
                <Button onClick={handleRegisterPasskey} disabled={isRegistering}>
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <KeyRound className="mr-2 h-4 w-4" />
                  )}
                  Register a Passkey
                </Button>
              </div>
            </Alert>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
