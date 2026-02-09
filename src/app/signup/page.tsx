'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import AuthForm from '@/components/AuthForm';

const SignupPage: React.FC = () => {
  const handleAuthSuccess = () => {
    // Redirect to tasks page after successful authentication
    window.location.href = '/tasks';
  };

  return (
    <div className="split-container">
      <div className="left-panel animate-fadeInUp">
        <div>
          <h1 className="text-5xl font-extrabold brand-gradient mb-4">Welcome to TickTask</h1>
          <p className="text-lg">
            TickTask helps you manage your daily tasks efficiently.<br/>
            Plan your work, set priorities,<br/>
            and track progress in one simple place.
          </p>
        </div>
      </div>
      <div className="right-panel">
        <div className="login-card animate-fadeInRight">
          <Card className="w-full glass-card rounded-2xl border-0 overflow-hidden shadow-none">
            <CardHeader className="text-center pb-4">
              <div className="text-center mb-6">
                <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                  <div className="h-6 w-6 bg-white rounded"></div>
                </div>
                <h1 className="text-2xl font-bold brand-gradient">Create your account to get started</h1>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-4">
              <AuthForm mode="signup" onSuccess={handleAuthSuccess} />
            </CardContent>

            <CardFooter className="px-6 pt-2 pb-6">
              <div className="mt-6 text-center text-sm text-gray-700">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-700 hover:text-indigo-900 font-medium hover:underline transition-colors">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;