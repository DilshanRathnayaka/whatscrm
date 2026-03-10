import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MessageSquareIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon
} from
  'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import type { Company, User } from '../../types';
import { getCompanyByUsername, loginUser } from './authApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateLoginForm = (username: string, password: string) => {
  if (!username || !password) {
    return 'Please fill in all fields.';
  }

  if (!EMAIL_REGEX.test(username)) {
    return 'Please enter a valid email address.';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return '';
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    const validationMessage = validateLoginForm(trimmedUsername, password);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setLoading(true);
      const loginResponse = await loginUser({ username: trimmedUsername, password });
      if (loginResponse.trim() !== 'Login successful') {
        setError(loginResponse || 'Login failed. Please try again.');
        return;
      }

      const companyPayload = await getCompanyByUsername(trimmedUsername);
      const resolvedUser: User = {
        id: String(companyPayload.id ?? trimmedUsername),
        name: `${companyPayload.firstName ?? ''} ${companyPayload.lastName ?? ''}`.trim() ||
          trimmedUsername,
        email: companyPayload.username ?? trimmedUsername,
        role: 'owner',
        status: 'online',
        createdAt: new Date().toISOString()
      };
      const resolvedCompany: Company = {
        id: String(companyPayload.companyId ?? '1'),
        name: companyPayload.companyName ?? 'Company',
        plan: 'growth',
        whatsappConnected: false,
        phoneNumber: companyPayload.companyPhone ?? undefined
      };

      window.localStorage.setItem('authUsername', trimmedUsername);
      login(resolvedUser, resolvedCompany);
      navigate('/dashboard', {
        state: {
          username: trimmedUsername,
          skipCompanySync: true
        }
      });
    } catch (loginError) {
      const message =
        loginError instanceof Error ?
          loginError.message :
          'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full flex bg-[var(--bg-secondary)]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--sidebar-bg)] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center">
            <MessageSquareIcon size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">WhatsCRM</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Grow your business
            <br />
            <span className="text-brand-green">with WhatsApp</span>
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            The all-in-one platform for WhatsApp automation, CRM, and
            e-commerce.
          </p>

          <div className="space-y-4">
            {[
              {
                label: '50,000+ businesses',
                sub: 'trust WhatsCRM daily'
              },
              {
                label: '2M+ messages sent',
                sub: 'every single day'
              },
              {
                label: '99.9% uptime',
                sub: 'enterprise-grade reliability'
              }].
              map((stat) =>
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-green flex-shrink-0" />
                  <div>
                    <span className="text-white font-semibold">{stat.label}</span>
                    <span className="text-slate-400 ml-2">{stat.sub}</span>
                  </div>
                </div>
              )}
          </div>
        </div>

        <p className="text-slate-600 text-sm">
          © 2024 WhatsCRM. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
              <MessageSquareIcon size={16} className="text-white" />
            </div>
            <span className="font-bold text-[var(--text-primary)]">
              WhatsCRM
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Welcome back
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="you@company.com"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              required />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}>

                  {showPassword ?
                    <EyeOffIcon size={16} /> :

                    <EyeIcon size={16} />
                  }
                </button>
              } />


            {error &&
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            }

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-[var(--border-color)]" />

                <span className="text-[var(--text-secondary)]">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-brand-green hover:underline font-medium">

                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              icon={<ArrowRightIcon size={16} />}
              iconPosition="right">

              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-brand-green hover:underline font-medium">

              Start free trial
            </Link>
          </p>

        </div>
      </div>
    </div>);

}