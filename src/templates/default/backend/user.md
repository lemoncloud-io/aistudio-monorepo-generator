# Backend Refactoring Request

Please refactor the following code to run on a serverless backend using lemon-core.

## Original Service Code

```typescript
{{serviceCode}}
```

## Requirements

1. Move all Gemini API calls to the backend
2. Create a REST API endpoint that the frontend can call
3. Use lemon-core Lambda handler pattern
4. Ensure API keys are stored securely (environment variables)
5. Maintain all existing functionality
6. Add proper error handling

## Expected Output

Please provide:
1. Refactored backend service (`services/geminiService.ts`)
2. API handler implementation (`api/hello-api.ts`)

Make sure the code is production-ready and follows best practices.
