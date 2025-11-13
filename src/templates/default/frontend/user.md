# Frontend Refactoring Request

Please refactor the following frontend code to call the backend API instead of using Gemini API directly.

## Original Service Code

```typescript
{{serviceCode}}
```

## Requirements

1. Remove all direct Gemini API calls from the frontend
2. Create an API service that calls the backend REST API
3. Update React components to use the new API service
4. Maintain all existing UI/UX functionality
5. Add proper loading and error states
6. Ensure no API keys are in the frontend code

## Expected Output

Please provide:
1. New API service (`services/apiService.ts`)
2. Updated React component(s)

The backend API endpoint will be available at: `/api/hello`

Make sure the code is production-ready and follows React best practices.
