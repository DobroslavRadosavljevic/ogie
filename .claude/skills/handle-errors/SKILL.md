---
name: handle-errors
description: Triggered when user asks to standardize error handling, create error types, improve error messages, or implement error recovery. Automatically delegates to the error-handler agent.
allowed-tools: Read, Write, Edit, Grep, Glob
context: fork
agent: error-handler
---

# Handle Errors Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "standardize error handling" or "improve error handling"
- Requests to "create error types" or "define error classes"
- Wants to "improve error messages" or "make errors more helpful"
- Mentions "error boundaries", "error recovery", or "error strategies"
- Asks about "error patterns" or "error handling best practices"
- Mentions "try-catch", "error handling", or "exception handling"

## Delegation Instructions

When this skill is triggered:

1. **CRITICAL: Pass ALL collected information** - Include every answer, decision, and preference collected from the user
2. Delegate to the `error-handler` agent with complete context
3. Include ALL user answers about:
   - Error handling patterns
   - Error type requirements
   - Error message preferences
   - Recovery strategies
4. Provide current error handling code
5. Include any constraints or requirements

## Context to Pass (MUST INCLUDE ALL)

- **ALL User Answers**: Every answer collected during information gathering:
  - Error handling patterns desired
  - Error type structure
  - Error message style
  - Recovery approach
- **User Request**: The original request for error handling
- **Current Error Handling**: Existing error handling patterns
- **Project Standards**: Error handling conventions from CLAUDE.md
- **Framework Context**: Next.js error boundaries, Elysia.js error handling
- **Error Scenarios**: Types of errors to handle

**IMPORTANT**: Never delegate without passing ALL collected information. The agent needs complete context to work correctly.

## Agent Responsibilities

The error-handler agent will:

1. Analyze current error handling
2. Create error type hierarchy
3. Standardize error handling patterns
4. Improve error messages
5. Implement error boundaries (React)
6. Create error recovery strategies
7. Ensure consistency across codebase

## Usage Examples

### Example 1: Standardize Error Handling

**User**: "Standardize error handling across the API"

**Delegation**: Delegate to error-handler with:

- Target: API layer
- Current patterns: Existing error handling
- Goals: Consistency and type safety

### Example 2: Create Error Types

**User**: "Create error types for validation and not found errors"

**Delegation**: Delegate to error-handler with:

- Error types needed: ValidationError, NotFoundError
- Context: Where they'll be used

### Example 3: Improve Error Messages

**User**: "Make error messages more helpful for users"

**Delegation**: Delegate to error-handler with:

- Target: User-facing errors
- Style: Friendly and actionable
- Context: Current error messages

## Best Practices

- **ALWAYS pass ALL collected information** - Never omit any user answers or decisions
- Analyze current error handling first
- Create consistent patterns
- Make error messages actionable
- Consider user-facing vs developer errors
- Maintain context consistency across all delegations
