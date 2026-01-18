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
  color?: string; // Hex color code (e.g., "#3b82f6")
  cards?: Card[];
}

export type CardPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Card {
  _id: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: CardPriority;
  expectedDeliveryDate?: string | null; // ISO 8601 date string
  assignedTo?: User[]; // Array of assigned users
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
  | 'GOOGLE_AUTH_FAILED'
  | 'INVALID_COLOR_FORMAT'
  | 'INVALID_PRIORITY'
  | 'INVALID_DATE_FORMAT'
  | 'USER_NOT_PROJECT_MEMBER'
  | 'INVALID_USER_ID';

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
  color?: string; // Hex color code (e.g., "#3b82f6")
}

export interface CreateCardRequest {
  title: string;
  description?: string;
  priority?: CardPriority;
  expectedDeliveryDate?: string | null; // ISO 8601 date string
  assignedTo?: string[]; // Array of user IDs
}

export interface MoveCardRequest {
  columnId: string;
  order: number;
}

export interface ReorderColumnItem {
  columnId: string;
  order: number;
}

export interface UpdateBoardRequest {
  name: string;
}

export interface UpdateColumnRequest {
  name?: string;
  color?: string; // Hex color code (e.g., "#3b82f6")
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  priority?: CardPriority | null; // Can be null to reset to default
  expectedDeliveryDate?: string | null; // ISO 8601 date string, can be null to remove
  assignedTo?: string[]; // Array of user IDs, empty array to remove all
}
