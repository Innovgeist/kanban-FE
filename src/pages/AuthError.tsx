import { useSearchParams, Link } from 'react-router-dom';
import {
  Button,
  Paper,
  Title,
  Text,
  Container,
  Stack,
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export function AuthErrorPage() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error') || 'An unknown error occurred';
  const code = searchParams.get('code');

  const getErrorMessage = (errorCode: string | null, errorMsg: string) => {
    switch (errorCode) {
      case 'GOOGLE_AUTH_FAILED':
        return 'Google authentication failed. Please try again.';
      case 'INVALID_TOKEN':
        return 'Invalid or expired authentication token.';
      case 'USER_NOT_FOUND':
        return 'User account not found.';
      default:
        return errorMsg;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Container size={420} className="w-full">
        <Title ta="center" className="text-2xl font-bold text-gray-800 mb-2">
          Authentication Error
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb={20}>
          There was a problem signing you in
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md">
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Authentication Failed"
            color="red"
            mb="md"
          >
            {getErrorMessage(code, error)}
          </Alert>

          <Stack>
            <Button component={Link} to="/login" fullWidth>
              Try Again
            </Button>
            <Button
              component={Link}
              to="/register"
              fullWidth
              variant="light"
            >
              Create New Account
            </Button>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
