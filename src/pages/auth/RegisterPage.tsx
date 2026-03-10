import React, { useState, Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquareIcon, ArrowRightIcon, CheckIcon } from 'lucide-react';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { registerUser } from './authApi';
const steps = ['Account', 'Company', 'Plan'];
export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [industry, setIndustry] = useState('ecommerce');
  const [teamSize, setTeamSize] = useState('1');

  const [planType, setPlanType] = useState('growth');

  const validateCurrentStep = () => {
    if (step === 0) {
      if (!firstName || !lastName || !email || !password) {
        setError('Please fill in all required account fields.');
        return false;
      }
    }

    if (step === 1) {
      if (!companyName) {
        setError('Company name is required.');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleNext = async () => {
    setSuccessMessage('');
    if (!validateCurrentStep()) {
      return;
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      try {
        setLoading(true);
        setError('');

        await registerUser({
          firstName,
          lastName,
          username: email,
          password,
          type: '',
          companyName,
          companyAddress,
          companyPhone,
          teamSize,
          industry,
          planType
        });

        setSuccessMessage('SignUp successful. Redirecting to login...');
        setTimeout(() => navigate('/login'), 900);
      } catch (registerError) {
        const message =
          registerError instanceof Error ?
            registerError.message :
            'Failed to register. Please try again.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-secondary)] p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-brand-green rounded-xl flex items-center justify-center">
            <MessageSquareIcon size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl text-[var(--text-primary)]">
            WhatsCRM
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) =>
            <Fragment key={s}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i < step ? 'bg-brand-green text-white' : i === step ? 'bg-brand-green text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'}`}>

                  {i < step ? <CheckIcon size={12} /> : i + 1}
                </div>
                <span
                  className={`text-sm font-medium ${i === step ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>

                  {s}
                </span>
              </div>
              {i < steps.length - 1 &&
                <div
                  className={`flex-1 h-0.5 max-w-12 ${i < step ? 'bg-brand-green' : 'bg-[var(--border-color)]'}`} />

              }
            </Fragment>
          )}
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-card">
          {step === 0 &&
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Create your account
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Start your 14-day free trial
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  placeholder="Alex"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required />
                <Input
                  label="Last Name"
                  placeholder="Johnson"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required />
              </div>
              <Input
                label="Work Email"
                type="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required />

              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                hint="Minimum 8 characters" />

            </div>
          }

          {step === 1 &&
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Company details
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Tell us about your business
                </p>
              </div>
              <Input
                label="Company Name"
                placeholder="Acme Commerce"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required />

              <Input
                label="Company Address"
                placeholder="Street, City"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)} />

              <Select
                label="Industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                options={[
                  {
                    value: 'ecommerce',
                    label: 'E-Commerce'
                  },
                  {
                    value: 'retail',
                    label: 'Retail'
                  },
                  {
                    value: 'services',
                    label: 'Services'
                  },
                  {
                    value: 'food',
                    label: 'Food & Beverage'
                  },
                  {
                    value: 'fashion',
                    label: 'Fashion & Apparel'
                  },
                  {
                    value: 'other',
                    label: 'Other'
                  }]
                } />

              <Select
                label="Team Size"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                options={[
                  {
                    value: '1',
                    label: 'Just me'
                  },
                  {
                    value: '2-5',
                    label: '2–5 people'
                  },
                  {
                    value: '6-20',
                    label: '6–20 people'
                  },
                  {
                    value: '20+',
                    label: '20+ people'
                  }]
                } />

              <Input
                label="WhatsApp Business Number"
                type="tel"
                placeholder="+1 555-234-5678"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                hint="You can add this later" />

            </div>
          }

          {step === 2 &&
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Choose your plan
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  All plans include a 14-day free trial
                </p>
              </div>
              <div className="space-y-3">
                {[
                  {
                    id: 'starter',
                    name: 'Starter',
                    price: '$29/mo',
                    features: [
                      '2 Agents',
                      '1,000 Conversations',
                      '5 Broadcasts'],

                    popular: false
                  },
                  {
                    id: 'growth',
                    name: 'Growth',
                    price: '$79/mo',
                    features: [
                      '10 Agents',
                      '10,000 Conversations',
                      '50 Broadcasts',
                      'Automation Builder'],

                    popular: true
                  },
                  {
                    id: 'enterprise',
                    name: 'Enterprise',
                    price: 'Custom',
                    features: [
                      'Unlimited Everything',
                      'Dedicated Support',
                      'SLA Guarantee'],

                    popular: false
                  }].
                  map((plan) =>
                    <label
                      key={plan.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${plan.popular ? 'border-brand-green bg-brand-green/5' : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'}`}>

                      <input
                        type="radio"
                        name="plan"
                        checked={planType === plan.id}
                        onChange={() => setPlanType(plan.id)}
                        className="mt-1" />

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {plan.name}
                          </p>
                          {plan.popular &&
                            <Badge variant="green">
                              Most Popular
                            </Badge>
                          }
                          <span className="ml-auto text-sm font-bold text-[var(--text-primary)]">
                            {plan.price}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          {plan.features.map((f) =>
                            <span
                              key={f}
                              className="text-xs text-[var(--text-muted)]">

                              ✓ {f}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  )}
              </div>
            </div>
          }

          {error &&
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          }

          {successMessage &&
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {successMessage}
            </div>
          }

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-color)]">
            {step > 0 ?
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Back
              </Button> :

              <div />
            }
            <Button
              loading={loading}
              onClick={handleNext}
              icon={
                step < steps.length - 1 ?
                  <ArrowRightIcon size={14} /> :
                  undefined
              }
              iconPosition="right">

              {step < steps.length - 1 ? 'Continue' : 'Start Free Trial'}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-green hover:underline font-medium">

            Sign in
          </Link>
        </p>
      </div>
    </div>);

}
function Badge({
  variant,
  children




}: { variant: string; children: React.ReactNode; }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variant === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700'}`}>

      {children}
    </span>);

}