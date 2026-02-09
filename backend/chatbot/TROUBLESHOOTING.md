# Troubleshooting Guide: AI Chatbot Integration

## Common Issues and Solutions

### 1. Authentication Issues

**Problem**: Getting 401 or 403 errors when using the chatbot
**Solution**: 
- Verify that the JWT token is valid and not expired
- Ensure the user_id in the token matches the user_id in the request path
- Check that the Authorization header is properly formatted: `Bearer <token>`

### 2. Rate Limiting

**Problem**: Getting 429 errors
**Solution**: 
- The system limits requests to 10 per minute per user
- Implement client-side debouncing to prevent rapid consecutive requests
- Add user feedback when rate limit is approached

### 3. OpenAI API Issues

**Problem**: Chat responses are slow or failing
**Solution**:
- Verify that the OPENAI_API_KEY environment variable is set correctly
- Check that your OpenAI account has sufficient credits
- Verify network connectivity to OpenAI endpoints

### 4. Database Connection Issues

**Problem**: Cannot save conversations or messages
**Solution**:
- Verify that the DATABASE_URL environment variable is set correctly
- Check that the database server is running and accessible
- Run migrations to ensure database schema is up to date: `alembic upgrade head`

### 5. MCP Server Issues

**Problem**: Tool calls are not executing properly
**Solution**:
- Verify that the MCP server is running and accessible
- Check that all tool functions are properly implemented
- Review logs for any error messages during tool execution

### 6. Frontend Connection Issues

**Problem**: ChatPanel cannot connect to the backend
**Solution**:
- Verify that the backend server is running
- Check CORS settings if running on different ports
- Ensure the API endpoint URL is correctly configured in the frontend

### 7. Performance Issues

**Problem**: Slow response times (>3 seconds)
**Solution**:
- Check system resources (CPU, memory usage)
- Verify database connection performance
- Review the complexity of tool operations
- Monitor OpenAI API response times

## Debugging Tips

### Enable Detailed Logging
Set the logging level to DEBUG in your environment:
```bash
export LOG_LEVEL=DEBUG
```

### Check Application Logs
Monitor logs for errors and warnings:
- Backend logs will show API requests and database operations
- Frontend browser console will show client-side errors
- OpenAI API logs can help diagnose agent behavior

### Test Individual Components
- Test the database models independently
- Test MCP tools in isolation
- Test the OpenAI agent separately from the API endpoint
- Test the frontend component with mock data

## Environment Configuration

### Required Environment Variables
Ensure these variables are set in your environment:
- `OPENAI_API_KEY`: Your OpenAI API key
- `DATABASE_URL`: Connection string for your database
- `JWT_SECRET`: Secret key for JWT token signing
- `LOG_LEVEL`: Logging level (INFO, DEBUG, WARNING, ERROR)

### Common Configuration Mistakes
- Incorrect database URL format
- Expired or invalid OpenAI API key
- Mismatched JWT secret between frontend and backend
- Improperly formatted environment variables

## Contact Support

If you continue to experience issues after trying these solutions:

1. Collect relevant logs and error messages
2. Document the steps to reproduce the issue
3. Check the project's issue tracker for similar problems
4. Reach out to the development team with detailed information