# Frontend Testing Documentation

## Overview
Frontend testing untuk NewsFeed menggunakan **Jest** dan **React Testing Library** untuk unit tests, component tests, dan integration tests.

## Test Structure

```
frontend/src/
├── components/
│   └── __tests__/
│       ├── Navbar.test.tsx          (6 tests)
│       ├── PostCard.test.tsx        (7 tests)
│       └── CreatePost.test.tsx      (8 tests)
├── pages/
│   └── __tests__/
│       ├── login.integration.test.tsx    (8 tests)
│       └── register.integration.test.tsx (7 tests)
├── contexts/
│   └── __tests__/
│       └── AuthContext.test.tsx     (10 tests)
└── lib/
    └── __tests__/
        └── api.test.ts              (8 tests)
```

## Test Coverage

**Total Tests: 54 ✅ (100% Passing)**

### Coverage by Category:
```
Components:    53.65% (3 components tested)
├─ Navbar:     100%
├─ PostCard:   100%
└─ CreatePost: 55.55%

Contexts:      65.9%
└─ AuthContext: 65.9%

Lib:           23.33%
└─ API Client:  23.33%

Pages:         25%
├─ Login:      70%
└─ Register:   65.21%
```

## Test Categories

### 1. Component Tests (21 tests)
Tests for individual React components in isolation.

#### Navbar Component (6 tests)
- ✅ Renders with logo
- ✅ Displays username
- ✅ Has Feed and Profile links
- ✅ Highlights active route
- ✅ Calls logout when button clicked
- ✅ Renders logout button with correct styling

#### PostCard Component (7 tests)
- ✅ Renders post content
- ✅ Displays username with @ symbol
- ✅ Displays user avatar with first letter
- ✅ Has proper styling classes
- ✅ Renders relative time
- ✅ Handles invalid date gracefully
- ✅ Capitalizes first letter of username in avatar

#### CreatePost Component (8 tests)
- ✅ Renders textarea
- ✅ Renders post button
- ✅ Updates textarea value on input
- ✅ Disables button when textarea empty
- ✅ Enables button when textarea has content
- ✅ Has character counter
- ✅ Updates character counter on input
- ✅ Shows error for content exceeding 200 characters

### 2. Integration Tests (15 tests)
Tests for full page functionality and user workflows.

#### Login Page (8 tests)
- ✅ Renders login form
- ✅ Has username and password fields
- ✅ Has submit button
- ✅ Shows link to register page
- ✅ Updates input values when typing
- ✅ Has NewsFeed title/logo
- ✅ Username input is text type
- ✅ Password input is password type

#### Register Page (7 tests)
- ✅ Renders register form
- ✅ Has all required form fields
- ✅ Has username, password, and confirm password inputs
- ✅ Has register button
- ✅ Shows link to login page
- ✅ Updates input values when typing
- ✅ Displays account creation heading

### 3. Context Tests (10 tests)
Tests for React Context providers and hooks.

#### AuthContext (10 tests)
- ✅ Provides auth context
- ✅ Initializes with null user when no token
- ✅ Initializes with user from localStorage
- ✅ Has login function
- ✅ Has register function
- ✅ Has logout function
- ✅ Clears user data on logout
- ✅ Redirects to login on logout
- ✅ Stores token and user in localStorage
- ✅ Manages authentication state

### 4. Unit Tests (8 tests)
Tests for utility functions and modules.

#### API Client (8 tests)
- ✅ Has correct baseURL
- ✅ Has correct Content-Type header
- ✅ Has request interceptor
- ✅ Has response interceptor
- ✅ Stores token in localStorage
- ✅ Removes token from localStorage
- ✅ Stores refreshToken in localStorage
- ✅ Has all HTTP methods (GET, POST, PUT, DELETE)

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test Categories
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Component tests only
npm run test:components
```

### Run Tests with Verbose Output
```bash
npm run test:verbose
```

## Testing Tools & Libraries

### Core Testing Framework
- **Jest 29.7**: JavaScript testing framework
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM
- **@testing-library/user-event**: Simulates user interactions
- **jest-environment-jsdom**: Browser-like environment for Jest

### Mocking & Setup
- **next-router-mock**: Mock Next.js router for tests
- Custom mocks for:
  - `next/router`
  - `AuthContext`
  - API client
  - `window.matchMedia`

## Test Configuration

### Jest Config (`jest.config.js`)
```javascript
{
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 35,
      statements: 35
    }
  }
}
```

### Setup File (`jest.setup.js`)
- Imports `@testing-library/jest-dom`
- Mocks Next.js router
- Mocks `window.matchMedia`
- Suppresses console errors for specific warnings

## Best Practices

### 1. Test Structure
- Follow AAA pattern (Arrange, Act, Assert)
- One concept per test
- Clear test descriptions

### 2. Component Testing
- Test user interactions, not implementation
- Use accessible queries (getByRole, getByLabelText)
- Test component behavior, not internal state

### 3. Integration Testing
- Test complete user workflows
- Mock external dependencies (API, router)
- Verify end-to-end functionality

### 4. Mocking
- Mock at the boundary (API, router, external services)
- Keep mocks simple and consistent
- Reset mocks between tests

## Coverage Goals

### Current Coverage
- **Statements**: 37.66%
- **Branches**: 29.06%
- **Functions**: 32.5%
- **Lines**: 37.88%

### Target Coverage (Future)
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## What's Tested

### ✅ Fully Tested
- Navbar component (100%)
- PostCard component (100%)
- Authentication UI flows
- User input handling
- Form validation display
- Route navigation
- Logout functionality

### ⚠️ Partially Tested
- CreatePost component (55.55%)
- AuthContext (65.9%)
- Login page (70%)
- Register page (65.21%)
- API client (23.33%)

### ❌ Not Yet Tested
- Feed page
- Profile page
- withAuth HOC
- Index page
- API interceptors
- Token refresh flow
- Error handling flows

## Future Improvements

### Short Term
1. Add tests for Feed page
2. Add tests for Profile page
3. Improve API client test coverage
4. Add error handling tests

### Medium Term
1. Add E2E tests with Playwright/Cypress
2. Add visual regression tests
3. Add performance tests
4. Increase coverage to 70%+

### Long Term
1. Add accessibility (a11y) tests
2. Add cross-browser testing
3. Add mobile responsiveness tests
4. Implement continuous test monitoring

## Common Issues & Solutions

### Issue: Tests Timeout
**Solution**: Increase Jest timeout in test file
```typescript
jest.setTimeout(10000)
```

### Issue: React Hook Warnings
**Solution**: Wrap state updates in `act()`
```typescript
import { act } from '@testing-library/react'
act(() => {
  // state updates
})
```

### Issue: Router Mock Not Working
**Solution**: Ensure `next-router-mock` is imported correctly
```typescript
jest.mock('next/router', () => require('next-router-mock'))
```

### Issue: localStorage Not Defined
**Solution**: Already handled in `jest.setup.js` via jsdom

## CI/CD Integration

Tests run automatically on:
- Every commit (GitHub Actions)
- Pull request creation
- Pre-deployment validation

### GitHub Actions Workflow
```yaml
- name: Run Frontend Tests
  run: |
    cd frontend
    npm test --coverage
```

## Maintenance

### When to Update Tests
- When adding new components
- When modifying component behavior
- When fixing bugs
- Before deploying to production

### Test Review Checklist
- [ ] All tests pass
- [ ] Coverage meets minimum threshold
- [ ] No skipped/disabled tests
- [ ] Mocks are up to date
- [ ] Test descriptions are clear
- [ ] No unnecessary test complexity

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)

---

**Last Updated**: November 5, 2025
**Test Suite Version**: 1.0.0
**Total Tests**: 54 ✅
**Pass Rate**: 100%
