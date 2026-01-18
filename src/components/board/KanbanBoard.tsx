import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Group, Button, TextInput, Stack, ActionIcon } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import type { Column, Card } from '../../types';
import { KanbanColumn, KanbanColumnOverlay } from './KanbanColumn';
import { KanbanCardOverlay } from './KanbanCard';
import { useBoardStore } from '../../store';

interface KanbanBoardProps {
  boardId: string;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const { columns, createColumn, reorderColumns, optimisticMoveCard, moveCard, fetchBoard } =
    useBoardStore();

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeType, setActiveType] = useState<'card' | 'column' | null>(null);
  const [draggedCardOriginalColumn, setDraggedCardOriginalColumn] = useState<string | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnIds = useMemo(
    () => columns.map((col) => `column-${col._id}`),
    [columns]
  );

  const findColumn = (id: string): Column | undefined => {
    return columns.find((col) => col._id === id);
  };

  const findCard = (id: string): { card: Card; column: Column } | undefined => {
    for (const column of columns) {
      const card = column.cards?.find((c) => c._id === id);
      if (card) {
        return { card, column };
      }
    }
    return undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = String(active.id);

    if (id.startsWith('column-')) {
      setActiveType('column');
      setActiveId(id);
      setDraggedCardOriginalColumn(null);
    } else {
      setActiveType('card');
      setActiveId(id);
      // Store the original column when drag starts
      const cardData = findCard(id);
      setDraggedCardOriginalColumn(cardData?.column._id || null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeIdStr = String(active.id);
    const overId = String(over.id);

    // Only handle card dragging over columns
    if (activeType !== 'card') return;

    // Find the card being dragged (it may have moved due to previous optimistic updates)
    const activeCardData = findCard(activeIdStr);
    if (!activeCardData) return;

    // Determine the target column
    let targetColumnId: string;
    if (overId.startsWith('column-')) {
      targetColumnId = overId.replace('column-', '');
    } else {
      // Over another card - find its column
      const overCardData = findCard(overId);
      if (!overCardData) return;
      targetColumnId = overCardData.column._id;
    }

    // Get current column of the card (from current state, not original)
    const currentColumnId = activeCardData.column._id;

    // If moving to a different column, update optimistically
    if (currentColumnId !== targetColumnId) {
      const targetColumn = findColumn(targetColumnId);
      if (!targetColumn) return;

      // Calculate new order - place at end of target column
      const newOrder = targetColumn.cards?.length || 0;
      optimisticMoveCard(
        activeIdStr,
        currentColumnId,
        targetColumnId,
        newOrder
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      // If dropped outside, refetch to reset state
      if (activeType === 'card' && draggedCardOriginalColumn) {
        await fetchBoard(boardId);
      }
      setActiveId(null);
      setActiveType(null);
      setDraggedCardOriginalColumn(null);
      return;
    }

    const activeIdStr = String(active.id);
    const overId = String(over.id);

    if (activeType === 'column') {
      // Handle column reordering
      const activeColumnId = activeIdStr.replace('column-', '');
      const overColumnId = overId.replace('column-', '');

      if (activeColumnId !== overColumnId) {
        const activeIndex = columns.findIndex((col) => col._id === activeColumnId);
        const overIndex = columns.findIndex((col) => col._id === overColumnId);

        if (activeIndex !== -1 && overIndex !== -1) {
          const newColumns = arrayMove(columns, activeIndex, overIndex);
          await reorderColumns(newColumns);
        }
      }
    } else if (activeType === 'card') {
      // Handle card movement - find card in its current position (after optimistic updates)
      const activeCardData = findCard(activeIdStr);
      if (!activeCardData) {
        setActiveId(null);
        setActiveType(null);
        setDraggedCardOriginalColumn(null);
        return;
      }

      // Determine target column and order based on where we dropped
      let targetColumnId: string;
      let newOrder: number;

      if (overId.startsWith('column-')) {
        // Dropped on a column (empty area or column header)
        targetColumnId = overId.replace('column-', '');
      } else {
        // Dropped on a card - get that card's column
        const overCardData = findCard(overId);
        if (!overCardData) {
          setActiveId(null);
          setActiveType(null);
          setDraggedCardOriginalColumn(null);
          return;
        }
        targetColumnId = overCardData.column._id;
      }

      // Get the target column's current state
      const targetColumn = findColumn(targetColumnId);
      if (!targetColumn) {
        setActiveId(null);
        setActiveType(null);
        setDraggedCardOriginalColumn(null);
        return;
      }

      // Find the card's current position in the target column
      const currentCards = targetColumn.cards || [];
      const cardIndex = currentCards.findIndex((c) => c._id === activeIdStr);

      if (cardIndex !== -1) {
        // Card is in this column - use its current index as the order
        newOrder = cardIndex;
      } else {
        // Card not found in target column - place at end
        newOrder = currentCards.length;
      }

      // Make API call to persist the move
      try {
        await moveCard(activeIdStr, targetColumnId, newOrder);
      } catch (err) {
        // Error handled in store - board will be refetched
        console.error('Failed to move card:', err);
      }
    }

    setActiveId(null);
    setActiveType(null);
    setDraggedCardOriginalColumn(null);
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;

    setIsLoading(true);
    try {
      await createColumn(boardId, { name: newColumnName.trim() });
      setNewColumnName('');
      setIsAddingColumn(false);
    } catch (err) {
      // Error handled in store
    } finally {
      setIsLoading(false);
    }
  };

  // Get active item for drag overlay
  const activeColumn = activeType === 'column' && activeId
    ? columns.find((col) => `column-${col._id}` === activeId)
    : null;

  const activeCard = activeType === 'card' && activeId
    ? findCard(String(activeId))?.card
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 px-2">
        <SortableContext
          items={columnIds}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column._id}
              column={column}
              cards={column.cards || []}
            />
          ))}
        </SortableContext>

        {/* Add Column */}
        {isAddingColumn ? (
          <div className="min-w-[300px] max-w-[300px]">
            <Stack gap="xs">
              <TextInput
                placeholder="Column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddColumn();
                  if (e.key === 'Escape') {
                    setIsAddingColumn(false);
                    setNewColumnName('');
                  }
                }}
              />
              <Group gap="xs">
                <Button
                  size="xs"
                  onClick={handleAddColumn}
                  loading={isLoading}
                  disabled={!newColumnName.trim()}
                >
                  Add Column
                </Button>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => {
                    setIsAddingColumn(false);
                    setNewColumnName('');
                  }}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            </Stack>
          </div>
        ) : (
          <Button
            variant="light"
            color="gray"
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsAddingColumn(true)}
            className="min-w-[200px] h-[60px] border-2 border-dashed border-gray-300 hover:border-gray-400"
          >
            Add Column
          </Button>
        )}
      </div>

      <DragOverlay>
        {activeColumn && (
          <KanbanColumnOverlay
            column={activeColumn}
            cards={activeColumn.cards || []}
          />
        )}
        {activeCard && <KanbanCardOverlay card={activeCard} />}
      </DragOverlay>
    </DndContext>
  );
}
