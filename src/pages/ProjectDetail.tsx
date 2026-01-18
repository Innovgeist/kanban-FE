import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Button,
  SimpleGrid,
  Badge,
  Modal,
  TextInput,
  Select,
  Stack,
  Tabs,
  Loader,
  Center,
  Alert,
  Avatar,
  ActionIcon,
  Table,
  Menu,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconPlus,
  IconLayoutKanban,
  IconUsers,
  IconAlertCircle,
  IconArrowLeft,
  IconTrash,
  IconDotsVertical,
  IconCopy,
  IconCheck,
  IconMail,
} from '@tabler/icons-react';
import { useAuthStore, useProjectStore } from '../store';
import { AppLayout } from '../components/layout/AppLayout';
import type { ProjectRole, AddMemberResponse } from '../types';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentProject,
    boards,
    members,
    isLoading,
    error,
    fetchProjectBoards,
    fetchProjectMembers,
    createBoard,
    addMember,
    removeMember,
    clearError,
  } = useProjectStore();

  const [createBoardModalOpen, setCreateBoardModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [invitationModalOpen, setInvitationModalOpen] = useState(false);
  const [invitationData, setInvitationData] = useState<AddMemberResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const currentUserMember = members.find((m) => m.userId._id === user?._id);
  const isProjectAdmin = currentUserMember?.role === 'ADMIN' || isSuperAdmin;

  const boardForm = useForm({
    initialValues: { name: '' },
    validate: {
      name: (value) => (value.length >= 1 ? null : 'Board name is required'),
    },
  });

  const memberForm = useForm({
    initialValues: {
      email: '',
      role: 'MEMBER' as ProjectRole,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  useEffect(() => {
    if (projectId) {
      fetchProjectBoards(projectId);
      fetchProjectMembers(projectId);
    }
  }, [projectId, fetchProjectBoards, fetchProjectMembers]);

  const handleCreateBoard = async (values: typeof boardForm.values) => {
    if (!projectId) return;
    setActionLoading(true);
    try {
      const newBoard = await createBoard(projectId, values.name);
      setCreateBoardModalOpen(false);
      boardForm.reset();
      navigate(`/boards/${newBoard._id}`);
    } catch (err) {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (values: typeof memberForm.values) => {
    if (!projectId) return;
    setActionLoading(true);
    try {
      const result = await addMember(projectId, values);
      setAddMemberModalOpen(false);
      memberForm.reset();

      // Check if this is a new user invitation
      if (result.requiresPasswordSetup && result.invitationToken) {
        setInvitationData(result);
        setInvitationModalOpen(true);
      }
    } catch (err) {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const getInvitationUrl = () => {
    if (!invitationData?.invitationToken) return '';
    return `${window.location.origin}/setup-password?token=${invitationData.invitationToken}`;
  };

  const handleCopyInvitationLink = async () => {
    const url = getInvitationUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!projectId) return;
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeMember(projectId, userId);
    } catch (err) {
      // Error handled in store
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading && !currentProject) {
    return (
      <AppLayout>
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container size="xl" py="xl">
        <Group mb="xl">
          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => navigate('/projects')}
          >
            <IconArrowLeft size={18} />
          </ActionIcon>
          <div>
            <Title order={2} className="text-gray-800">
              {currentProject?.name || 'Project'}
            </Title>
            <Text c="dimmed" size="sm">
              Manage boards and team members
            </Text>
          </div>
        </Group>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            mb="md"
            withCloseButton
            onClose={clearError}
          >
            {error}
          </Alert>
        )}

        <Tabs defaultValue="boards">
          <Tabs.List mb="lg">
            <Tabs.Tab
              value="boards"
              leftSection={<IconLayoutKanban size={16} />}
            >
              Boards ({boards.length})
            </Tabs.Tab>
            <Tabs.Tab value="members" leftSection={<IconUsers size={16} />}>
              Members ({members.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="boards">
            <Group justify="space-between" mb="lg">
              <Text fw={500}>Project Boards</Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setCreateBoardModalOpen(true)}
                size="sm"
              >
                New Board
              </Button>
            </Group>

            {boards.length === 0 ? (
              <Card withBorder p="xl" radius="md" className="text-center">
                <IconLayoutKanban
                  size={48}
                  className="text-gray-400 mx-auto mb-4"
                />
                <Title order={4} c="dimmed" mb="xs">
                  No boards yet
                </Title>
                <Text size="sm" c="dimmed" mb="md">
                  Create your first Kanban board to start organizing tasks
                </Text>
                <Button
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setCreateBoardModalOpen(true)}
                >
                  Create Board
                </Button>
              </Card>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {boards.map((board) => (
                  <Card
                    key={board._id}
                    withBorder
                    shadow="sm"
                    radius="md"
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/boards/${board._id}`)}
                  >
                    <Group gap="xs" mb="xs">
                      <IconLayoutKanban size={20} className="text-blue-500" />
                      <Text fw={600} size="lg" lineClamp={1}>
                        {board.name}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      Created{' '}
                      {new Date(board.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="members">
            <Group justify="space-between" mb="lg">
              <Text fw={500}>Team Members</Text>
              {isProjectAdmin && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setAddMemberModalOpen(true)}
                  size="sm"
                >
                  Add Member
                </Button>
              )}
            </Group>

            {members.length === 0 ? (
              <Card withBorder p="xl" radius="md" className="text-center">
                <IconUsers size={48} className="text-gray-400 mx-auto mb-4" />
                <Title order={4} c="dimmed" mb="xs">
                  No members yet
                </Title>
                <Text size="sm" c="dimmed" mb="md">
                  Add team members to collaborate on this project
                </Text>
                {isProjectAdmin && (
                  <Button
                    variant="light"
                    leftSection={<IconPlus size={16} />}
                    onClick={() => setAddMemberModalOpen(true)}
                  >
                    Add Member
                  </Button>
                )}
              </Card>
            ) : (
              <Card withBorder radius="md" p={0}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Member</Table.Th>
                      <Table.Th>Role</Table.Th>
                      {isProjectAdmin && <Table.Th w={60}>Actions</Table.Th>}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {members.map((member) => (
                      <Table.Tr key={member._id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar color="blue" radius="xl" size="sm">
                              {getInitials(member.userId.name)}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {member.userId.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {member.userId.email}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={member.role === 'ADMIN' ? 'blue' : 'gray'}
                            variant="light"
                          >
                            {member.role === 'ADMIN' ? 'Project Manager' : 'Member'}
                          </Badge>
                        </Table.Td>
                        {isProjectAdmin && (
                          <Table.Td>
                            <Menu shadow="md" width={150} position="bottom-end">
                              <Menu.Target>
                                <ActionIcon variant="subtle" color="gray">
                                  <IconDotsVertical size={16} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item
                                  color="red"
                                  leftSection={
                                    <IconTrash
                                      style={{
                                        width: rem(14),
                                        height: rem(14),
                                      }}
                                    />
                                  }
                                  onClick={() =>
                                    handleRemoveMember(member.userId._id)
                                  }
                                >
                                  Remove
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Table.Td>
                        )}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            )}
          </Tabs.Panel>
        </Tabs>

        {/* Create Board Modal */}
        <Modal
          opened={createBoardModalOpen}
          onClose={() => {
            setCreateBoardModalOpen(false);
            boardForm.reset();
          }}
          title="Create New Board"
          centered
        >
          <form onSubmit={boardForm.onSubmit(handleCreateBoard)}>
            <Stack>
              <TextInput
                label="Board Name"
                placeholder="e.g., Development Board"
                required
                {...boardForm.getInputProps('name')}
              />
              <Group justify="flex-end" mt="md">
                <Button
                  variant="light"
                  onClick={() => {
                    setCreateBoardModalOpen(false);
                    boardForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={actionLoading}>
                  Create Board
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* Add Member Modal */}
        <Modal
          opened={addMemberModalOpen}
          onClose={() => {
            setAddMemberModalOpen(false);
            memberForm.reset();
          }}
          title="Add Team Member"
          centered
        >
          <form onSubmit={memberForm.onSubmit(handleAddMember)}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="member@example.com"
                description="If the user is not registered, an invitation will be created"
                required
                {...memberForm.getInputProps('email')}
              />
              <Select
                label="Role"
                data={
                  isSuperAdmin
                    ? [
                        { value: 'MEMBER', label: 'Member' },
                        { value: 'ADMIN', label: 'Project Manager (Admin)' },
                      ]
                    : [{ value: 'MEMBER', label: 'Member' }]
                }
                value={memberForm.values.role}
                onChange={(value) =>
                  memberForm.setFieldValue('role', value as ProjectRole)
                }
                description={
                  !isSuperAdmin
                    ? 'Only SuperAdmin can assign Project Manager role'
                    : undefined
                }
              />
              <Group justify="flex-end" mt="md">
                <Button
                  variant="light"
                  onClick={() => {
                    setAddMemberModalOpen(false);
                    memberForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={actionLoading}>
                  Add Member
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* Invitation Link Modal */}
        <Modal
          opened={invitationModalOpen}
          onClose={() => {
            setInvitationModalOpen(false);
            setInvitationData(null);
            setCopied(false);
          }}
          title="Invitation Sent"
          centered
        >
          <Stack>
            <Alert
              icon={<IconMail size={16} />}
              title="New User Invited"
              color="blue"
            >
              A new user account has been created for{' '}
              <strong>{invitationData?.userId?.email}</strong>. Share the
              invitation link below so they can set their password and access
              the project.
            </Alert>

            <Text size="sm" fw={500}>
              Invitation Link
            </Text>
            <Group gap="xs">
              <TextInput
                value={getInvitationUrl()}
                readOnly
                className="flex-1"
                styles={{
                  input: {
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  },
                }}
              />
              <Button
                variant={copied ? 'filled' : 'light'}
                color={copied ? 'green' : 'blue'}
                leftSection={
                  copied ? <IconCheck size={16} /> : <IconCopy size={16} />
                }
                onClick={handleCopyInvitationLink}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </Group>

            {invitationData?.invitationExpiresAt && (
              <Text size="xs" c="dimmed">
                This invitation expires on{' '}
                {new Date(invitationData.invitationExpiresAt).toLocaleString()}
              </Text>
            )}

            <Group justify="flex-end" mt="md">
              <Button
                onClick={() => {
                  setInvitationModalOpen(false);
                  setInvitationData(null);
                  setCopied(false);
                }}
              >
                Done
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </AppLayout>
  );
}
