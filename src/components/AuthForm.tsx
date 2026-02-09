// frontend/src/components/AuthForm.tsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { setAuthCookie, getAuthCookie, login, signup } from '@/services/auth';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (mode === 'signup' && !formData.name.trim()) {
      return 'Name is required';
    }
    if (!formData.email.trim()) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return 'Email is invalid';
    }
    if (!formData.password) {
      return 'Password is required';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        return 'Passwords do not match';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        // Call the actual backend login endpoint
        await login(formData.email, formData.password);
      } else {
        // Call the actual backend signup endpoint
        await signup(formData.email, formData.password, formData.name);
      }

      onSuccess();
    } catch (err: any) {
      console.error(`${mode} error:`, err);
      setError(err.message || `Failed to ${mode}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          {mode === 'signup' && (
            <div>
              <Label htmlFor="name" className="text-gray-700">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required={mode === 'signup'}
                className="py-5 px-4 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all input-focus"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-gray-700">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="py-5 px-4 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all input-focus"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="py-5 px-4 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all input-focus"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={mode === 'signup'}
                className="py-5 px-4 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all input-focus"
              />
            </div>
          )}
        </div>

        <div>
          {loading ? (
            <Button type="button" disabled className="w-full py-6 bg-indigo-400 text-white rounded-xl">
              <div className="animate-spin rounded-full h-4 w-4 mr-2 border-t-2 border-b-2 border-white"></div>
              Processing...
            </Button>
          ) : (
            <Button type="submit" className="w-full py-6 btn-gradient text-white rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg">
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

export default AuthForm;