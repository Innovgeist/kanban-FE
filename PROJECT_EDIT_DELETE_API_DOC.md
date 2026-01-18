# Project Edit & Delete API Documentation

## Overview
This document outlines the backend API endpoints required to support project editing and deletion functionality for Super Admins.

---

## 1. Update Project Endpoint

### Endpoint: `PATCH /projects/:projectId`

**Description:** Allows Super Admins to update project details (currently only the project name).

**Authorization:** 
- Requires authentication (valid JWT token)
- Only `SUPERADMIN` role can update projects

**Request:**
```json
{
  "name": "Updated Project Name"
}
```

**Request Parameters:**
- `projectId` (URL parameter): The ID of the project to update

**Request Body:**
- `name` (string, required): New project name (must be at least 1 character)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Project Name",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439010",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Project name is required",
  "code": "VALIDATION_ERROR"
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**Response (Error - 403):**
```json
{
  "success": false,
  "message": "Only Super Admins can update projects",
  "code": "SUPERADMIN_REQUIRED"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Project not found",
  "code": "PROJECT_NOT_FOUND"
}
```

---

## 2. Delete Project Endpoint

### Endpoint: `DELETE /projects/:projectId`

**Description:** Allows Super Admins to delete a project. This should cascade delete all associated data (boards, columns, cards, members).

**Authorization:** 
- Requires authentication (valid JWT token)
- Only `SUPERADMIN` role can delete projects

**Request Parameters:**
- `projectId` (URL parameter): The ID of the project to delete

**Request Body:** None

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**Response (Error - 403):**
```json
{
  "success": false,
  "message": "Only Super Admins can delete projects",
  "code": "SUPERADMIN_REQUIRED"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Project not found",
  "code": "PROJECT_NOT_FOUND"
}
```

---

## 3. Validation Rules

### Update Project
- `name`: 
  - Required field
  - Must be a non-empty string
  - Minimum length: 1 character
  - Should be trimmed (leading/trailing whitespace removed)

### Delete Project
- Project must exist
- Should cascade delete:
  - All boards in the project
  - All columns in those boards
  - All cards in those columns
  - All project members
  - Any other related data

---

## 4. Authorization Logic

### Update Project
```javascript
// Pseudo-code
if (!user.isAuthenticated) {
  return 401 UNAUTHORIZED
}

if (user.role !== 'SUPERADMIN') {
  return 403 SUPERADMIN_REQUIRED
}

// Proceed with update
```

### Delete Project
```javascript
// Pseudo-code
if (!user.isAuthenticated) {
  return 401 UNAUTHORIZED
}

if (user.role !== 'SUPERADMIN') {
  return 403 SUPERADMIN_REQUIRED
}

// Proceed with cascade delete
```

---

## 5. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data (e.g., empty name) |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `SUPERADMIN_REQUIRED` | 403 | User is not a Super Admin |
| `PROJECT_NOT_FOUND` | 404 | Project with given ID does not exist |

---

## 6. Database Considerations

### Update Project
- Update the `name` field in the Project document
- Update `updatedAt` timestamp if you track it
- No cascade updates needed

### Delete Project
- **Cascade Delete Required:**
  1. Delete all ProjectMember documents for this project
  2. Delete all Board documents for this project
  3. For each board, delete all Column documents
  4. For each column, delete all Card documents
  5. Finally, delete the Project document itself

- **Transaction Recommended:** Use database transactions to ensure atomicity of the cascade delete operation

---

## 7. Example API Calls

### Update Project
```bash
curl -X PATCH http://localhost:3000/api/projects/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <superadmin_token>" \
  -d '{
    "name": "Updated Project Name"
  }'
```

### Delete Project
```bash
curl -X DELETE http://localhost:3000/api/projects/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <superadmin_token>"
```

---

## 8. Frontend Integration Notes

### Update Project
- Frontend sends: `PATCH /projects/:projectId` with `{ name: string }`
- Frontend expects: Updated project object in response
- Frontend updates local state with the new project data

### Delete Project
- Frontend sends: `DELETE /projects/:projectId`
- Frontend expects: `{ success: true, data: { message: string } }`
- Frontend removes the project from the local projects list
- Frontend navigates user away if they're viewing the deleted project

---

## 9. Testing Checklist

### Update Project
- [ ] Super Admin can update project name
- [ ] Non-Super Admin receives 403 error
- [ ] Unauthenticated user receives 401 error
- [ ] Invalid project ID returns 404
- [ ] Empty name returns validation error
- [ ] Updated project is returned in response
- [ ] Project name is trimmed of whitespace

### Delete Project
- [ ] Super Admin can delete project
- [ ] Non-Super Admin receives 403 error
- [ ] Unauthenticated user receives 401 error
- [ ] Invalid project ID returns 404
- [ ] All boards are deleted
- [ ] All columns are deleted
- [ ] All cards are deleted
- [ ] All project members are deleted
- [ ] Project is deleted
- [ ] Cascade delete is atomic (transaction)

---

## 10. Important Notes

1. **Authorization**: Both endpoints MUST check for `SUPERADMIN` role. Regular admins or members should not be able to edit/delete projects.

2. **Cascade Delete**: The delete operation MUST cascade delete all related data. Consider using database transactions to ensure data integrity.

3. **Validation**: The update endpoint should validate that the name is not empty and is properly trimmed.

4. **Error Handling**: Return appropriate HTTP status codes and error messages for different failure scenarios.

5. **Response Format**: Follow the existing API response format with `success` boolean and `data`/`message` fields.

6. **Consistency**: These endpoints should follow the same patterns as other project endpoints (GET, POST) in terms of authentication, error handling, and response format.

---

## 11. Database Schema Reference

### Project Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  // ... other fields
}
```

### Related Models to Delete
- ProjectMember (projectId reference)
- Board (projectId reference)
- Column (boardId reference, through Board)
- Card (columnId reference, through Column)

---

## 12. Security Considerations

1. **Role Verification**: Always verify the user's role on the backend, never trust frontend-only checks
2. **Input Sanitization**: Sanitize and validate all input data
3. **Cascade Delete Safety**: Ensure cascade deletes don't accidentally delete unrelated data
4. **Audit Logging**: Consider logging project updates and deletions for audit purposes
5. **Rate Limiting**: Apply rate limiting to prevent abuse

---

## Quick Reference

| Endpoint | Method | Auth Required | Role Required | Description |
|----------|--------|---------------|---------------|-------------|
| `/projects/:projectId` | PATCH | Yes | SUPERADMIN | Update project name |
| `/projects/:projectId` | DELETE | Yes | SUPERADMIN | Delete project and all related data |

---

## Questions for Backend Team

1. Should we track `updatedAt` timestamp for projects?
2. Do we need soft delete (mark as deleted) or hard delete (remove from database)?
3. Should we send notifications when a project is deleted?
4. Do we need to handle project deletion differently if it has active boards/cards?
5. Should we add a confirmation step or additional validation for deletion?

