import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircleIcon,
  CircleIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  PhoneIcon
} from
  'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { buildWhatsAppApiUrl } from '../../config/api';
import { apiFetch } from '../../services/http';
import { useAppStore } from '../../store/useAppStore';

type SetupStep =
  'meta' |
  'business' |
  'phone';

const steps: {
  id: SetupStep;
  label: string;
  desc: string;
}[] = [
    {
      id: 'meta',
      label: 'Connect Meta Account',
      desc: 'Authorize with Facebook/Meta'
    },
    {
      id: 'business',
      label: 'Select Business Manager',
      desc: 'Choose your Meta Business Manager'
    },
    {
      id: 'phone',
      label: 'Add WhatsApp Number',
      desc: 'Register your business phone number'
    }
  ];

type ApiMessage = {
  type: 'success' | 'error';
  text: string;
};

type WhatsAppConnectionInfo = {
  id?: number;
  businessName?: string;
  displayName?: string;
  phoneNumber?: string;
  phoneNumberId?: string;
  wabaId?: string;
  businessManagerId?: string;
  accessToken?: string;
  verifyToken?: string;
  webhookConfigured?: boolean;
  templateApproved?: boolean;
  lastSyncTime?: string;
  createdAt?: string;
  step?: string;
  webhookUrl?: string;
  lastSync?: string;
  status?: string;
  [key: string]: unknown;
};

const parseTenantId = (companyId: string | undefined) => {
  if (!companyId) return 1;
  const digits = companyId.replace(/\D/g, '');
  return digits ? Number(digits) : 1;
};

const toConnectionInfo = (payload: unknown): WhatsAppConnectionInfo => {
  if (!payload || typeof payload !== 'object') {
    return { lastSync: new Date().toLocaleString(), status: 'connected' };
  }

  const data = payload as Record<string, unknown>;
  const status = (data.status ?? 'disconnected') as string;

  const toBoolean = (value: unknown) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return false;
  };

  const normalizeDateTime = (value: unknown) => {
    if (!value) return undefined;
    const parsed = new Date(String(value));
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleString();
  };

  return {
    ...data,
    id: typeof data.id === 'number' ? data.id : undefined,
    businessName: (data.businessName ?? '') as string,
    displayName: (data.businessName ?? data.displayName ?? data.name ?? 'WhatsApp Business') as string,
    phoneNumber: (data.phoneNumber ?? data.phone ?? '—') as string,
    phoneNumberId: (data.phoneNumberId ?? '') as string,
    wabaId: (data.wabaId ?? '') as string,
    businessManagerId: (data.businessManagerId ?? '') as string,
    accessToken: (data.accessToken ?? '') as string,
    verifyToken: (data.verifyToken ?? '') as string,
    webhookConfigured: toBoolean(data.webhookConfigured),
    templateApproved: toBoolean(data.templateApproved),
    lastSyncTime: normalizeDateTime(data.lastSyncTime),
    createdAt: normalizeDateTime(data.createdAt),
    step: typeof data.step === 'string' ? data.step : undefined,
    webhookUrl: (data.webhookUrl ?? '') as string,
    lastSync: normalizeDateTime(data.lastSyncTime) ?? new Date().toLocaleString(),
    status
  };
};

const deriveCompletedSteps = (info: WhatsAppConnectionInfo | null): SetupStep[] => {
  if (!info) return [];

  const completed = new Set<SetupStep>();
  const stepLabel = (info.step ?? '').toUpperCase();

  if (stepLabel === 'COMPLETED') {
    return steps.map((step) => step.id);
  }

  const match = /^STEP_(\d+)_COMPLETED$/.exec(stepLabel);
  const sequentialCount = match ? Math.min(Number(match[1]), steps.length) : 0;

  steps.slice(0, sequentialCount).forEach((step) => completed.add(step.id));

  if (String(info.status ?? '').toLowerCase() === 'connected') {
    completed.add('meta');
  }

  return Array.from(completed);
};

export function WhatsAppSetupPage() {
  const company = useAppStore((state) => state.company);
  const tenantId = useMemo(() => parseTenantId(company?.id), [company?.id]);

  const [currentStep, setCurrentStep] = useState<SetupStep>('meta');
  const [completedSteps, setCompletedSteps] = useState<SetupStep[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<WhatsAppConnectionInfo | null>(null);
  const [message, setMessage] = useState<ApiMessage | null>(null);
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSavingPhoneSetup, setIsSavingPhoneSetup] = useState(false);
  const [isSavingVerifyToken, setIsSavingVerifyToken] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const request = async <T,>(
    endpoint: string,
    options?: RequestInit)
    : Promise<T> => {
    const resolvedCompanyId = String(tenantId || 1);
    const endpointWithCompanyId = endpoint.includes('?') ?
      `${endpoint}&companyId=${encodeURIComponent(resolvedCompanyId)}` :
      `${endpoint}?companyId=${encodeURIComponent(resolvedCompanyId)}`;

    const response = await apiFetch(buildWhatsAppApiUrl(endpointWithCompanyId), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {})
      },
      includeCompanyIdHeader: false,
      includeCredentials: true
    });

    const contentType = response.headers.get('content-type') ?? '';
    const raw = contentType.includes('application/json') ?
      await response.json() :
      await response.text();

    if (!response.ok) {
      const errorMessage =
        typeof raw === 'string' && raw.trim().length > 0 ?
          raw :
          `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return raw as T;
  };

  const handleConnect = async () => {
    setMessage(null);
    setIsConnecting(true);
    try {
      const trimmedAppId = appId.trim();
      const trimmedAppSecret = appSecret.trim();

      if (!trimmedAppId || !trimmedAppSecret) {
        throw new Error('App ID and App Secret are required');
      }

      await request<string>(
        `/save-secret-appid?appId=${encodeURIComponent(trimmedAppId)}&appSecret=${encodeURIComponent(trimmedAppSecret)}`,
        { method: 'POST' }
      );

      const result = await request<{ redirectUrl: string }>(
        `/connect`,
        { method: 'GET' }
      );

      if (!result?.redirectUrl) {
        throw new Error('Meta redirect URL was not returned by the server');
      }

      window.location.href = result.redirectUrl;
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error ?
            error.message :
            'Unable to start Meta connection'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    setMessage(null);
    setIsSyncing(true);
    try {
      const result = await request<unknown>('/sync', {
        method: 'POST'
      });
      const info = toConnectionInfo(result);
      setAccount(info);
      setIsConnected(info.status !== 'disconnected');
      setMessage({ type: 'success', text: 'Business info synced successfully' });
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Unable to sync business info'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSavePhoneSetup = async () => {
    setMessage(null);
    setIsSavingPhoneSetup(true);

    try {
      const trimmedPhoneNumberId = phoneNumberId.trim();
      const trimmedPhoneNumber = phoneNumber.trim();

      if (!trimmedPhoneNumberId || !trimmedPhoneNumber) {
        throw new Error('Phone Number ID and Phone Number are required');
      }

      await request<string>(
        `/save-phone-number-id?phoneNumberId=${encodeURIComponent(trimmedPhoneNumberId)}&phoneNumber=${encodeURIComponent(trimmedPhoneNumber)}`,
        { method: 'POST' }
      );

      setCurrentStep('phone');
      setMessage({ type: 'success', text: 'Phone setup saved successfully' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to save phone setup'
      });
    } finally {
      setIsSavingPhoneSetup(false);
    }
  };

  const handleDisconnect = async () => {
    setMessage(null);
    setIsDisconnecting(true);
    try {
      await request<string>('/disconnect', { method: 'POST' });
      setIsConnected(false);
      setAccount(null);
      setCurrentStep('meta');
      setMessage({ type: 'success', text: 'Disconnected successfully' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to disconnect'
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSaveVerifyToken = async () => {
    setMessage(null);
    setIsSavingVerifyToken(true);

    try {
      const trimmedVerifyToken = verifyToken.trim();
      if (!trimmedVerifyToken) {
        throw new Error('Verify Token is required');
      }

      await request<string>(
        `/verify-token?verifyToken=${encodeURIComponent(trimmedVerifyToken)}`,
        { method: 'POST' }
      );

      setCurrentStep('phone');
      setMessage({ type: 'success', text: 'Verify token saved successfully' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to save verify token'
      });
    } finally {
      setIsSavingVerifyToken(false);
    }
  };

  useEffect(() => {
    const loadAccountInfo = async () => {
      try {
        const payload = await request<unknown>('/account-info', { method: 'GET' });
        const info = toConnectionInfo(payload);

        setAccount(info);
        setIsConnected(String(info.status ?? '').toLowerCase() === 'connected');
      } catch (error) {
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Unable to load account info'
        });
      }
    };

    void loadAccountInfo();
  }, [tenantId]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    if (!code) return;

    const runCallback = async () => {
      setMessage(null);
      try {
        await request<string>(
          `/callback?code=${encodeURIComponent(code)}`,
          { method: 'GET' }
        );

        setIsConnected(true);
        setCurrentStep('business');
        setMessage({ type: 'success', text: 'Connected successfully' });
      } catch (error) {
        setMessage({
          type: 'error',
          text:
            error instanceof Error ?
              error.message :
              'Meta callback verification failed'
        });
      } finally {
        const nextUrl = `${window.location.pathname}${window.location.hash}`;
        window.history.replaceState({}, document.title, nextUrl);
      }
    };

    void runCallback();
  }, [tenantId]);

  useEffect(() => {
    const done = deriveCompletedSteps(account);
    setCompletedSteps(done);

    if (!account) {
      return;
    }

    const firstPending = steps.find((step) => !done.includes(step.id));
    if (!firstPending) {
      return;
    }

    if (done.includes(currentStep) || (currentStep === 'meta' && done.includes('meta'))) {
      setCurrentStep(firstPending.id);
    }
  }, [account, currentStep]);

  const getStepStatus = (stepId: SetupStep) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const isSetupCompleted = (account?.step ?? '').toUpperCase() === 'COMPLETED';
  const isStep3Completed = (account?.step ?? '').toUpperCase() === 'STEP_3_COMPLETED';
  const progressPercent =
    isSetupCompleted ?
      100 :
      isStep3Completed ?
        90 :
        Math.round(completedSteps.length / steps.length * 100);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            WhatsApp Setup
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Connect your WhatsApp Business account
          </p>
        </div>
        <Badge variant={isConnected ? 'green' : 'red'} dot size="md">
          {account?.status || (isConnected ? 'Connected' : 'Disconnected')}
        </Badge>
      </div>

      {message &&
        <div
          className={`rounded-xl border p-3 text-sm ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' : 'bg-brand-green/10 border-brand-green/30 text-brand-green'}`}>

          {message.text}
        </div>
      }

      {/* Connection status card */}
      {isConnected &&
        <Card className="border-brand-green/30 bg-brand-green/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-green rounded-xl flex items-center justify-center">
                <PhoneIcon size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">
                  {account?.displayName ?? 'WhatsApp Business'}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {account?.phoneNumber ?? '—'}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Last sync: {account?.lastSync ?? 'Not synced yet'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<RefreshCwIcon size={14} />}
                onClick={handleSync}
                disabled={isSyncing || isDisconnecting}>

                {isSyncing ? 'Syncing...' : 'Sync'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting || isSyncing}>

                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </div>
          </div>
        </Card>
      }

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Steps sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader
              title="Setup Progress"
              subtitle={`${completedSteps.length}/${steps.length} completed`} />

            <div className="space-y-1">
              {steps.map((step) => {
                const status = getStepStatus(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={isSetupCompleted}
                    onClick={() => {
                      if (isSetupCompleted) return;
                      setCurrentStep(step.id);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${status === 'current' ? 'bg-brand-green/10' : 'hover:bg-[var(--bg-secondary)]'} ${isSetupCompleted ? 'opacity-60 cursor-not-allowed hover:bg-transparent' : ''}`}>

                    <div className="flex-shrink-0">
                      {status === 'completed' ?
                        <CheckCircleIcon
                          size={18}
                          className="text-brand-green" /> :

                        status === 'current' ?
                          <div className="w-[18px] h-[18px] rounded-full border-2 border-brand-green flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-brand-green" />
                          </div> :

                          <CircleIcon
                            size={18}
                            className="text-[var(--text-muted)]" />

                      }
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-medium ${status === 'current' ? 'text-brand-green' : status === 'completed' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>

                        {step.label}
                      </p>
                    </div>
                  </button>);

              })}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
              <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1.5">
                <span>Progress</span>
                <span>
                  {progressPercent}%
                </span>
              </div>
              <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full">
                <div
                  className="h-1.5 bg-brand-green rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`
                  }} />

              </div>
            </div>
          </Card>
        </div>

        {/* Step content */}
        <div className="lg:col-span-2">
          {isSetupCompleted &&
            <Card>
              <CardHeader
                title="Setup Completed"
                subtitle="Your WhatsApp setup is fully completed." />

              <div className="p-4 bg-brand-green/10 border border-brand-green/30 rounded-xl text-sm text-brand-green">
                All setup steps are completed. Your WhatsApp Business account is
                ready to use.
              </div>
            </Card>
          }

          {!isSetupCompleted && isStep3Completed &&
            <Card>
              <CardHeader
                title="Setup Complete"
                subtitle="Setup is complete. Sync now to finalize business info." />

              <div className="space-y-4">
                <div className="p-4 bg-brand-green/10 border border-brand-green/30 rounded-xl text-sm text-brand-green">
                  Setup is complete. Click sync now to fetch the latest WhatsApp
                  business details.
                </div>
                <Button
                  icon={<RefreshCwIcon size={14} />}
                  onClick={handleSync}
                  loading={isSyncing}
                  disabled={isDisconnecting}>

                  Sync Now
                </Button>
              </div>
            </Card>
          }

          {!isSetupCompleted && !isStep3Completed && currentStep === 'meta' &&
            <Card>
              <CardHeader
                title="Connect Meta Business Account"
                subtitle="Authorize WhatsCRM to access your Meta account" />

              <div className="space-y-4">
                <Input
                  label="App ID"
                  placeholder="Enter Meta App ID"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  required />

                <Input
                  label="App Secret"
                  type="password"
                  placeholder="Enter Meta App Secret"
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value)}
                  required />

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    First we save your App ID and App Secret. Then you'll be
                    redirected to Meta's authorization page.
                  </p>
                </div>
                <Button
                  icon={<ExternalLinkIcon size={14} />}
                  fullWidth
                  onClick={handleConnect}
                  disabled={isConnecting}>

                  {isConnecting ? 'Connecting...' : 'Connect with Meta'}
                </Button>
              </div>
            </Card>
          }

          {!isSetupCompleted && !isStep3Completed && (currentStep === 'business' || currentStep === 'phone') &&
            <Card>
              <CardHeader
                title={
                  currentStep === 'business' ?
                    'Phone Configuration' :
                    'Verify Token'
                }
                subtitle={
                  currentStep === 'business' ?
                    'Save your Phone Number ID and Phone Number' :
                    'Save your verify token for webhook validation'
                } />

              <div className="space-y-4">
                {currentStep === 'business' ?
                  <div className="space-y-2">
                    <Input
                      label="Phone Number ID"
                      placeholder="Enter Phone Number ID"
                      value={phoneNumberId}
                      onChange={(e) => setPhoneNumberId(e.target.value)}
                      required />

                    <Input
                      label="Phone Number"
                      placeholder="+1 555-234-5678"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required />
                  </div> :

                  <Input
                    label="Verify Token"
                    placeholder="Enter verify token"
                    value={verifyToken}
                    onChange={(e) => setVerifyToken(e.target.value)}
                    required />

                }
                <Button
                  loading={
                    currentStep === 'business' ?
                      isSavingPhoneSetup :
                      isSavingVerifyToken
                  }
                  disabled={isSetupCompleted}
                  onClick={() => {
                    if (currentStep === 'business') {
                      void handleSavePhoneSetup();
                      return;
                    }

                    void handleSaveVerifyToken();
                  }}>

                  Continue
                </Button>
              </div>
            </Card>
          }
        </div>
      </div>
    </div>);

}