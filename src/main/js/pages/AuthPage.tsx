import { useAuth } from '@/context/AuthContext';
import { PasskeyAuth } from '@/components/auth/PasskeyAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AuthPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return <PasskeyAuth />;
};

export default AuthPage;
