"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface SignUpData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  otp: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [currentStep, setCurrentStep] = useState(1);
  const [signUpData, setSignUpData] = useState<SignUpData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [signInData, setSignInData] = useState<SignInData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn } = useAuth();
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateSignUpStep1 = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!signUpData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!signUpData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(signUpData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!signUpData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(signUpData.phone)) {
      newErrors.phone = 'Please enter a valid phone number with country code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUpStep2 = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!signUpData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(signUpData.password)) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (!signUpData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUpStep3 = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!signUpData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (signUpData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignIn = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!signInData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(signInData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!signInData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUpStep1 = () => {
    if (validateSignUpStep1()) {
      setCurrentStep(2);
      setErrors({});
    }
  };

  const handleSignUpStep2 = () => {
    if (validateSignUpStep2()) {
      setCurrentStep(3);
      setErrors({});
      // Simulate sending OTP
  // otp simulated
    }
  };

  const handleSignUpStep3 = async () => {
    if (validateSignUpStep3()) {
      setLoading(true);
      setErrors({});
      
      try {
        const result = await signUp(
          signUpData.name,
          signUpData.email,
          signUpData.phone,
          signUpData.password
        );
        
        if (result.success) {
          router.push('/');
        } else {
          setErrors({ general: result.error || 'Failed to create account' });
        }
      } catch (err) {
        setErrors({ general: 'An unexpected error occurred' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSignIn()) {
      setLoading(true);
      setErrors({});
      
      try {
        const result = await signIn(signInData.email, signInData.password);
        
        if (result.success) {
          router.push('/');
        } else {
          setErrors({ general: result.error || 'Failed to sign in' });
        }
      } catch (err) {
        setErrors({ general: 'An unexpected error occurred' });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSignUpData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      otp: ''
    });
    setSignInData({ email: '', password: '' });
    setErrors({});
  // reset otp state
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const renderSignInForm = () => (
    <form onSubmit={handleSignIn} className="space-y-6">
      <div>
        <label htmlFor="signin-email" className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          value={signInData.email}
          onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Enter your email"
        />
        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="signin-password" className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <input
          id="signin-password"
          type="password"
          value={signInData.password}
          onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            errors.password ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Enter your password"
        />
        {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
      </div>

      {errors.general && (
        <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {errors.general}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing In...
          </span>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );

  const renderSignUpStep1 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={signUpData.name}
          onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Enter your full name"
        />
        {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={signUpData.email}
          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Enter your email"
        />
        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
          Phone Number (with country code)
        </label>
        <input
          id="phone"
          type="tel"
          value={signUpData.phone}
          onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            errors.phone ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
      </div>

      <button
        onClick={handleSignUpStep1}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
      >
        Next
      </button>
    </div>
  );

  const renderSignUpStep2 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={signUpData.password}
          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            errors.password ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Create a password (min 8 characters)"
        />
        {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={signUpData.confirmPassword}
          onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
        >
          Back
        </button>
        <button
          onClick={handleSignUpStep2}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderSignUpStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-green-400 text-6xl mb-4">📧</div>
        <h3 className="text-lg font-semibold text-white mb-2">Verify Your Email</h3>
        <p className="text-gray-400 text-sm">
          We've sent a 6-digit OTP to <span className="text-green-400">{signUpData.email}</span>
        </p>
      </div>

      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
          Enter OTP
        </label>
        <input
          id="otp"
          type="text"
          value={signUpData.otp}
          onChange={(e) => setSignUpData({ ...signUpData, otp: e.target.value })}
          maxLength={6}
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest ${
            errors.otp ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="000000"
        />
        {errors.otp && <p className="text-red-400 text-sm mt-1">{errors.otp}</p>}
      </div>

      {errors.general && (
        <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {errors.general}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
        >
          Back
        </button>
        <button
          onClick={handleSignUpStep3}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </div>
  );

  const renderSignUpForm = () => {
    switch (currentStep) {
      case 1:
        return renderSignUpStep1();
      case 2:
        return renderSignUpStep2();
      case 3:
        return renderSignUpStep3();
      default:
        return renderSignUpStep1();
    }
  };

  const renderStepper = () => {
    if (mode === 'signin') return null;
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {step < currentStep ? '✓' : step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-green-600' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Step {currentStep} of 3
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl border border-green-500 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            ♻️ Go Green
          </h1>
          <p className="text-gray-400">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {renderStepper()}

        {mode === 'signin' ? renderSignInForm() : renderSignUpForm()}

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-green-400 hover:text-green-300 transition-colors duration-200"
          >
            {mode === 'signup' 
              ? 'Already have an account? Sign In' 
              : 'Don\'t have an account? Sign Up'
            }
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors duration-200">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
