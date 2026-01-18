import { useEffect } from 'react';
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
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconLayoutKanban } from '@tabler/icons-react';
import { useBoardStore, useProjectStore } from '../store';
import { AppLayout } from '../components/layout/AppLayout';
import { KanbanBoard } from '../components/board/KanbanBoard';

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { currentBoard, isLoading, error, fetchBoard, clearError, clearBoard } =
    useBoardStore();
  const { currentProject } = useProjectStore();

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
    }

    return () => {
      clearBoard();
    };
  }, [boardId, fetchBoard, clearBoard]);

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
        <div className="flex-1 overflow-hidden p-4 bg-gray-50">
          {boardId && <KanbanBoard boardId={boardId} />}
        </div>
      </div>
    </AppLayout>
  );
}
