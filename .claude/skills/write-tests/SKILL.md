---
name: write-tests
description: Triggered when user asks to write tests, create test cases, add test coverage, or implement testing. Automatically delegates to the test-writer agent.
allowed-tools: Read, Write, Edit, Grep, Glob
context: fork
agent: test-writer
---

# Write Tests Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "write tests", "create tests", or "add tests"
- Requests test coverage for code
- Wants to "test" functionality
- Mentions "unit tests", "integration tests", or "E2E tests"
- Asks for test cases or test scenarios

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `test-writer` agent
2. Specify what code needs testing
3. Include test type requirements (unit, integration, E2E)
4. Provide code context and requirements
5. Include any specific test scenarios mentioned

## Context to Pass

- **Code to Test**: Files or functions that need tests
- **Test Type**: Unit, integration, or E2E tests
- **Test Scenarios**: Specific scenarios to cover
- **Requirements**: Test requirements or acceptance criteria
- **Existing Tests**: Related test files for reference
- **Test Framework**: Testing framework being used

## Agent Responsibilities

The test-writer agent will:

1. Analyze the code to be tested
2. Write comprehensive test cases
3. Cover happy paths, edge cases, and error cases
4. Follow testing best practices
5. Ensure good test coverage
6. Write maintainable test code
7. Use appropriate test patterns

## Usage Examples

### Example 1: Unit Tests

**User**: "Write tests for the calculateTotal function"

**Delegation**: Delegate to test-writer with:

- Function: calculateTotal
- Test type: Unit tests
- Scenarios: Normal cases, edge cases, errors

### Example 2: Integration Tests

**User**: "Add integration tests for the API endpoints"

**Delegation**: Delegate to test-writer with:

- Endpoints: API endpoints to test
- Test type: Integration tests
- Scenarios: Request/response flows

### Example 3: Test Coverage

**User**: "Add tests to improve coverage for the user service"

**Delegation**: Delegate to test-writer with:

- Service: User service
- Goal: Improve coverage
- Focus: Areas with low coverage

## Best Practices

- Delegate all test writing to test-writer
- Specify test type clearly
- Provide code context
- Include test scenarios
- Reference existing test patterns
