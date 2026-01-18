import apiClient from './client';
import type {
  ApiResponse,
  BoardViewResponse,
  Column,
  Card,
  CreateColumnRequest,
  CreateCardRequest,
  MoveCardRequest,
  ReorderColumnItem,
  UpdateBoardRequest,
  UpdateColumnRequest,
  UpdateCardRequest,
  Board,
} from '../types';

export const boardsApi = {
  getBoard: async (boardId: string): Promise<ApiResponse<BoardViewResponse>> => {
    const response = await apiClient.get<ApiResponse<BoardViewResponse>>(
      `/boards/${boardId}`
    );
    return response.data;
  },

  createColumn: async (
    boardId: string,
    data: CreateColumnRequest
  ): Promise<ApiResponse<Column>> => {
    const response = await apiClient.post<ApiResponse<Column>>(
      `/boards/${boardId}/columns`,
      data
    );
    return response.data;
  },

  reorderColumns: async (
    columns: ReorderColumnItem[]
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.patch<ApiResponse<{ message: string }>>(
      '/columns/reorder',
      columns
    );
    return response.data;
  },

  createCard: async (
    columnId: string,
    data: CreateCardRequest
  ): Promise<ApiResponse<Card>> => {
    const response = await apiClient.post<ApiResponse<Card>>(
      `/columns/${columnId}/cards`,
      data
    );
    return response.data;
  },

  moveCard: async (
    cardId: string,
    data: MoveCardRequest
  ): Promise<ApiResponse<Card>> => {
    const response = await apiClient.patch<ApiResponse<Card>>(
      `/cards/${cardId}/move`,
      data
    );
    return response.data;
  },

  updateBoard: async (
    boardId: string,
    data: UpdateBoardRequest
  ): Promise<ApiResponse<Board>> => {
    const response = await apiClient.patch<ApiResponse<Board>>(
      `/boards/${boardId}`,
      data
    );
    return response.data;
  },

  deleteBoard: async (
    boardId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/boards/${boardId}`
    );
    return response.data;
  },

  updateColumn: async (
    columnId: string,
    data: UpdateColumnRequest
  ): Promise<ApiResponse<Column>> => {
    const response = await apiClient.patch<ApiResponse<Column>>(
      `/columns/${columnId}`,
      data
    );
    return response.data;
  },

  deleteColumn: async (
    columnId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/columns/${columnId}`
    );
    return response.data;
  },

  updateCard: async (
    cardId: string,
    data: UpdateCardRequest
  ): Promise<ApiResponse<Card>> => {
    const response = await apiClient.patch<ApiResponse<Card>>(
      `/cards/${cardId}`,
      data
    );
    return response.data;
  },

  deleteCard: async (
    cardId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/cards/${cardId}`
    );
    return response.data;
  },
};
