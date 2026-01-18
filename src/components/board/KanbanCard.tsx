import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card as MantineCard,
  Text,
  Group,
  Avatar,
  ActionIcon,
  Menu,
  Modal,
  TextInput,
  Textarea,
  Button,
  Stack,
  rem,
  Badge,
  Select,
  MultiSelect,
  Tooltip,
} from '@mantine/core';
import { IconCalendar, IconAlertCircle } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import {
  IconGripVertical,
  IconDotsVertical,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import type { Card, CardPriority } from '../../types';
import { useBoardStore, useProjectStore } from '../../store';
import { notifications } from '@mantine/notifications';

interface KanbanCardProps {
  card: Card;
  isDragging?: boolean;
}

export function KanbanCard({ card, isDragging }: KanbanCardProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { updateCard, deleteCard } = useBoardStore();
  const { members } = useProjectStore();

  // Prepare member options for MultiSelect
  const memberOptions = members.map((member) => ({
    value: member.userId._id,
    label: member.userId.name || member.userId.email,
  }));

  const cardForm = useForm({
    initialValues: {
      title: card.title,
      description: card.description || '',
      priority: (card.priority || 'MEDIUM') as CardPriority,
      expectedDeliveryDate: card.expectedDeliveryDate ? new Date(card.expectedDeliveryDate) : null as Date | null,
      assignedTo: (card.assignedTo || []).map((user) => user._id),
    },
    validate: {
      title: (value) => (value.trim().length >= 1 ? null : 'Card title is required'),
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card._id,
    data: {
      type: 'card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (priority?: CardPriority) => {
    switch (priority) {
      case 'LOW':
        return 'gray';
      case 'MEDIUM':
        return 'blue';
      case 'HIGH':
        return 'orange';
      case 'URGENT':
        return 'red';
      default:
        return 'blue';
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCreatedDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Check if delivery date is near (within 3 days) or passed
  const getDateStatus = (dateString?: string | null) => {
    if (!dateString) return null;
    const deliveryDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deliveryDate.setHours(0, 0, 0, 0);
    
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'passed'; // Past due
    if (diffDays <= 3) return 'near'; // Due soon
    return 'ok';
  };

  const dateStatus = getDateStatus(card.expectedDeliveryDate);

  const handleEditCard = async (values: {
    title: string;
    description: string;
    priority: CardPriority;
    expectedDeliveryDate: Date | null;
    assignedTo: string[];
  }) => {
    setActionLoading(true);
    try {
      await updateCard(card._id, {
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        priority: values.priority,
        expectedDeliveryDate: values.expectedDeliveryDate
          ? values.expectedDeliveryDate.toISOString()
          : null,
        assignedTo: values.assignedTo,
      });
      setEditModalOpen(false);
      notifications.show({
        title: 'Success',
        message: 'Card updated successfully',
        color: 'green',
      });
    } catch (err) {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCard = async () => {
    setActionLoading(true);
    try {
      await deleteCard(card._id);
      setDeleteModalOpen(false);
      notifications.show({
        title: 'Success',
        message: 'Card deleted successfully',
        color: 'green',
      });
    } catch (err) {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <MantineCard
        ref={setNodeRef}
        style={style}
        withBorder
        shadow="sm"
        radius="md"
        p="sm"
        className={`bg-white cursor-grab active:cursor-grabbing mb-2 ${
          isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''
        }`}
        {...attributes}
        {...listeners}
      >
        <Group justify="space-between" wrap="nowrap" gap="xs" mb="xs">
          <Text fw={500} size="sm" lineClamp={2} className="flex-1">
            {card.title}
          </Text>
          <Group gap={4}>
            {card.priority && (
              <Badge size="xs" color={getPriorityColor(card.priority)} variant="light">
                {card.priority}
              </Badge>
            )}
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    cardForm.setValues({
                      title: card.title,
                      description: card.description || '',
                      priority: (card.priority || 'MEDIUM') as CardPriority,
                      expectedDeliveryDate: card.expectedDeliveryDate
                        ? new Date(card.expectedDeliveryDate)
                        : null,
                      assignedTo: (card.assignedTo || []).map((user) => user._id),
                    });
                    setEditModalOpen(true);
                  }}
                >
                  Edit Card
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteModalOpen(true);
                  }}
                >
                  Delete Card
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <IconGripVertical size={16} className="text-gray-400 shrink-0" />
          </Group>
        </Group>

        {card.description && (
          <Text size="xs" c="dimmed" lineClamp={2} mb="xs">
            {card.description}
          </Text>
        )}

        {/* Delivery Date and Assigned Users - Justified */}
        {(card.expectedDeliveryDate || (card.assignedTo && card.assignedTo.length > 0)) && (
          <Group justify="space-between" mb="xs">
            {/* Delivery Date */}
            {card.expectedDeliveryDate && (
              <Group gap={4}>
                {dateStatus === 'passed' ? (
                  <>
                    <IconAlertCircle size={14} className="text-red-600" />
                    <Text size="xs" c="red" fw={500}>
                      Overdue: {formatDate(card.expectedDeliveryDate)}
                    </Text>
                  </>
                ) : dateStatus === 'near' ? (
                  <>
                    <IconAlertCircle size={14} className="text-orange-600" />
                    <Text size="xs" c="orange" fw={500}>
                      Due Soon: {formatDate(card.expectedDeliveryDate)}
                    </Text>
                  </>
                ) : (
                  <>
                    <IconCalendar size={12} className="text-gray-500" />
                    <Text size="xs" c="dimmed">
                      Due: {formatDate(card.expectedDeliveryDate)}
                    </Text>
                  </>
                )}
              </Group>
            )}
            
            {/* Assigned Users */}
            {card.assignedTo && card.assignedTo.length > 0 && (
              <Group gap={4}>
                {card.assignedTo.slice(0, 3).map((user) => (
                  <Tooltip key={user._id} label={user.name || user.email}>
                    <Avatar size="xs" color="blue" radius="xl">
                      {user.name ? getInitials(user.name) : '?'}
                    </Avatar>
                  </Tooltip>
                ))}
                {card.assignedTo.length > 3 && (
                  <Text size="xs" c="dimmed">
                    +{card.assignedTo.length - 3}
                  </Text>
                )}
              </Group>
            )}
          </Group>
        )}

        <Group justify="space-between" mt="xs">
          <Group gap={4}>
            <Avatar size="xs" color="blue" radius="xl">
              {card.createdBy?.name ? getInitials(card.createdBy.name) : '?'}
            </Avatar>
            <Text size="xs" c="dimmed">
              {card.createdBy?.name || 'Unknown'}
            </Text>
          </Group>
          {card.createdAt && (
            <Text size="xs" c="dimmed">
              {formatCreatedDate(card.createdAt)}
            </Text>
          )}
        </Group>
      </MantineCard>

      {/* Edit Card Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Card"
        centered
      >
        <form onSubmit={cardForm.onSubmit(handleEditCard)}>
          <Stack gap="md">
            <TextInput
              label="Card Title"
              placeholder="Enter card title"
              required
              {...cardForm.getInputProps('title')}
            />
            <Textarea
              label="Description"
              placeholder="Enter description (optional)"
              minRows={3}
              {...cardForm.getInputProps('description')}
            />
            <Select
              label="Priority"
              placeholder="Select priority"
              data={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'URGENT', label: 'Urgent' },
              ]}
              {...cardForm.getInputProps('priority')}
            />
            <TextInput
              type="date"
              label="Expected Delivery Date"
              placeholder="Select date (optional)"
              value={
                cardForm.values.expectedDeliveryDate
                  ? cardForm.values.expectedDeliveryDate.toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                cardForm.setFieldValue('expectedDeliveryDate', date);
              }}
            />
            <MultiSelect
              label="Assign To"
              placeholder="Select team members"
              data={memberOptions}
              clearable
              searchable
              {...cardForm.getInputProps('assignedTo')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading} color="blue">
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Card Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Card"
        centered
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete this card? This action is irreversible.</Text>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteCard} loading={actionLoading}>
              Delete Card
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export function KanbanCardOverlay({ card }: { card: Card }) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (priority?: CardPriority) => {
    switch (priority) {
      case 'LOW':
        return 'gray';
      case 'MEDIUM':
        return 'blue';
      case 'HIGH':
        return 'orange';
      case 'URGENT':
        return 'red';
      default:
        return 'blue';
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Check if delivery date is near (within 3 days) or passed
  const getDateStatus = (dateString?: string | null) => {
    if (!dateString) return null;
    const deliveryDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deliveryDate.setHours(0, 0, 0, 0);
    
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'passed'; // Past due
    if (diffDays <= 3) return 'near'; // Due soon
    return 'ok';
  };

  return (
    <MantineCard
      withBorder
      shadow="lg"
      radius="md"
      p="sm"
      className="bg-white cursor-grabbing ring-2 ring-blue-400"
      style={{ width: 280 }}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs" mb="xs">
        <Text fw={500} size="sm" lineClamp={2} className="flex-1">
          {card.title}
        </Text>
        <Group gap={4}>
          {card.priority && (
            <Badge size="xs" color={getPriorityColor(card.priority)} variant="light">
              {card.priority}
            </Badge>
          )}
          <IconGripVertical size={16} className="text-gray-400 shrink-0" />
        </Group>
      </Group>

      {card.description && (
        <Text size="xs" c="dimmed" lineClamp={2} mb="xs">
          {card.description}
        </Text>
      )}

      {card.expectedDeliveryDate && (() => {
        const overlayDateStatus = getDateStatus(card.expectedDeliveryDate);
        return (
          <Group gap={4} mb="xs">
            {overlayDateStatus === 'passed' ? (
              <>
                <IconAlertCircle size={14} className="text-red-600" />
                <Text size="xs" c="red" fw={500}>
                  Overdue: {formatDate(card.expectedDeliveryDate)}
                </Text>
              </>
            ) : overlayDateStatus === 'near' ? (
              <>
                <IconAlertCircle size={14} className="text-orange-600" />
                <Text size="xs" c="orange" fw={500}>
                  Due Soon: {formatDate(card.expectedDeliveryDate)}
                </Text>
              </>
            ) : (
              <>
                <IconCalendar size={12} className="text-gray-500" />
                <Text size="xs" c="dimmed">
                  Due: {formatDate(card.expectedDeliveryDate)}
                </Text>
              </>
            )}
          </Group>
        );
      })()}

      <Group justify="space-between" mt="xs">
        <Group gap={4}>
          <Avatar size="xs" color="blue" radius="xl">
            {card.createdBy?.name ? getInitials(card.createdBy.name) : '?'}
          </Avatar>
          <Text size="xs" c="dimmed">
            {card.createdBy?.name || 'Unknown'}
          </Text>
        </Group>
      </Group>
    </MantineCard>
  );
}
