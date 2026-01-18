// User Types
export type SystemRole = 'USER' | 'SUPERADMIN';
export type ProjectRole = 'ADMIN' | 'MEMBER';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: SystemRole;
  createdAt: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: Tokens;
}

// Project Types
export interface Project {
  _id: string;
  name: string;
  createdBy: User | string;
  createdAt: string;
  role?: ProjectRole;
}

export interface ProjectMember {
  _id: string;
  projectId: string;
  userId: User;
  role: ProjectRole;
}

// Add Member Response (includes invitation info if new user)
export interface AddMemberResponse extends ProjectMember {
  requiresPasswordSetup?: boolean;
  invitationToken?: string;
  invitationExpiresAt?: string;
}

// Board Types
export interface Board {
  _id: string;
  projectId: string;
  name: string;
  createdAt: string;
}

export interface Column {
  _id: string;
  boardId: string;
  name: string;
  order: number;
  cards?: Card[];
}

export interface Card {
  _id: string;
  columnId: string;
  title: string;
  description?: string;
  order: number;
  createdBy: User;
  createdAt: string;
}

// Board View Response (GET /boards/:boardId)
export interface BoardViewResponse {
  board: Board;
  columns: Column[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
}

// Error Codes
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NO_TOKEN'
  | 'INVALID_TOKEN'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_REFRESH_TOKEN'
  | 'UNAUTHORIZED'
  | 'SUPERADMIN_REQUIRED'
  | 'ADMIN_REQUIRED'
  | 'NOT_PROJECT_MEMBER'
  | 'USER_EXISTS'
  | 'USER_NOT_FOUND'
  | 'PROJECT_NOT_FOUND'
  | 'BOARD_NOT_FOUND'
  | 'COLUMN_NOT_FOUND'
  | 'CARD_NOT_FOUND'
  | 'MEMBER_EXISTS'
  | 'MEMBER_NOT_FOUND'
  | 'INVALID_INVITATION_TOKEN'
  | 'INVITATION_EXPIRED'
  | 'GOOGLE_AUTH_FAILED';

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateProjectRequest {
  name: string;
  projectManagerEmail?: string;
}

export interface AddMemberRequest {
  email: string;
  role: ProjectRole;
}

export interface CreateBoardRequest {
  name: string;
}

export interface CreateColumnRequest {
  name: string;
}

export interface CreateCardRequest {
  title: string;
  description?: string;
}

export interface MoveCardRequest {
  columnId: string;
  order: number;
}

export interface ReorderColumnItem {
  columnId: string;
  order: number;
}
