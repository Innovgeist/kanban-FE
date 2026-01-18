import { create } from 'zustand';
import type { Project, ProjectMember, Board, CreateProjectRequest, UpdateProjectRequest, AddMemberRequest, AddMemberResponse } from '../types';
import { projectsApi } from '../api';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  members: ProjectMember[];
  boards: Board[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  selectProject: (project: Project) => void;
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (projectId: string, data: UpdateProjectRequest) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  fetchProjectMembers: (projectId: string) => Promise<void>;
  addMember: (projectId: string, data: AddMemberRequest) => Promise<AddMemberResponse>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  fetchProjectBoards: (projectId: string) => Promise<void>;
  createBoard: (projectId: string, name: string) => Promise<Board>;
  clearCurrentProject: () => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  members: [],
  boards: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.getProjects();
      if (response.success) {
        set({ projects: response.data, isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch projects.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  selectProject: (project: Project) => {
    set({ currentProject: project, members: [], boards: [] });
  },

  createProject: async (data: CreateProjectRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.createProject(data);
      if (response.success) {
        const newProject = response.data;
        set((state) => ({
          projects: [newProject, ...state.projects],
          isLoading: false,
        }));
        return newProject;
      }
      throw new Error('Failed to create project');
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create project.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateProject: async (projectId: string, data: UpdateProjectRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.updateProject(projectId, data);
      if (response.success) {
        set((state) => ({
          projects: state.projects.map((p) =>
            p._id === projectId ? { ...p, ...response.data } : p
          ),
          currentProject: state.currentProject?._id === projectId
            ? { ...state.currentProject, ...response.data }
            : state.currentProject,
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update project.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.deleteProject(projectId);
      if (response.success) {
        set((state) => ({
          projects: state.projects.filter((p) => p._id !== projectId),
          currentProject: state.currentProject?._id === projectId ? null : state.currentProject,
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete project.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchProjectMembers: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.getProjectMembers(projectId);
      if (response.success) {
        set({ members: response.data, isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch members.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addMember: async (projectId: string, data: AddMemberRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.addProjectMember(projectId, data);
      if (response.success) {
        const newMember = response.data;
        set((state) => ({
          members: [...state.members, newMember],
          isLoading: false,
        }));
        return newMember;
      }
      throw new Error('Failed to add member');
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to add member.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  removeMember: async (projectId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await projectsApi.removeProjectMember(projectId, userId);
      set((state) => ({
        members: state.members.filter((m) => m.userId._id !== userId),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to remove member.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchProjectBoards: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.getProjectBoards(projectId);
      if (response.success) {
        set({ boards: response.data, isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch boards.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createBoard: async (projectId: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.createBoard(projectId, { name });
      if (response.success) {
        const newBoard = response.data;
        set((state) => ({
          boards: [...state.boards, newBoard],
          isLoading: false,
        }));
        return newBoard;
      }
      throw new Error('Failed to create board');
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create board.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearCurrentProject: () => {
    set({ currentProject: null, members: [], boards: [] });
  },

  clearError: () => set({ error: null }),
}));
