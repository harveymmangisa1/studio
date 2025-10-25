'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Package, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Building,
  UserPlus,
  Smartphone,
  Shield,
  User,
  ArrowRight,
  Check,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState(mode === 'login' ? 'demo@stockpaeasy.com' : '');
  const [password, setPassword] = useState(mode === 'login' ? 'demo-password' : '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [signupStep, setSignupStep] = useState(1);
  const router = useRouter();

  // Reset form when mode changes
  useEffect(() => {
    if (mode === 'login') {
      setEmail('demo@stockpaeasy.com');
      setPassword('demo-password');
    } else {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setBusinessName('');
    }
    setError(null);
    setMessage(null);
    setSignupStep(1);
  }, [mode]);

  // Simulate progress for better UX
  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= (mode === 'login' ? 90 : 80)) {
            clearInterval(timer);
            return mode === 'login' ? 90 : 80;
          }
          return prev + (mode === 'login' ? 10 : 8);
        });
      }, 200);
      return () => clearInterval(timer);
    } else {
      setProgress(0);
    }
  }, [loading, mode]);

  const validateForm = () => {
    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Full name is required');
        return false;
      }
      if (!businessName.trim()) {
        setError('Business name is required');
        return false;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    setCurrentStep(2);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (error) {
          setError(error.message);
          setCurrentStep(1);
        } else {
          setMessage('Login successful! Redirecting...');
          setCurrentStep(3);
          setProgress(100);
          
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      } else {
        // Signup flow
        setSignupStep(2); // Creating account
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              business_name: businessName,
            }
          }
        });

        if (authError) {
          setError(authError.message);
          setSignupStep(1);
        } else {
          setSignupStep(3); // Account created
          setProgress(100);
          setMessage('Account created successfully! Check your email to verify your account.');
          
          // Optional: Auto-login after signup
          setTimeout(() => {
            setMode('login');
          }, 3000);
        }
      }
    } catch (error: any) {
      setError(error.message);
      setCurrentStep(1);
      setSignupStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setMode('login');
    setEmail('demo@stockpaeasy.com');
    setPassword('demo-password');
    setTimeout(() => {
      const form = document.querySelector('form');
      form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 300);
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

  const getStepTitle = () => {
    if (mode === 'login') {
      return currentStep === 3 ? 'Welcome Back!' : 'Sign In to Your Account';
    } else {
      return signupStep === 3 ? 'Almost There!' : 'Create Your Account';
    }
  };

  const getStepDescription = () => {
    if (mode === 'login') {
      return currentStep === 3 
        ? 'Successfully authenticated. Redirecting to your dashboard...'
        : 'Use your credentials or demo account to access your business dashboard.';
    } else {
      return signupStep === 3
        ? 'We sent a verification link to your email. Please verify to complete your registration.'
        : 'Join thousands of businesses managing their inventory with StockPaEasy.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-900 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Progress Bar */}
        {loading && (
          <div className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {mode === 'login' ? (
                  <>
                    {currentStep === 1 && 'Preparing...'}
                    {currentStep === 2 && 'Authenticating...'}
                    {currentStep === 3 && 'Redirecting...'}
                  </>
                ) : (
                  <>
                    {signupStep === 1 && 'Account Details...'}
                    {signupStep === 2 && 'Creating Account...'}
                    {signupStep === 3 && 'Finalizing...'}
                  </>
                )}
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <Card className="w-full border-0 shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-slate-800/90">
          <CardHeader className="text-center space-y-4 pb-8">
            {/* App Logo & Brand */}
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StockPaEasy
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
                {getStepTitle()}
              </CardDescription>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {getStepDescription()}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Status Indicators */}
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <Shield className="w-4 h-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <Building className="w-4 h-4" />
                <span>Multi-tenant</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                <Smartphone className="w-4 h-4" />
                <span>Responsive</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Demo Banner for Login */}
            {mode === 'login' && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                      Demo Access Available
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                      Explore all features with pre-configured demo data. Perfect for testing and evaluation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Signup Progress for Multi-step */}
            {mode === 'signup' && signupStep > 1 && (
              <div className="flex items-center justify-center space-x-4 text-sm">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      signupStep >= step
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {signupStep > step ? <Check className="w-4 h-4" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-8 h-0.5 ${
                        signupStep > step ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              {/* Signup Step 1: Personal & Business Info */}
              {mode === 'signup' && signupStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Full Name</span>
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      className="pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm font-medium flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>Business Name</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="businessName"
                        type="text"
                        placeholder="My Awesome Business"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        disabled={loading}
                        className="pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      />
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={nextSignupStep}
                    disabled={!fullName || !businessName}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Email & Password Fields (Login or Signup Step 2) */}
              {(mode === 'login' || (mode === 'signup' && signupStep >= 2)) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium flex items-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>Password</span>
                      </Label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="pl-10 pr-12 py-3 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === 'signup' && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Must be at least 8 characters
                      </p>
                    )}
                  </div>

                  {/* Confirm Password for Signup */}
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>Confirm Password</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={loading}
                          className="pl-10 pr-12 py-3 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Remember Me & Quick Actions */}
                  {mode === 'login' && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                      </label>
                      
                      <button
                        type="button"
                        onClick={handleQuickDemo}
                        disabled={loading}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors disabled:opacity-50"
                      >
                        Auto-fill Demo
                      </button>
                    </div>
                  )}

                  {/* Signup Navigation */}
                  {mode === 'signup' && signupStep === 2 && (
                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        onClick={prevSignupStep}
                        variant="outline"
                        className="flex-1 py-3"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Status Messages */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </div>
              )}

              {message && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-green-700 dark:text-green-300">{message}</span>
                </div>
              )}

              {/* Submit Buttons */}
              {((mode === 'login') || (mode === 'signup' && signupStep === 2)) && (
                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {mode === 'login' ? (
                          <>
                            {currentStep === 1 && 'Preparing...'}
                            {currentStep === 2 && 'Signing In...'}
                            {currentStep === 3 && 'Redirecting...'}
                          </>
                        ) : (
                          'Creating Account...'
                        )}
                      </>
                    ) : (
                      mode === 'login' ? 'Sign In to Your Account' : 'Create Account'
                    )}
                  </Button>

                  {mode === 'login' && (
                    <Button
                      type="button"
                      onClick={handleQuickDemo}
                      disabled={loading}
                      variant="outline"
                      className="w-full py-3 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Quick Demo Login
                    </Button>
                  )}
                </div>
              )}
            </form>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto">
                  <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Inventory Management</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto">
                  <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Multi-business</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors inline-flex items-center space-x-1"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{mode === 'login' ? 'Sign Up Free' : 'Sign In'}</span>
                </button>
              </p>
            </div>
            
            {/* Security Badge */}
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <Shield className="w-3 h-3" />
              <span>Enterprise-grade security • GDPR compliant</span>
            </div>
          </CardFooter>
        </Card>

        {/* Demo Credentials Card for Login */}
        {mode === 'login' && (
          <Card className="mt-6 border-0 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-2">
                    Demo Credentials
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 dark:text-slate-400">Email:</span>
                      <div className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">
                        demo@stockpaeasy.com
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 dark:text-slate-400">Password:</span>
                      <div className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">
                        demo-password
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}