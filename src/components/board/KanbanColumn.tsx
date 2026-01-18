import { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  Text,
  Group,
  ActionIcon,
  TextInput,
  Button,
  Stack,
  Badge,
  Textarea,
} from '@mantine/core';
import { IconPlus, IconGripVertical, IconX } from '@tabler/icons-react';
import type { Column, Card as CardType } from '../../types';
import { KanbanCard } from './KanbanCard';
import { useBoardStore } from '../../store';

interface KanbanColumnProps {
  column: Column;
  cards: CardType[];
}

export function KanbanColumn({ column, cards }: KanbanColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { createCard } = useBoardStore();

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column-${column._id}`,
    data: {
      type: 'column',
      column,
    },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `column-${column._id}`,
    data: {
      type: 'column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;

    setIsLoading(true);
    try {
      await createCard(column._id, {
        title: newCardTitle.trim(),
        description: newCardDescription.trim() || undefined,
      });
      setNewCardTitle('');
      setNewCardDescription('');
      setIsAddingCard(false);
    } catch (err) {
      // Error handled in store
    } finally {
      setIsLoading(false);
    }
  };

  const cardIds = cards.map((card) => card._id);

  return (
    <Card
      ref={setSortableRef}
      style={style}
      withBorder
      radius="md"
      p="sm"
      className="bg-gray-100 min-w-[300px] max-w-[300px] flex flex-col max-h-[calc(100vh-200px)]"
    >
      {/* Column Header */}
      <Group
        justify="space-between"
        mb="sm"
        className="cursor-grab"
        {...attributes}
        {...listeners}
      >
        <Group gap="xs">
          <IconGripVertical size={16} className="text-gray-400" />
          <Text fw={600} size="sm">
            {column.name}
          </Text>
          <Badge size="sm" variant="light" color="gray">
            {cards.length}
          </Badge>
        </Group>
      </Group>

      {/* Cards Container */}
      <div
        ref={setDroppableRef}
        className="flex-1 overflow-y-auto min-h-[100px]"
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard key={card._id} card={card} />
          ))}
        </SortableContext>

        {cards.length === 0 && !isAddingCard && (
          <div className="flex items-center justify-center h-[80px] border-2 border-dashed border-gray-300 rounded-lg">
            <Text size="sm" c="dimmed">
              Drop cards here
            </Text>
          </div>
        )}
      </div>

      {/* Add Card Section */}
      {isAddingCard ? (
        <Stack gap="xs" mt="sm">
          <TextInput
            placeholder="Card title"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            autoFocus
            size="sm"
          />
          <Textarea
            placeholder="Description (optional)"
            value={newCardDescription}
            onChange={(e) => setNewCardDescription(e.target.value)}
            minRows={2}
            size="sm"
          />
          <Group gap="xs">
            <Button
              size="xs"
              onClick={handleAddCard}
              loading={isLoading}
              disabled={!newCardTitle.trim()}
            >
              Add Card
            </Button>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => {
                setIsAddingCard(false);
                setNewCardTitle('');
                setNewCardDescription('');
              }}
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Stack>
      ) : (
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconPlus size={16} />}
          fullWidth
          mt="sm"
          onClick={() => setIsAddingCard(true)}
          className="hover:bg-gray-200"
        >
          Add Card
        </Button>
      )}
    </Card>
  );
}

export function KanbanColumnOverlay({ column, cards }: KanbanColumnProps) {
  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      className="bg-gray-100 min-w-[300px] max-w-[300px] shadow-lg ring-2 ring-blue-400"
    >
      <Group justify="space-between" mb="sm">
        <Group gap="xs">
          <IconGripVertical size={16} className="text-gray-400" />
          <Text fw={600} size="sm">
            {column.name}
          </Text>
          <Badge size="sm" variant="light" color="gray">
            {cards.length}
          </Badge>
        </Group>
      </Group>

      <div className="opacity-50">
        {cards.slice(0, 3).map((card) => (
          <Card
            key={card._id}
            withBorder
            shadow="sm"
            radius="md"
            p="sm"
            className="bg-white mb-2"
          >
            <Text fw={500} size="sm" lineClamp={1}>
              {card.title}
            </Text>
          </Card>
        ))}
        {cards.length > 3 && (
          <Text size="xs" c="dimmed" ta="center">
            +{cards.length - 3} more cards
          </Text>
        )}
      </div>
    </Card>
  );
}
