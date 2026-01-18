import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Stack,
  Alert,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconBrandGoogle } from '@tabler/icons-react';
import { useAuthStore } from '../store';
import { authApi } from '../api/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) =>
        value.length >= 6 ? null : 'Password must be at least 6 characters',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLocalError(null);
    clearError();
    try {
      await login(values);
      navigate('/projects');
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please try again.';
      setLocalError(errorMsg);
    }
  };

  const displayError = localError || error;

  const handleGoogleSignIn = () => {
    window.location.href = authApi.getGoogleAuthUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Container size={420} className="w-full">
        <Title ta="center" className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back!
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb={20}>
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md">
          {displayError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
              mb="md"
              withCloseButton
              onClose={() => {
                setLocalError(null);
                clearError();
              }}
            >
              {displayError}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                {...form.getInputProps('password')}
              />
              <Button type="submit" fullWidth loading={isLoading}>
                Sign in
              </Button>

              <Divider label="Or continue with" labelPosition="center" />

              <Button
                variant="outline"
                fullWidth
                leftSection={<IconBrandGoogle size={18} />}
                onClick={handleGoogleSignIn}
              >
                Sign in with Google
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
