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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconPlus,
  IconFolder,
  IconAlertCircle,
  IconCalendar,
} from '@tabler/icons-react';
import { useAuthStore, useProjectStore } from '../store';
import { AppLayout } from '../components/layout/AppLayout';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    selectProject,
    clearError,
  } = useProjectStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

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
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleProjectClick(project)}
              >
                <Group justify="space-between" mb="xs">
                  <Text fw={600} size="lg" lineClamp={1}>
                    {project.name}
                  </Text>
                  <Badge
                    color={project.role === 'ADMIN' ? 'blue' : 'gray'}
                    variant="light"
                  >
                    {project.role}
                  </Badge>
                </Group>
                <Group gap="xs" c="dimmed">
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
      </Container>
    </AppLayout>
  );
}
