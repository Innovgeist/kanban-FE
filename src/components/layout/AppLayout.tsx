import type { ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppShell,
  Group,
  Text,
  Menu,
  Avatar,
  UnstyledButton,
  rem,
} from '@mantine/core';
import {
  IconLayoutKanban,
  IconLogout,
  IconUser,
  IconChevronDown,
} from '@tabler/icons-react';
import { useAuthStore } from '../../store';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header className="border-b border-gray-200 bg-white">
        <Group h="100%" px="md" justify="space-between">
          <Link to="/projects" className="no-underline">
            <Group gap="xs">
              <IconLayoutKanban size={28} className="text-blue-600" />
              <Text
                size="xl"
                fw={700}
                className="text-gray-800 hidden sm:block"
              >
                KanbanBoard
              </Text>
            </Group>
          </Link>

          <Group>
            {user?.role === 'SUPERADMIN' && (
              <Text size="xs" c="dimmed" className="hidden md:block">
                SuperAdmin
              </Text>
            )}
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Avatar color="blue" radius="xl" size="sm">
                    {user?.name ? getInitials(user.name) : <IconUser size={16} />}
                  </Avatar>
                  <div className="hidden sm:block">
                    <Text size="sm" fw={500}>
                      {user?.name || 'User'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {user?.email}
                    </Text>
                  </div>
                  <IconChevronDown
                    style={{ width: rem(14), height: rem(14) }}
                    className="text-gray-500"
                  />
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item
                  leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
                  disabled
                >
                  Profile
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main className="bg-gray-50">{children}</AppShell.Main>
    </AppShell>
  );
}
