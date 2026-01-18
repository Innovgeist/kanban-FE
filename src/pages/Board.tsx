import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Title,
  Text,
  Group,
  Loader,
  Center,
  Alert,
  ActionIcon,
  Breadcrumbs,
  Anchor,
  Menu,
  Modal,
  TextInput,
  Button,
  Stack,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconLayoutKanban,
  IconDotsVertical,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { useBoardStore, useProjectStore, useAuthStore } from '../store';
import { AppLayout } from '../components/layout/AppLayout';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { notifications } from '@mantine/notifications';

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentBoard,
    isLoading,
    error,
    fetchBoard,
    clearError,
    clearBoard,
    updateBoard,
    deleteBoard,
  } = useBoardStore();
  const { currentProject, members, fetchProjectMembers } = useProjectStore();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const currentUserMember = members.find((m) => m.userId._id === user?._id);
  const isProjectAdmin = currentUserMember?.role === 'ADMIN' || isSuperAdmin;

  const boardForm = useForm({
    initialValues: { name: '' },
    validate: {
      name: (value) => (value.trim().length >= 1 ? null : 'Board name is required'),
    },
  });

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
    }

    return () => {
      clearBoard();
    };
  }, [boardId, fetchBoard, clearBoard]);

  useEffect(() => {
    if (currentBoard?.projectId) {
      fetchProjectMembers(currentBoard.projectId);
    }
  }, [currentBoard?.projectId, fetchProjectMembers]);

  useEffect(() => {
    if (currentBoard && editModalOpen) {
      boardForm.setValues({ name: currentBoard.name });
    }
  }, [currentBoard, editModalOpen]);

  const handleEditBoard = async (values: { name: string }) => {
    if (!boardId) return;
    setActionLoading(true);
    try {
      await updateBoard(boardId, { name: values.name.trim() });
      setEditModalOpen(false);
      notifications.show({
        title: 'Success',
        message: 'Board updated successfully',
        color: 'green',
      });
    } catch (err) {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!boardId || !currentBoard?.projectId) return;
    setActionLoading(true);
    try {
      await deleteBoard(boardId);
      setDeleteModalOpen(false);
      notifications.show({
        title: 'Success',
        message: 'Board deleted successfully',
        color: 'green',
      });
      navigate(`/projects/${currentBoard.projectId}`);
    } catch (err) {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading && !currentBoard) {
    return (
      <AppLayout>
        <Center py="xl" className="h-[calc(100vh-120px)]">
          <Loader size="lg" />
        </Center>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-60px)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <Group justify="space-between">
            <Group>
              <ActionIcon
                variant="light"
                size="lg"
                onClick={() => {
                  if (currentBoard?.projectId) {
                    navigate(`/projects/${currentBoard.projectId}`);
                  } else {
                    navigate('/projects');
                  }
                }}
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
              <div>
                <Breadcrumbs separator="/" mb={4}>
                  <Anchor
                    size="sm"
                    onClick={() => navigate('/projects')}
                    className="cursor-pointer"
                  >
                    Projects
                  </Anchor>
                  {currentProject && (
                    <Anchor
                      size="sm"
                      onClick={() =>
                        navigate(`/projects/${currentProject._id}`)
                      }
                      className="cursor-pointer"
                    >
                      {currentProject.name}
                    </Anchor>
                  )}
                  <Text size="sm" c="dimmed">
                    {currentBoard?.name || 'Board'}
                  </Text>
                </Breadcrumbs>
                <Group gap="xs">
                  <IconLayoutKanban size={24} className="text-blue-600" />
                  <Title order={3} className="text-gray-800">
                    {currentBoard?.name || 'Loading...'}
                  </Title>
                </Group>
              </div>
            </Group>
            {isProjectAdmin && currentBoard && (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray">
                    <IconDotsVertical size={18} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => setEditModalOpen(true)}
                  >
                    Edit Board
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Delete Board
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            m="md"
            withCloseButton
            onClose={clearError}
          >
            {error}
          </Alert>
        )}

        {/* Kanban Board */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          {isLoading ? (
            <Center className="h-full">
              <Loader size="lg" />
            </Center>
          ) : (
            boardId && <KanbanBoard boardId={boardId} isProjectAdmin={isProjectAdmin} />
          )}
        </div>

        {/* Edit Board Modal */}
        <Modal
          opened={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Board"
          centered
        >
          <form onSubmit={boardForm.onSubmit(handleEditBoard)}>
            <Stack gap="md">
              <TextInput
                label="Board Name"
                placeholder="Enter board name"
                required
                {...boardForm.getInputProps('name')}
              />
              <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={actionLoading}>
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* Delete Board Modal */}
        <Modal
          opened={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Board"
          centered
        >
          <Stack gap="md">
            <Text>
              Are you sure you want to delete this board? This action is irreversible and will
              delete all columns and cards in this board.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button color="red" onClick={handleDeleteBoard} loading={actionLoading}>
                Delete Board
              </Button>
            </Group>
          </Stack>
        </Modal>
      </div>
    </AppLayout>
  );
}
