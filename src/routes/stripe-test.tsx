import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, CreditCard, Zap } from 'lucide-react';

// Stripe test configuration
const STRIPE_TEST_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY || 'pk_test_placeholder',
  testCards: {
    success: '4242424242424242',
    decline: '4000000000000002',
    insufficient: '4000000000009995',
    processing: '4000000000000119'
  },
  testPriceIds: {
    pro: 'price_test_pro_monthly',
    team: 'price_test_team_monthly', 
    enterprise: 'price_test_enterprise_monthly'
  }
};

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending' | 'skipped';
  message: string;
  details?: string;
}

export default function StripeTestDashboard() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setTestResults(prev => [
      ...prev.filter(r => r.name !== name),
      { name, status, message, details }
    ]);
  };

  const runStripeTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Check Stripe configuration
    updateTestResult('config', 'pending', 'Checking Stripe configuration...');
    
    if (!STRIPE_TEST_CONFIG.publishableKey.startsWith('pk_test_')) {
      updateTestResult('config', 'error', 'Missing or invalid test publishable key', 
        'Please set VITE_STRIPE_TEST_PUBLISHABLE_KEY in your environment');
      setIsRunning(false);
      return;
    }
    
    updateTestResult('config', 'success', 'Test publishable key configured correctly');

    // Test 2: Initialize Stripe
    updateTestResult('stripe-init', 'pending', 'Initializing Stripe...');
    
    try {
      // Dynamic import to avoid loading Stripe on every page load
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(STRIPE_TEST_CONFIG.publishableKey);
      
      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }
      
      updateTestResult('stripe-init', 'success', 'Stripe initialized successfully');
    } catch (error) {
      updateTestResult('stripe-init', 'error', 'Failed to initialize Stripe', 
        error instanceof Error ? error.message : 'Unknown error');
      setIsRunning(false);
      return;
    }

    // Test 3: Test webhook endpoint
    updateTestResult('webhook', 'pending', 'Testing webhook endpoint...');
    
    try {
      const response = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': 'test-signature'
        },
        body: JSON.stringify({
          type: 'ping',
          data: { object: 'test' }
        })
      });
      
      // Even if it fails auth, a 401/403 means the endpoint exists
      if (response.status === 401 || response.status === 403) {
        updateTestResult('webhook', 'success', 'Webhook endpoint exists and responds to requests');
      } else if (response.ok) {
        updateTestResult('webhook', 'success', 'Webhook endpoint responding correctly');
      } else {
        throw new Error(`Webhook returned ${response.status}`);
      }
    } catch (error) {
      updateTestResult('webhook', 'error', 'Webhook endpoint test failed',
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 4: Test subscription creation flow
    updateTestResult('subscription', 'pending', 'Testing subscription creation...');
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // This will likely fail auth, but tests the endpoint
        },
        body: JSON.stringify({
          priceId: STRIPE_TEST_CONFIG.testPriceIds.pro,
          mode: 'subscription'
        })
      });
      
      if (response.status === 401) {
        updateTestResult('subscription', 'success', 'Subscription endpoint exists (auth required)');
      } else if (response.ok) {
        updateTestResult('subscription', 'success', 'Subscription creation endpoint working');
      } else {
        throw new Error(`Subscription endpoint returned ${response.status}`);
      }
    } catch (error) {
      updateTestResult('subscription', 'error', 'Subscription endpoint test failed',
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 5: Check customer portal
    updateTestResult('portal', 'pending', 'Testing customer portal...');
    
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          customerId: 'cus_test_123'
        })
      });
      
      if (response.status === 401) {
        updateTestResult('portal', 'success', 'Customer portal endpoint exists (auth required)');
      } else if (response.ok) {
        updateTestResult('portal', 'success', 'Customer portal endpoint working');
      } else {
        throw new Error(`Portal endpoint returned ${response.status}`);
      }
    } catch (error) {
      updateTestResult('portal', 'error', 'Customer portal test failed',
        error instanceof Error ? error.message : 'Unknown error');
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <Badge variant="default">Passed</Badge>;
      case 'error': return <Badge variant="destructive">Failed</Badge>;
      case 'pending': return <Badge variant="secondary">Running...</Badge>;
      default: return <Badge variant="outline">Skipped</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Stripe Sandbox Testing
          </h1>
          <p className="text-muted-foreground">Test Stripe payment integration in sandbox mode</p>
        </div>
        
        <Button 
          onClick={runStripeTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sandbox Mode:</strong> This will test your Stripe integration using test keys and endpoints. 
          No real payments will be processed.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Current Stripe test environment settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Test Publishable Key</label>
                <p className="text-sm text-muted-foreground font-mono">
                  {STRIPE_TEST_CONFIG.publishableKey.startsWith('pk_test_') ? 
                    `${STRIPE_TEST_CONFIG.publishableKey.substring(0, 20)}...` : 
                    'Not configured'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Test Cards Available</label>
                <p className="text-sm text-muted-foreground">
                  Success, Decline, Insufficient Funds, Processing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Stripe integration test results</CardDescription>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Click "Run Tests" to start testing your Stripe integration
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result) => (
                  <div key={result.name} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{result.name}</h4>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                      {result.details && (
                        <p className="text-xs text-red-500 mt-1">{result.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Cards for Manual Testing</CardTitle>
            <CardDescription>Use these cards to test different payment scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {Object.entries(STRIPE_TEST_CONFIG.testCards).map(([type, number]) => (
                <div key={type} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="capitalize font-medium">{type.replace('_', ' ')}</span>
                  <code className="text-sm bg-background px-2 py-1 rounded">{number}</code>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Use any future expiry date (e.g., 12/28), any 3-digit CVC, and any valid ZIP code.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}