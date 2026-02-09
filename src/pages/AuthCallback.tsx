import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Center, Loader, Text, Stack } from '@mantine/core';
import { setTokens } from '../api';
import { useAuthStore } from '../store';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { initialize } = useAuthStore();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage(decodeURIComponent(error));
      setTimeout(() => {
        navigate('/login?error=' + encodeURIComponent(error));
      }, 2000);
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens
      setTokens(accessToken, refreshToken);

      // Initialize auth state
      initialize()
        .then(() => {
          // Redirect to projects after initialization
          navigate('/projects', { replace: true });
        })
        .catch(() => {
          // If initialization fails, redirect to login
          navigate('/login?error=initialization_failed', { replace: true });
        });
    } else {
      setStatus('error');
      setErrorMessage('Missing authentication tokens');
      setTimeout(() => {
        navigate('/login?error=missing_tokens');
      }, 2000);
    }
  }, [searchParams, navigate, initialize]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Center>
        <Stack align="center" gap="md">
          {status === 'processing' ? (
            <>
              <Loader size="lg" />
              <Text size="lg" c="dimmed">
                Processing authentication...
              </Text>
            </>
          ) : (
            <>
              <Text size="lg" c="red">
                {errorMessage}
              </Text>
              <Text size="sm" c="dimmed">
                Redirecting to login...
              </Text>
            </>
          )}
        </Stack>
      </Center>
    </div>
  );
}
