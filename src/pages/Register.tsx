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

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) => (value.length >= 1 ? null : 'Name is required'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) =>
        value.length >= 6 ? null : 'Password must be at least 6 characters',
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLocalError(null);
    clearError();
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      navigate('/projects');
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
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
          Create an account
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb={20}>
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
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
                label="Name"
                placeholder="Your name"
                required
                {...form.getInputProps('name')}
              />
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                {...form.getInputProps('email')}
              />
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
                Create account
              </Button>

              <Divider label="Or continue with" labelPosition="center" />

              <Button
                variant="outline"
                fullWidth
                leftSection={<IconBrandGoogle size={18} />}
                onClick={handleGoogleSignIn}
              >
                Sign up with Google
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
