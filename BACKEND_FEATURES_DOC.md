# Backend API Enhancement Documentation

## Overview
This document outlines the backend changes required to support the following features:
1. Column color association
2. Card priority tags
3. Card creation date (enhancement)
4. Expected delivery date for cards
5. Multiple member assignment to cards

---

## 1. Column Color Feature

### Model Changes: Column Schema
- **Add field:** `color` (String, optional)
- **Validation:** 
  - Must be a valid hex color code (e.g., "#FF5733", "#3498db")
  - Format: 7 characters starting with "#" followed by 6 hexadecimal characters
  - Default: null or a default color like "#94a3b8" (gray)

### API Changes

#### Update Column Endpoint: `PATCH /columns/:columnId`
- **Request Body Enhancement:**
  ```json
  {
    "name": "In Progress",
    "color": "#3b82f6"  // NEW: Optional color field
  }
  ```
- **Response Enhancement:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "696c8480b400874856325164",
      "boardId": "696c7cadef41bfb675646640",
      "name": "In Progress",
      "color": "#3b82f6",  // NEW: Include color in response
      "order": 0
    }
  }
  ```

#### Create Column Endpoint: `POST /boards/:boardId/columns`
- **Request Body Enhancement:**
  ```json
  {
    "name": "Review",
    "color": "#f59e0b"  // NEW: Optional color field
  }
  ```
- **Response Enhancement:** Include `color` field in the created column response

#### Get Board Endpoint: `GET /boards/:boardId`
- **Response Enhancement:** All columns in the response should include the `color` field
  ```json
  {
    "success": true,
    "data": {
      "board": { ... },
      "columns": [
        {
          "_id": "...",
          "boardId": "...",
          "name": "Todo",
          "color": "#94a3b8",  // NEW: Include color
          "order": 0,
          "cards": [...]
        }
      ]
    }
  }
  ```

---

## 2. Card Priority Feature

### Model Changes: Card Schema
- **Add field:** `priority` (String, optional)
- **Validation:**
  - Must be one of: "LOW", "MEDIUM", "HIGH", "URGENT"
  - Case-insensitive input, but stored in uppercase
  - Default: null or "MEDIUM"

### API Changes

#### Create Card Endpoint: `POST /columns/:columnId/cards`
- **Request Body Enhancement:**
  ```json
  {
    "title": "Fix authentication bug",
    "description": "Update JWT token validation",
    "priority": "HIGH"  // NEW: Optional priority field
  }
  ```
- **Response Enhancement:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "696c848bb40087485632516d",
      "columnId": "696c8480b400874856325164",
      "title": "Fix authentication bug",
      "description": "Update JWT token validation",
      "priority": "HIGH",  // NEW: Include priority
      "order": 0,
      "createdBy": { ... },
      "createdAt": "2024-01-17T10:00:00.000Z"
    }
  }
  ```

#### Update Card Endpoint: `PATCH /cards/:cardId`
- **Request Body Enhancement:**
  ```json
  {
    "title": "Updated title",
    "description": "Updated description",
    "priority": "URGENT"  // NEW: Optional priority field
  }
  ```
- **Response Enhancement:** Include `priority` field in updated card response

#### Get Board Endpoint: `GET /boards/:boardId`
- **Response Enhancement:** All cards in the response should include the `priority` field

---

## 3. Expected Delivery Date Feature

### Model Changes: Card Schema
- **Add field:** `expectedDeliveryDate` (Date, optional)
- **Validation:**
  - Must be a valid ISO 8601 date string
  - Should be a future date (optional validation - can allow past dates for flexibility)
  - Default: null

### API Changes

#### Create Card Endpoint: `POST /columns/:columnId/cards`
- **Request Body Enhancement:**
  ```json
  {
    "title": "Complete feature X",
    "description": "Implement new feature",
    "expectedDeliveryDate": "2024-02-15T00:00:00.000Z"  // NEW: Optional date field
  }
  ```
- **Response Enhancement:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "...",
      "columnId": "...",
      "title": "Complete feature X",
      "expectedDeliveryDate": "2024-02-15T00:00:00.000Z",  // NEW: Include date
      "createdAt": "2024-01-17T10:00:00.000Z",
      ...
    }
  }
  ```

#### Update Card Endpoint: `PATCH /cards/:cardId`
- **Request Body Enhancement:**
  ```json
  {
    "title": "Updated title",
    "expectedDeliveryDate": "2024-03-01T00:00:00.000Z"  // NEW: Optional date field
  }
  ```
- **Note:** Should allow setting to null to remove the date
- **Response Enhancement:** Include `expectedDeliveryDate` field in updated card response

#### Get Board Endpoint: `GET /boards/:boardId`
- **Response Enhancement:** All cards should include `expectedDeliveryDate` field

---

## 4. Multiple Member Assignment Feature

### Model Changes: Card Schema
- **Add field:** `assignedTo` (Array of ObjectId references, optional)
- **Validation:**
  - Array of valid user IDs
  - Each user ID must exist in the project members
  - User must be a member of the project that owns the board
  - Can be empty array (no assignments)
  - Default: empty array `[]`

### Database Consideration
- Store as array of ObjectId references to User collection
- Or store as array of ObjectId references to ProjectMember collection (recommended for easier validation)

### API Changes

#### Create Card Endpoint: `POST /columns/:columnId/cards`
- **Request Body Enhancement:**
  ```json
  {
    "title": "Implement new feature",
    "description": "Add user authentication",
    "assignedTo": [  // NEW: Array of user IDs
      "507f1f77bcf86cd799439014",
      "507f1f77bcf86cd799439015"
    ]
  }
  ```
- **Validation:**
  - Verify all user IDs in `assignedTo` array are valid
  - Verify all users are members of the project that owns the board
  - Return error if any user is not a project member
- **Response Enhancement:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "696c848bb40087485632516d",
      "columnId": "696c8480b400874856325164",
      "title": "Implement new feature",
      "assignedTo": [  // NEW: Populated user objects
        {
          "_id": "507f1f77bcf86cd799439014",
          "name": "John Doe",
          "email": "john@example.com"
        },
        {
          "_id": "507f1f77bcf86cd799439015",
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      ],
      "createdBy": { ... },
      "createdAt": "2024-01-17T10:00:00.000Z"
    }
  }
  ```
- **Note:** Populate the `assignedTo` array with full user objects (name, email, etc.) in the response

#### Update Card Endpoint: `PATCH /cards/:cardId`
- **Request Body Enhancement:**
  ```json
  {
    "title": "Updated title",
    "assignedTo": [  // NEW: Array of user IDs
      "507f1f77bcf86cd799439014"
    ]
  }
  ```
- **Validation:**
  - Same validation as create endpoint
  - Allow empty array to remove all assignments
- **Response Enhancement:** Include populated `assignedTo` array in response

#### Get Board Endpoint: `GET /boards/:boardId`
- **Response Enhancement:** All cards should include populated `assignedTo` array with user objects

---

## 5. Enhanced Card Response Structure

### Complete Card Response Example
After all enhancements, a card response should look like:

```json
{
  "success": true,
  "data": {
    "_id": "696c848bb40087485632516d",
    "columnId": "696c8480b400874856325164",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication system",
    "priority": "HIGH",
    "expectedDeliveryDate": "2024-02-15T00:00:00.000Z",
    "assignedTo": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "name": "John Doe",
        "email": "john@example.com"
      },
      {
        "_id": "507f1f77bcf86cd799439015",
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    ],
    "order": 0,
    "createdBy": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-17T10:00:00.000Z"
  }
}
```

---

## 6. Error Responses

### New Error Codes
- `INVALID_COLOR_FORMAT` - When column color is not a valid hex color
- `INVALID_PRIORITY` - When card priority is not one of the allowed values
- `INVALID_DATE_FORMAT` - When expected delivery date is not a valid date
- `USER_NOT_PROJECT_MEMBER` - When assigned user is not a member of the project
- `INVALID_USER_ID` - When assigned user ID is invalid or doesn't exist

### Example Error Response
```json
{
  "success": false,
  "message": "One or more assigned users are not project members",
  "code": "USER_NOT_PROJECT_MEMBER",
  "details": {
    "invalidUserIds": ["507f1f77bcf86cd799439099"]
  }
}
```

---

## 7. Validation Rules Summary

### Column Color
- Format: Hex color code (#RRGGBB)
- Optional field
- Default: null or "#94a3b8"

### Card Priority
- Values: "LOW", "MEDIUM", "HIGH", "URGENT"
- Case-insensitive input, uppercase storage
- Optional field
- Default: null or "MEDIUM"

### Expected Delivery Date
- Format: ISO 8601 date string
- Optional field
- Default: null
- Can be null to remove date

### Assigned To
- Array of user IDs
- All users must be project members
- Optional field
- Default: empty array
- Can be empty array to remove all assignments

---

## 8. Database Migration Considerations

1. **Add new fields to existing documents:**
   - Columns: Add `color` field (default: null or "#94a3b8")
   - Cards: Add `priority`, `expectedDeliveryDate`, `assignedTo` fields

2. **Index considerations:**
   - Consider indexing `assignedTo` array for faster queries
   - Consider indexing `expectedDeliveryDate` for date-based filtering
   - Consider indexing `priority` for priority-based sorting

3. **Backward compatibility:**
   - All new fields should be optional
   - Existing cards/columns should work without these fields
   - Default values should be provided when fields are missing

---

## 9. API Endpoints Summary

### Modified Endpoints
1. `POST /boards/:boardId/columns` - Add color support
2. `PATCH /columns/:columnId` - Add color support
3. `POST /columns/:columnId/cards` - Add priority, expectedDeliveryDate, assignedTo
4. `PATCH /cards/:cardId` - Add priority, expectedDeliveryDate, assignedTo
5. `GET /boards/:boardId` - Include all new fields in response

### No New Endpoints Required
All functionality can be added to existing endpoints through request/response enhancements.

---

## 10. Testing Checklist

### Column Color
- [ ] Create column with color
- [ ] Create column without color (should use default)
- [ ] Update column color
- [ ] Invalid color format returns error
- [ ] Color appears in all column responses

### Card Priority
- [ ] Create card with priority
- [ ] Create card without priority (should use default)
- [ ] Update card priority
- [ ] Invalid priority value returns error
- [ ] Priority appears in all card responses

### Expected Delivery Date
- [ ] Create card with delivery date
- [ ] Create card without delivery date
- [ ] Update card delivery date
- [ ] Set delivery date to null (remove date)
- [ ] Invalid date format returns error
- [ ] Date appears in all card responses

### Assigned To
- [ ] Create card with single assignment
- [ ] Create card with multiple assignments
- [ ] Create card without assignments
- [ ] Update card assignments
- [ ] Remove all assignments (empty array)
- [ ] Invalid user ID returns error
- [ ] Non-project member returns error
- [ ] Assigned users appear in all card responses (populated)

---

## 11. Implementation Notes

1. **Population Strategy:**
   - Always populate `assignedTo` array with full user objects in responses
   - Include: _id, name, email (and any other relevant user fields)

2. **Validation Order:**
   - First validate format (color, date, priority)
   - Then validate business rules (user membership, date logic)
   - Return specific error messages for each validation failure

3. **Default Values:**
   - Apply defaults at the model level or in the controller
   - Ensure defaults are consistent across all endpoints

4. **Response Consistency:**
   - All endpoints returning cards should include all new fields
   - Use the same population strategy for `assignedTo` everywhere
   - Maintain consistent date format (ISO 8601)

5. **Performance:**
   - Consider caching project members list for assignment validation
   - Use efficient population queries for `assignedTo` arrays
   - Consider pagination if cards have many assigned members

---

## 12. Frontend Integration Points

After backend implementation, frontend will need:
1. Color picker component for column colors
2. Priority selector (dropdown/badge) for cards
3. Date picker for expected delivery dates
4. Multi-select component for member assignment
5. Display components for all new fields in card UI

---

**End of Documentation**

