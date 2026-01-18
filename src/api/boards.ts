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
};
