# API Documentation: AI Chatbot Integration

## Base URL
All endpoints are relative to the base URL: `https://your-domain.com/api`

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

The user ID in the token must match the user ID in the path parameter.

## Endpoints

### POST /{user_id}/chat

Initiates a conversation with the AI chatbot or continues an existing conversation.

#### Path Parameters
- `user_id` (string, required): The ID of the authenticated user

#### Headers
- `Authorization` (string, required): Bearer token for authentication

#### Request Body
```json
{
  "conversation_id": {
    "type": "integer",
    "optional": true,
    "description": "ID of existing conversation to continue, or null for new conversation"
  },
  "message": {
    "type": "string",
    "required": true,
    "description": "The user's message to send to the chatbot",
    "minLength": 1
  }
}
```

#### Example Request
```json
{
  "conversation_id": 123,
  "message": "Add a task to buy groceries"
}
```

#### Response
**Success Response (200 OK)**
```json
{
  "conversation_id": {
    "type": "integer",
    "description": "ID of the conversation (newly created or existing)"
  },
  "response": {
    "type": "string",
    "description": "The chatbot's response to the user's message"
  },
  "tool_calls": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Name of the tool that was called"
        },
        "arguments": {
          "type": "object",
          "description": "Arguments passed to the tool"
        },
        "result": {
          "type": "object",
          "description": "Result returned by the tool"
        }
      }
    },
    "description": "Array of tools that were called during processing"
  },
  "response_time": {
    "type": "number",
    "description": "Time taken to process the request in seconds"
  }
}
```

**Example Response**
```json
{
  "conversation_id": 123,
  "response": "I've added the task 'buy groceries' to your list.",
  "tool_calls": [
    {
      "name": "add_task",
      "arguments": {
        "user_id": "user123",
        "title": "buy groceries"
      },
      "result": {
        "id": 456,
        "user_id": "user123",
        "title": "buy groceries",
        "completed": false
      }
    }
  ],
  "response_time": 1.25
}
```

#### Error Responses

**400 Bad Request**
- **Cause**: Invalid request body format
- **Response Body**:
```json
{
  "detail": "string, description of the validation error"
}
```

**401 Unauthorized**
- **Cause**: Missing or invalid JWT token
- **Response Body**:
```json
{
  "detail": "string, authentication error message"
}
```

**403 Forbidden**
- **Cause**: User ID in token doesn't match user ID in path
- **Response Body**:
```json
{
  "detail": "Access denied: user ID mismatch"
}
```

**429 Too Many Requests**
- **Cause**: Rate limit exceeded (more than 10 requests per minute)
- **Response Body**:
```json
{
  "detail": "Rate limit exceeded. Please try again later."
}
```

**500 Internal Server Error**
- **Cause**: Unexpected server error during processing
- **Response Body**:
```json
{
  "detail": "string, error description"
}
```

## Rate Limiting
- Maximum 10 requests per minute per user
- Exceeding the limit results in a 429 status code

## Input Sanitization
- All user inputs are sanitized to prevent injection attacks
- Special characters are escaped appropriately

## Performance Requirements
- Response time: Under 3 seconds for typical requests
- Slow response alerts triggered for requests exceeding 3 seconds