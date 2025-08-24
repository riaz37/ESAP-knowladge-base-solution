"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { useAuthContext } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield } from 'lucide-react';

type AuthTab = 'login' | 'signup' | 'change-password';

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const { isAuthenticated, user, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  const handleAuthSuccess = () => {
    onAuthSuccess?.();
  };

  const handleLogout = () => {
    logout();
    setActiveTab('login');
  };

  // If user is authenticated, show user info and logout option
  if (isAuthenticated && user) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/20 backdrop-blur-xl rounded-lg border border-white/30 shadow-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <User className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Welcome back!</h2>
            <p className="text-emerald-300">{user.username}</p>
            <p className="text-sm text-gray-300">{user.email}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm text-gray-300">Account Status</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                user.is_active 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm text-gray-300">Member since</span>
              <span className="text-sm text-white">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Button
              onClick={() => setActiveTab('change-password')}
              variant="outline"
              className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
            >
              <Shield className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AuthTab)}>
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl">
          <TabsTrigger value="login" className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-300 data-[state=active]:border-emerald-500/50 text-white">Sign In</TabsTrigger>
          <TabsTrigger value="signup" className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-300 data-[state=active]:border-emerald-500/50 text-white">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={() => setActiveTab('signup')}
          />
        </TabsContent>

        <TabsContent value="signup">
          <SignupForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setActiveTab('login')}
          />
        </TabsContent>

        <TabsContent value="change-password">
          <ChangePasswordForm
            onSuccess={() => setActiveTab('login')}
            onCancel={() => setActiveTab('login')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 