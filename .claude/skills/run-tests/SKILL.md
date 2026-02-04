---
name: run-tests
description: Triggered when user asks to run tests, check if tests pass, verify functionality, or execute the test suite. Automatically delegates to the test-runner agent.
allowed-tools: Bash, Read
context: fork
agent: test-runner
---

# Run Tests Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "run tests" or "execute tests"
- Requests test verification or checking
- Wants to "test" or "verify" code
- Mentions "test suite", "test coverage", or "test results"
- Asks if tests pass or fail

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `test-runner` agent
2. Specify which tests to run (all, specific files, etc.)
3. Include test options if mentioned (coverage, watch, etc.)
4. Provide context about recent changes
5. Include any test configuration

## Context to Pass

- **Test Scope**: Which tests to run (all, specific, etc.)
- **Test Options**: Coverage, watch mode, etc.
- **Recent Changes**: Code changes that might affect tests
- **Environment**: Test environment requirements
- **Configuration**: Test configuration or options
- **Expected Results**: What should pass

## Agent Responsibilities

The test-runner agent will:

1. Execute the appropriate test commands
2. Analyze test results
3. Report test outcomes
4. Identify test failures
5. Provide test statistics
6. Suggest next steps for failures

## Usage Examples

### Example 1: Run All Tests

**User**: "Run all tests to make sure everything works"

**Delegation**: Delegate to test-runner with:

- Scope: All tests
- Context: Recent code changes

### Example 2: Specific Tests

**User**: "Run the authentication tests"

**Delegation**: Delegate to test-runner with:

- Scope: Authentication test files
- Focus: Authentication functionality

### Example 3: With Coverage

**User**: "Run tests with coverage report"

**Delegation**: Delegate to test-runner with:

- Scope: All tests
- Options: Coverage report
- Goal: Check test coverage

## Best Practices

- Delegate test execution to test-runner
- Specify test scope clearly
- Include test options if needed
- Provide context about changes
- Request detailed results
