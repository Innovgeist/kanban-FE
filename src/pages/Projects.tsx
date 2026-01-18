import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stack,
  Loader,
  Center,
  Alert,
  ActionIcon,
  Menu,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconPlus,
  IconFolder,
  IconAlertCircle,
  IconCalendar,
  IconDotsVertical,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { useAuthStore, useProjectStore } from '../store';
import { AppLayout } from '../components/layout/AppLayout';
import { notifications } from '@mantine/notifications';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    clearError,
  } = useProjectStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{ _id: string; name: string } | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const form = useForm({
    initialValues: {
      name: '',
      projectManagerEmail: '',
    },
    validate: {
      name: (value) => (value.length >= 1 ? null : 'Project name is required'),
      projectManagerEmail: (value) =>
        value === '' || /^\S+@\S+$/.test(value)
          ? null
          : 'Invalid email format',
    },
  });

  const editForm = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (value.length >= 1 ? null : 'Project name is required'),
    },
  });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (values: typeof form.values) => {
    setCreateLoading(true);
    try {
      const newProject = await createProject({
        name: values.name,
        projectManagerEmail: values.projectManagerEmail || undefined,
      });
      setCreateModalOpen(false);
      form.reset();
      // Navigate to the new project
      navigate(`/projects/${newProject._id}`);
    } catch (err) {
      // Error is handled in store
    } finally {
      setCreateLoading(false);
    }
  };

  const handleProjectClick = (project: typeof projects[0]) => {
    selectProject(project);
    navigate(`/projects/${project._id}`);
  };

  const handleEditProject = async (values: { name: string }) => {
    if (!selectedProject) return;
    setActionLoading(true);
    try {
      await updateProject(selectedProject._id, { name: values.name.trim() });
      setEditModalOpen(false);
      setSelectedProject(null);
      notifications.show({
        title: 'Success',
        message: 'Project updated successfully',
        color: 'green',
      });
    } catch (err) {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    setActionLoading(true);
    try {
      await deleteProject(selectedProject._id);
      setDeleteModalOpen(false);
      setSelectedProject(null);
      notifications.show({
        title: 'Success',
        message: 'Project deleted successfully',
        color: 'green',
      });
    } catch (err) {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AppLayout>
      <Container size="xl" py="xl">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2} className="text-gray-800">
              My Projects
            </Title>
            <Text c="dimmed" size="sm">
              Manage and organize your projects
            </Text>
          </div>
          {isSuperAdmin && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateModalOpen(true)}
            >
              New Project
            </Button>
          )}
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

        {isLoading ? (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        ) : projects.length === 0 ? (
          <Card withBorder p="xl" radius="md" className="text-center">
            <IconFolder size={48} className="text-gray-400 mx-auto mb-4" />
            <Title order={4} c="dimmed" mb="xs">
              No projects yet
            </Title>
            <Text size="sm" c="dimmed" mb="md">
              {isSuperAdmin
                ? 'Create your first project to get started'
                : 'You have not been added to any projects yet'}
            </Text>
            {isSuperAdmin && (
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={() => setCreateModalOpen(true)}
              >
                Create Project
              </Button>
            )}
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {projects.map((project) => (
              <Card
                key={project._id}
                withBorder
                shadow="sm"
                radius="md"
                className="hover:shadow-md transition-shadow"
              >
                <Group justify="space-between" mb="xs">
                  <Group
                    gap="xs"
                    style={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => handleProjectClick(project)}
                  >
                    <Text fw={600} size="lg" lineClamp={1}>
                      {project.name}
                    </Text>
                    {project.role && (
                      <Badge
                        color={project.role === 'ADMIN' ? 'blue' : 'gray'}
                        variant="light"
                      >
                        {project.role === 'ADMIN' ? 'Project Manager' : 'Member'}
                      </Badge>
                    )}
                  </Group>
                  {isSuperAdmin && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Menu shadow="md" width={200} position="bottom-end">
                        <Menu.Target>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProject(project);
                              editForm.setValues({ name: project.name });
                              setEditModalOpen(true);
                            }}
                          >
                            Edit Project
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProject(project);
                              setDeleteModalOpen(true);
                            }}
                          >
                            Delete Project
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </div>
                  )}
                </Group>
                <Group
                  gap="xs"
                  c="dimmed"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleProjectClick(project)}
                >
                  <IconCalendar size={14} />
                  <Text size="xs">Created {formatDate(project.createdAt)}</Text>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Create Project Modal */}
        <Modal
          opened={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            form.reset();
          }}
          title="Create New Project"
          centered
        >
          <form onSubmit={form.onSubmit(handleCreateProject)}>
            <Stack>
              <TextInput
                label="Project Name"
                placeholder="Enter project name"
                required
                {...form.getInputProps('name')}
              />
              <TextInput
                label="Project Manager Email"
                placeholder="pm@example.com (optional)"
                description="Assign a project manager by email. Leave empty to add later."
                {...form.getInputProps('projectManagerEmail')}
              />
              <Group justify="flex-end" mt="md">
                <Button
                  variant="light"
                  onClick={() => {
                    setCreateModalOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={createLoading}>
                  Create Project
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* Edit Project Modal */}
        <Modal
          opened={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedProject(null);
            editForm.reset();
          }}
          title="Edit Project"
          centered
        >
          <form onSubmit={editForm.onSubmit(handleEditProject)}>
            <Stack gap="md">
              <TextInput
                label="Project Name"
                placeholder="Enter project name"
                required
                {...editForm.getInputProps('name')}
              />
              <Group justify="flex-end" mt="md">
                <Button
                  variant="subtle"
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedProject(null);
                    editForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={actionLoading} color="blue">
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* Delete Project Modal */}
        <Modal
          opened={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedProject(null);
          }}
          title="Delete Project"
          centered
        >
          <Stack gap="md">
            <Text>
              Are you sure you want to delete &quot;{selectedProject?.name}&quot;? This action is
              irreversible and will delete all boards, columns, and cards in this project.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedProject(null);
                }}
              >
                Cancel
              </Button>
              <Button color="red" onClick={handleDeleteProject} loading={actionLoading}>
                Delete Project
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </AppLayout>
  );
}
