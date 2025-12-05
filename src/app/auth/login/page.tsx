
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    setError(null);
    setMessage(null);
    setSignupStep(1);
  }, [mode]);

  const mapAuthError = (raw: string) => {
    const lower = raw.toLowerCase();
    if (lower.includes('already') || lower.includes('exists') || lower.includes('duplicate')) {
      return 'An account with this email already exists. Try signing in or reset your password.';
    }
    if (lower.includes('password') && lower.includes('required')) {
      return 'Password is required.';
    }
    return raw;
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset your password');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset email sent. Please check your inbox.');
    }
    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            business_name: businessName,
          }
        }
      });

      if (error) {
        setError(mapAuthError(error.message));
      } else {
        setMessage('Account created. Check your email for the confirmation link.');
      }
    } else { // login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh(); // Force a refresh to re-run middleware and AuthProvider logic
      }
    }
    setLoading(false);
  };

  const nextSignupStep = () => {
    if (signupStep === 1 && fullName && businessName) {
      setSignupStep(2);
    }
  };

  const prevSignupStep = () => {
    if (signupStep === 2) {
      setSignupStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="space-y-6 pb-8">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-semibold text-slate-900">
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </CardTitle>
              <p className="text-sm text-slate-600">
                {mode === 'login' 
                  ? 'Enter your credentials to access your account' 
                  : 'Get started with paeasybooks'}
              </p>
            </div>

            <div className="flex border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mode === 'login'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mode === 'signup'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign up
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleAuth} className="space-y-5">
              {mode === 'signup' && signupStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-slate-900">
                      Full name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      className="h-11 bg-white border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm font-medium text-slate-900">
                      Business name
                    </Label>
                    <Input
                      id="businessName"
                      type="text"
                      placeholder="Acme Corp"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      disabled={loading}
                      className="h-11 bg-white border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={nextSignupStep}
                    disabled={!fullName || !businessName}
                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {(mode === 'login' || (mode === 'signup' && signupStep === 2)) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-900">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="h-11 pl-10 bg-white border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium text-slate-900">
                        Password
                      </Label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-xs text-slate-600 hover:text-slate-900"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="h-11 pl-10 pr-10 bg-white border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === 'signup' && (
                      <p className="text-xs text-slate-500">
                        Minimum 8 characters
                      </p>
                    )}
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-900">
                        Confirm password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={loading}
                          className="h-11 pl-10 pr-10 bg-white border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-6" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-red-600">{error}</span>
                    </div>
                  )}
                  
                  {message && (
                    <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-green-600">{message}</span>
                    </div>
                  )}

                  {mode === 'signup' && signupStep === 2 && (
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={prevSignupStep}
                        variant="outline"
                        className="flex-1 h-11 border-slate-300"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create account'
                        )}
                      </Button>
                    </div>
                  )}

                  {mode === 'login' && (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign in'
                      )}
                    </Button>
                  )}
                </>
              )}
            </form>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-slate-500 text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy. This is a product of Octet Systems
        </p>
      </div>
    </div>
  );
}
    