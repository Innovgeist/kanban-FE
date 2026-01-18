import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Stack,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { authApi, setTokens } from '../api';
import { useAuthStore } from '../store';

export function SetupPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { initialize } = useAuthStore();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (value) =>
        value.length >= 6 ? null : 'Password must be at least 6 characters',
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!token) {
      setError('Invalid invitation link');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.setPasswordWithInvitation(
        token,
        values.password
      );

      if (response.success) {
        const { tokens } = response.data;
        setTokens(tokens.accessToken, tokens.refreshToken);
        initialize();
        setSuccess(true);

        setTimeout(() => {
          navigate('/projects');
        }, 1500);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to set password. The link may be expired.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Container size={420} className="w-full">
          <Paper withBorder shadow="md" p={30} radius="md">
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Invalid Invitation Link"
              color="red"
            >
              The invitation link is invalid or missing. Please contact your
              administrator for a new invitation.
            </Alert>
            <Button
              component={Link}
              to="/login"
              fullWidth
              mt="md"
              variant="light"
            >
              Go to Login
            </Button>
          </Paper>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Container size={420} className="w-full">
        <Title ta="center" className="text-2xl font-bold text-gray-800 mb-2">
          Set Your Password
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb={20}>
          You've been invited to join a project. Set your password to continue.
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md">
          {success ? (
            <Alert
              icon={<IconCheck size={16} />}
              title="Password Set Successfully!"
              color="green"
            >
              Redirecting to your projects...
            </Alert>
          ) : (
            <>
              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Error"
                  color="red"
                  mb="md"
                  withCloseButton
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                  <PasswordInput
                    label="Password"
                    placeholder="Create a password"
                    required
                    {...form.getInputProps('password')}
                  />
                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    required
                    {...form.getInputProps('confirmPassword')}
                  />
                  <Button type="submit" fullWidth loading={isLoading}>
                    Set Password & Continue
                  </Button>
                </Stack>
              </form>
            </>
          )}
        </Paper>
      </Container>
    </div>
  );
}
