import { create } from 'zustand';
import type {
  Board,
  Column,
  Card,
  CreateColumnRequest,
  CreateCardRequest,
  UpdateBoardRequest,
  UpdateColumnRequest,
  UpdateCardRequest,
} from '../types';
import { boardsApi } from '../api';

interface BoardState {
  currentBoard: Board | null;
  columns: Column[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBoard: (boardId: string) => Promise<void>;
  createColumn: (boardId: string, data: CreateColumnRequest) => Promise<void>;
  updateColumn: (columnId: string, data: UpdateColumnRequest) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  reorderColumns: (columns: Column[]) => Promise<void>;
  createCard: (columnId: string, data: CreateCardRequest) => Promise<void>;
  updateCard: (cardId: string, data: UpdateCardRequest) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, targetColumnId: string, newOrder: number) => Promise<void>;
  optimisticMoveCard: (
    cardId: string,
    sourceColumnId: string,
    targetColumnId: string,
    newOrder: number
  ) => void;
  updateBoard: (boardId: string, data: UpdateBoardRequest) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  clearBoard: () => void;
  clearError: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  currentBoard: null,
  columns: [],
  isLoading: false,
  error: null,

  fetchBoard: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardsApi.getBoard(boardId);
      if (response.success) {
        const { board, columns } = response.data;
        // Sort columns by order
        const sortedColumns = columns
          .map((col) => ({
            ...col,
            cards: (col.cards || []).sort((a, b) => a.order - b.order),
          }))
          .sort((a, b) => a.order - b.order);
        set({ currentBoard: board, columns: sortedColumns, isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch board.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createColumn: async (boardId: string, data: CreateColumnRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardsApi.createColumn(boardId, data);
      if (response.success) {
        const newColumn = { ...response.data, cards: [] };
        set((state) => ({
          columns: [...state.columns, newColumn],
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create column.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateColumn: async (columnId: string, data: UpdateColumnRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardsApi.updateColumn(columnId, data);
      if (response.success) {
        set((state) => ({
          columns: state.columns.map((col) =>
            col._id === columnId ? { ...col, ...response.data } : col
          ),
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update column.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteColumn: async (columnId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardsApi.deleteColumn(columnId);
      if (response.success) {
        set((state) => ({
          columns: state.columns.filter((col) => col._id !== columnId),
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete column.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  reorderColumns: async (columns: Column[]) => {
    const previousColumns = get().columns;
    // Optimistic update
    set({ columns });

    try {
      const reorderData = columns.map((col, index) => ({
        columnId: col._id,
        order: index,
      }));
      await boardsApi.reorderColumns(reorderData);
    } catch (error: unknown) {
      // Revert on error
      set({ columns: previousColumns });
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to reorder columns.';
      set({ error: errorMessage });
      throw error;
    }
  },

  createCard: async (columnId: string, data: CreateCardRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardsApi.createCard(columnId, data);
      if (response.success) {
        const newCard = response.data;
        set((state) => ({
          columns: state.columns.map((col) =>
            col._id === columnId
              ? { ...col, cards: [...(col.cards || []), newCard] }
              : col
          ),
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create card.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateCard: async (cardId: string, data: UpdateCardRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardsApi.updateCard(cardId, data);
      if (response.success) {
        const updatedCard = response.data;
        set((state) => ({
          columns: state.columns.map((col) => ({
            ...col,
            cards: col.cards?.map((card) =>
              card._id === cardId ? { ...card, ...updatedCard } : card
            ),
          })),
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update card.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteCard: async (cardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardsApi.deleteCard(cardId);
      if (response.success) {
        set((state) => ({
          columns: state.columns.map((col) => ({
            ...col,
            cards: col.cards?.filter((card) => card._id !== cardId),
          })),
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete card.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  optimisticMoveCard: (
    cardId: string,
    sourceColumnId: string,
    targetColumnId: string,
    newOrder: number
  ) => {
    set((state) => {
      const columns = [...state.columns];

      // Find and remove card from source column
      const sourceCol = columns.find((c) => c._id === sourceColumnId);
      const targetCol = columns.find((c) => c._id === targetColumnId);

      if (!sourceCol || !targetCol) return state;

      const cardIndex = sourceCol.cards?.findIndex((c) => c._id === cardId) ?? -1;
      if (cardIndex === -1) return state;

      const [card] = sourceCol.cards!.splice(cardIndex, 1);
      card.columnId = targetColumnId;
      card.order = newOrder;

      // Insert card into target column at correct position
      targetCol.cards = targetCol.cards || [];
      targetCol.cards.splice(newOrder, 0, card);

      // Update orders for target column cards
      targetCol.cards.forEach((c, i) => {
        c.order = i;
      });

      // Update orders for source column if different
      if (sourceColumnId !== targetColumnId) {
        sourceCol.cards?.forEach((c, i) => {
          c.order = i;
        });
      }

      return { columns };
    });
  },

  moveCard: async (cardId: string, targetColumnId: string, newOrder: number) => {
    const boardId = get().currentBoard?._id;
    try {
      const response = await boardsApi.moveCard(cardId, { columnId: targetColumnId, order: newOrder });
      // Update local state with the response to ensure sync
      if (response.success && response.data) {
        const updatedCard = response.data;
        set((state) => ({
          columns: state.columns.map((col) => ({
            ...col,
            cards: col.cards
              ?.map((c) => (c._id === cardId ? { ...c, ...updatedCard } : c))
              .sort((a, b) => a.order - b.order),
          })),
        }));
      }
    } catch (error: unknown) {
      // Refetch board to sync state on error
      if (boardId) {
        get().fetchBoard(boardId);
      }
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to move card.';
      set({ error: errorMessage });
      throw error;
    }
  },

  updateBoard: async (boardId: string, data: UpdateBoardRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardsApi.updateBoard(boardId, data);
      if (response.success) {
        set((state) => ({
          currentBoard: state.currentBoard
            ? { ...state.currentBoard, ...response.data }
            : null,
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update board.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteBoard: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardsApi.deleteBoard(boardId);
      if (response.success) {
        set({ currentBoard: null, columns: [], isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete board.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearBoard: () => {
    set({ currentBoard: null, columns: [] });
  },

  clearError: () => set({ error: null }),
}));
