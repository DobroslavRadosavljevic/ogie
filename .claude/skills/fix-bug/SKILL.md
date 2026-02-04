---
name: fix-bug
description: Triggered when user asks to fix a bug, resolve an error, debug an issue, or troubleshoot problems. Automatically delegates to the bug-fixer agent.
allowed-tools: Read, Edit, Grep, Glob, Bash
context: fork
agent: bug-fixer
---

# Fix Bug Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "fix", "resolve", "debug", or "troubleshoot" an issue
- Reports an error or bug
- Describes unexpected behavior
- Says things like "broken", "not working", or "failing"
- Shares error messages or stack traces
- Mentions "bug", "error", or "issue"

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `bug-fixer` agent
2. Pass the error message or bug description
3. Include any stack traces or logs provided
4. Specify the file or component involved
5. Include steps to reproduce if available

## Context to Pass

- **Bug Description**: What is broken or not working
- **Error Messages**: Any error output or stack traces
- **Location**: File paths or components involved
- **Reproduction Steps**: How to trigger the bug
- **Expected Behavior**: What should happen instead
- **Environment**: Runtime context (versions, OS, etc.)
- **Recent Changes**: Any recent changes that might have caused it

## Agent Responsibilities

The bug-fixer agent will:

1. Analyze the error message and stack trace
2. Search the codebase for the source of the issue
3. Identify the root cause of the bug
4. Implement a fix following project standards
5. Verify the fix by running relevant tests
6. Explain what caused the bug and how it was fixed

## Usage Examples

### Example 1: Error Fix

**User**: "I'm getting a TypeError when calling the login function"

**Delegation**: Delegate to bug-fixer with:

- Error: TypeError message
- Location: Login function
- Stack trace: If available

### Example 2: Unexpected Behavior

**User**: "The form validation isn't working correctly"

**Delegation**: Delegate to bug-fixer with:

- Issue: Form validation problem
- Location: Form component
- Expected: What should happen

### Example 3: Test Failure

**User**: "Tests are failing with assertion errors"

**Delegation**: Delegate to bug-fixer with:

- Issue: Test failures
- Tests: Which tests are failing
- Errors: Assertion error details

## Best Practices

- Delegate bug fixes to bug-fixer immediately
- Provide complete error information
- Include reproduction steps
- Specify expected behavior
- Include environment context
