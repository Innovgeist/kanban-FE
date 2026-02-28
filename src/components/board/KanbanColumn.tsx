import { useState } from "react";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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
  Menu,
  Modal,
  rem,
  Select,
  MultiSelect,
  Radio,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconPlus,
  IconGripVertical,
  IconX,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconArchive,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import type { Column, Card as CardType, CardPriority } from "../../types";
import { KanbanCard } from "./KanbanCard";
import { useBoardStore, useProjectStore } from "../../store";
import { notifications } from "@mantine/notifications";

interface KanbanColumnProps {
  column: Column;
  cards: CardType[];
  isProjectAdmin?: boolean;
}

export function KanbanColumn({
  column,
  cards,
  isProjectAdmin = false,
}: KanbanColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardPriority, setNewCardPriority] =
    useState<CardPriority>("MEDIUM");
  const [newCardDeliveryDate, setNewCardDeliveryDate] = useState<Date | null>(
    null,
  );
  const [newCardAssignedTo, setNewCardAssignedTo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
  const [cleanupDays, setCleanupDays] = useState<string>("14");
  const [customDays, setCustomDays] = useState<number | string>(1);
  const [cleanupMode, setCleanupMode] = useState<"HIDE" | "DELETE" | "NONE">(
    "NONE",
  );
  const [, setShowHidden] = useState(false);

  const { createCard, updateColumn, deleteColumn, fetchBoard } =
    useBoardStore();
  const { members } = useProjectStore();

  // Prepare member options for MultiSelect
  const memberOptions = members.map((member) => ({
    value: String(member.userId._id),
    label: member.userId.name || member.userId.email,
  }));

  const columnForm = useForm({
    initialValues: {
      name: column.name,
      color: column.color || "#94a3b8",
    },
    validate: {
      name: (value) =>
        value.trim().length >= 1 ? null : "Column name is required",
      color: (value) => {
        if (!value) return null;
        const hexPattern = /^#([A-Fa-f0-9]{6})$/;
        return hexPattern.test(value)
          ? null
          : "Color must be a valid hex color code";
      },
    },
  });

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
      type: "column",
      column,
    },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `column-${column._id}`,
    data: {
      type: "column",
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
        priority: newCardPriority,
        expectedDeliveryDate: newCardDeliveryDate
          ? newCardDeliveryDate.toISOString()
          : undefined,
        assignedTo:
          newCardAssignedTo.length > 0 ? newCardAssignedTo : undefined,
      });
      setNewCardTitle("");
      setNewCardDescription("");
      setNewCardPriority("MEDIUM");
      setNewCardDeliveryDate(null);
      setNewCardAssignedTo([]);
      setIsAddingCard(false);
    } catch (err) {
      // Error handled in store
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditColumn = async (values: { name: string; color: string }) => {
    setActionLoading(true);
    try {
      await updateColumn(column._id, {
        name: values.name.trim(),
        color: values.color.trim(),
      });
      setEditModalOpen(false);
      notifications.show({
        title: "Success",
        message: "Column updated successfully",
        color: "green",
      });
    } catch (err) {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteColumn = async () => {
    setActionLoading(true);
    try {
      await deleteColumn(column._id);
      setDeleteModalOpen(false);
      notifications.show({
        title: "Success",
        message: "Column deleted successfully",
        color: "green",
      });
    } catch (err) {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };
  const visibleCards = (cards || []).filter((card) => !card.isHidden);
  const hiddenCards = (cards || []).filter((card) => card.isHidden);

  const cardIds = visibleCards.map((card) => card._id);

  return (
    <Card
      ref={setSortableRef}
      style={{
        ...style,
        position: "relative",
        overflow:'visible',
        backgroundColor: column.color || "#f3f4f6",
      }}
      withBorder
      radius="md"
      p="sm"
      className="min-w-[300px] max-w-[300px] flex flex-col max-h-[calc(100vh-200px)]"
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
        </Group>
        <Group>
          <Badge
            size="sm"
            variant="filled"
            color="gray"
            leftSection={<IconEye size={12} />}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              opacity: visibleCards.length === 0 ? 0.5 : 1,
            }}
          >
            {visibleCards.length}
          </Badge>

          <Badge
            size="sm"
            variant="filled"
            color="red"
            leftSection={<IconEyeOff size={12} />}
            style={{
              cursor: hiddenCards.length > 0 ? "pointer" : "not-allowed",
              opacity: hiddenCards.length > 0 ? 1 : 0.5,
            }}
            onClick={() => {
              if (hiddenCards.length === 0) return;
              setShowHidden((prev) => !prev);
            }}
          >
            {hiddenCards.length}
          </Badge>

          {isProjectAdmin && (
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
                  leftSection={
                    <IconEdit style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    columnForm.setValues({
                      name: column.name,
                      color: column.color || "#f3f4f6",
                    });
                    setEditModalOpen(true);
                  }}
                >
                  Edit Column
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={
                    <IconTrash style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteModalOpen(true);
                  }}
                >
                  Delete Column
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={
                    <IconArchive style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setCleanupMode("HIDE");
                    setCleanupDays("14");
                    setCleanupModalOpen(true);
                  }}
                >
                  Auto Cleanup Tickets
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>

      {/* Cards Container */}
      <div
        ref={setDroppableRef}
        className="flex-1 overflow-y-auto min-h-[100px]"
        style={{overflowY:'auto',
          overflowX:'visible',
          paddingBottom:isAddingCard ? 230:64,
        }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {visibleCards.map((card) => (
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
      <div
  style={{
    position: "absolute",
    left:0,
    right:0,
    bottom: 0,
    zIndex: 1,
    background: column.color || "#f3f4f6",
    padding:8,
    borderTop:'1px solid rgba(0,0,0,0.08)'
  }}
>    
      {isAddingCard ? (
        <Stack gap="xs">
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
          <Select
            placeholder="Priority"
            size="sm"
            value={newCardPriority}
            onChange={(value) =>
              setNewCardPriority((value as CardPriority) || "MEDIUM")
            }
            data={[
              { value: "LOW", label: "Low" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High" },
              { value: "URGENT", label: "Urgent" },
            ]}
          />
          <TextInput
            type="date"
            placeholder="Delivery date (optional)"
            size="sm"
            value={
              newCardDeliveryDate
                ? newCardDeliveryDate.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => {
              setNewCardDeliveryDate(
                e.target.value ? new Date(e.target.value) : null,
              );
            }}
          />
          <MultiSelect
            placeholder="Assign to (optional)"
            size="sm"
            data={memberOptions}
            value={newCardAssignedTo}
            onChange={(v)=> {  
              setNewCardAssignedTo(v ?? [] )}}
            clearable
            searchable
           comboboxProps={{ withinPortal: true }}
           styles={{ dropdown: { zIndex: 999999 } }}

          />
          <Group gap="xs">
            <Button
              size="xs"
              onClick={handleAddCard}
              loading={isLoading}
              disabled={!newCardTitle.trim()}
              color="blue"
            >
              Add Card
            </Button>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => {
                setIsAddingCard(false);
                setNewCardTitle("");
                setNewCardDescription("");
                setNewCardPriority("MEDIUM");
                setNewCardDeliveryDate(null);
                setNewCardAssignedTo([]);
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
          onClick={() => setIsAddingCard(true)}
          className="hover:bg-gray-200"
        >
          Add Card
        </Button>
      )}
      </div>

      {/* Edit Column Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Column"
        centered
      >
        <form onSubmit={columnForm.onSubmit(handleEditColumn)}>
          <Stack gap="md">
            <TextInput
              label="Column Name"
              placeholder="Enter column name"
              required
              {...columnForm.getInputProps("name")}
            />
            <Select
              label="Column Color"
              placeholder="Select a color"
              data={[
                { value: "#e0f2fe", label: "Light Blue" },
                { value: "#fef3c7", label: "Light Yellow" },
                { value: "#d1fae5", label: "Light Green" },
                { value: "#fee2e2", label: "Light Red" },
                { value: "#e9d5ff", label: "Light Purple" },
                { value: "#fce7f3", label: "Light Pink" },
                { value: "#cffafe", label: "Light Cyan" },
                { value: "#fed7aa", label: "Light Orange" },
                { value: "#f3f4f6", label: "Light Gray" },
              ]}
              renderOption={({ option }) => (
                <Group gap="xs">
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      backgroundColor: option.value,
                      border: "1px solid #e0e0e0",
                    }}
                  />
                  <Text size="sm">{option.label}</Text>
                </Group>
              )}
              leftSection={
                columnForm.values.color ? (
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      backgroundColor: columnForm.values.color,
                      border: "1px solid #e0e0e0",
                    }}
                  />
                ) : null
              }
              {...columnForm.getInputProps("color")}
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
      

      {/* Delete Column Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Column"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete this column? This action is
            irreversible and will delete all cards in this column.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDeleteColumn}
              loading={actionLoading}
            >
              Delete Column
            </Button>
          </Group>
        </Stack>
      </Modal>
      {/* in the column edit feature */}
      <Modal
        opened={cleanupModalOpen}
        onClose={() => setCleanupModalOpen(false)}
        title="Auto Cleanup Tickets"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Automatically hide or delete tickets in this column after a
            specified time.
          </Text>

          {/* Mode */}
          <Radio.Group
            value={cleanupMode}
            onChange={(value) => setCleanupMode(value as any)}
            label="Action"
          >
            <Stack gap="xs" mt="xs">
              <Radio value="NONE" label="None (No cleanup)" />
              <Radio value="HIDE" label="Hide (Archive tickets)" />
              <Radio value="DELETE" label="Delete (Soft delete tickets)" />
            </Stack>
          </Radio.Group>

          {/* Duration */}
          <Select
            label="After how many days?"
            value={cleanupDays}
            onChange={(value) => setCleanupDays(value || "14")}
            data={[
              { value: "7", label: "7 days" },
              { value: "14", label: "14 days (recommended)" },
              { value: "30", label: "30 days" },
              { value: "custom", label: "Custom" },
            ]}
          />

          {cleanupDays === "custom" && (
            <NumberInput
              label="Enter number of days"
              value={customDays}
              onChange={(value) => setCustomDays(value)}
              min={1}
              max={365}
              placeholder="Enter days"
            />
          )}

          {cleanupMode === "DELETE" && (
            <Text size="xs" c="red">
              ⚠ This will permanently delete tickets. This action is
              irreversible.
            </Text>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setCleanupModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color={cleanupMode === "DELETE" ? "red" : "blue"}
              loading={actionLoading}
              disabled={cleanupMode === "NONE"}
              onClick={async () => {
                setActionLoading(true);
                try {
                  const days =
                    cleanupDays === "custom"
                      ? Number(customDays)
                      : Number(cleanupDays);

                  const mode = cleanupMode === "NONE" ? null : cleanupMode;

                  // ✅ store settings + run cleanup
                  await updateColumn(column._id, {
                    autoCleanupMode: mode,
                    autoCleanupAfterDays: mode ? days : null,
                    runCleanupNow: true,
                  });

                  const boardId =
                    typeof column.boardId === "string"
                      ? column.boardId
                      : (column.boardId as any)?._id;

                  // ✅ refresh UI so hidden cards disappear
                  if (boardId) await fetchBoard(boardId);

                  setCleanupModalOpen(false);

                  notifications.show({
                    title: "Success",
                    message:
                      mode === null
                        ? "Cleanup disabled for this column."
                        : `Cleanup executed (${mode}) for cards older than ${days} day(s).`,
                    color: "green",
                  });
                } catch (err) {
                  notifications.show({
                    title: "Error",
                    message: "Failed to run cleanup",
                    color: "red",
                  });
                } finally {
                  setActionLoading(false);
                }
              }}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
}

export function KanbanColumnOverlay({ column, cards }: KanbanColumnProps) {
  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{
        backgroundColor: column.color || "#f3f4f6",
      }}
      className="min-w-[300px] max-w-[300px] shadow-lg ring-2 ring-blue-400 "
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
