import apiClient from './client';
import type {
  ApiResponse,
  Project,
  ProjectMember,
  CreateProjectRequest,
  AddMemberRequest,
  AddMemberResponse,
  Board,
} from '../types';

export const projectsApi = {
  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    const response = await apiClient.get<ApiResponse<Project[]>>('/projects');
    return response.data;
  },

  getProject: async (projectId: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.get<ApiResponse<Project>>(
      `/projects/${projectId}`
    );
    return response.data;
  },

  createProject: async (data: CreateProjectRequest): Promise<ApiResponse<Project>> => {
    const response = await apiClient.post<ApiResponse<Project>>(
      '/projects',
      data
    );
    return response.data;
  },

  getProjectMembers: async (projectId: string): Promise<ApiResponse<ProjectMember[]>> => {
    const response = await apiClient.get<ApiResponse<ProjectMember[]>>(
      `/projects/${projectId}/members`
    );
    return response.data;
  },

  addProjectMember: async (
    projectId: string,
    data: AddMemberRequest
  ): Promise<ApiResponse<AddMemberResponse>> => {
    const response = await apiClient.post<ApiResponse<AddMemberResponse>>(
      `/projects/${projectId}/members`,
      data
    );
    return response.data;
  },

  removeProjectMember: async (
    projectId: string,
    userId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/projects/${projectId}/members/${userId}`
    );
    return response.data;
  },

  getProjectBoards: async (projectId: string): Promise<ApiResponse<Board[]>> => {
    const response = await apiClient.get<ApiResponse<Board[]>>(
      `/projects/${projectId}/boards`
    );
    return response.data;
  },

  createBoard: async (
    projectId: string,
    data: { name: string }
  ): Promise<ApiResponse<Board>> => {
    const response = await apiClient.post<ApiResponse<Board>>(
      `/projects/${projectId}/boards`,
      data
    );
    return response.data;
  },
};
