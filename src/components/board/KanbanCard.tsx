import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as MantineCard, Text, Group, Avatar } from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import type { Card } from '../../types';

interface KanbanCardProps {
  card: Card;
  isDragging?: boolean;
}

export function KanbanCard({ card, isDragging }: KanbanCardProps) {
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

  return (
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
        <IconGripVertical size={16} className="text-gray-400 flex-shrink-0" />
      </Group>

      {card.description && (
        <Text size="xs" c="dimmed" lineClamp={2} mb="xs">
          {card.description}
        </Text>
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
      </Group>
    </MantineCard>
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
        <IconGripVertical size={16} className="text-gray-400 flex-shrink-0" />
      </Group>

      {card.description && (
        <Text size="xs" c="dimmed" lineClamp={2} mb="xs">
          {card.description}
        </Text>
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
      </Group>
    </MantineCard>
  );
}
