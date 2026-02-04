---
name: run-e2e
description: Triggered when user asks to run end-to-end tests, execute E2E test suites, or verify complete user workflows. Automatically delegates to the e2e-runner agent.
allowed-tools: Bash, Read
context: fork
agent: e2e-runner
---

# Run E2E Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "run E2E tests" or "run end-to-end tests"
- Requests E2E test execution
- Wants to "test user flows" or "verify workflows"
- Mentions "E2E", "end-to-end", or "integration tests"
- Asks to verify complete user scenarios

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `e2e-runner` agent
2. Specify which E2E tests to run
3. Include test environment if mentioned
4. Provide any test configuration
5. Include expected outcomes

## Context to Pass

- **Test Suite**: Which E2E tests to run
- **Environment**: Test environment (staging, dev, etc.)
- **Configuration**: Test configuration or options
- **Focus**: Specific scenarios or workflows
- **Expected Results**: What should pass
- **Issues**: Any known issues or concerns

## Agent Responsibilities

The e2e-runner agent will:

1. Execute E2E test suite
2. Monitor test execution
3. Analyze test results
4. Report failures with details
5. Provide troubleshooting guidance
6. Verify user workflows
