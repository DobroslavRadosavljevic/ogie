---
name: add-validation
description: Triggered when user asks to implement data validation, create validation schemas, add input validation, or ensure type-safe validation. Automatically delegates to the validation-specialist agent.
allowed-tools: Read, Write, Edit, Grep, Glob
context: fork
agent: validation-specialist
---

# Add Validation Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "add validation", "validate input", or "create validation"
- Requests to "create schemas" or "add Zod schemas"
- Wants to "validate forms" or "validate API requests"
- Mentions "input validation", "data validation", or "schema validation"
- Asks about "validation rules", "validation errors", or "validation messages"
- Mentions "Zod", "Yup", or other validation libraries

## Delegation Instructions

When this skill is triggered:

1. **CRITICAL: Pass ALL collected information** - Include every answer, decision, and preference collected from the user
2. Delegate to the `validation-specialist` agent with complete context
3. Include ALL user answers about:
   - Validation requirements and rules
   - Schema structure
   - Error message preferences
   - Validation library choice
4. Provide data structures to validate
5. Include any constraints or requirements

## Context to Pass (MUST INCLUDE ALL)

- **ALL User Answers**: Every answer collected during information gathering:
  - Validation rules and requirements
  - Schema structure
  - Error message style
  - Library preferences (Zod, etc.)
- **User Request**: The original request for validation
- **Data Structures**: What needs to be validated
- **Project Standards**: Validation patterns from CLAUDE.md
- **Framework Context**: Next.js forms, Elysia.js validation
- **Type Safety**: Type definitions for validation

**IMPORTANT**: Never delegate without passing ALL collected information. The agent needs complete context to work correctly.

## Agent Responsibilities

The validation-specialist agent will:

1. Create validation schemas (Zod, etc.)
2. Implement input validation
3. Ensure type-safe validation
4. Create helpful error messages
5. Add validation to forms/APIs
6. Handle validation errors
7. Document validation rules

## Usage Examples

### Example 1: Add Form Validation

**User**: "Add validation to the user registration form"

**Delegation**: Delegate to validation-specialist with:

- Target: Registration form
- Fields: name, email, password
- Rules: Required, email format, password strength
- Context: Form implementation

### Example 2: Create Schemas

**User**: "Create Zod schemas for API request validation"

**Delegation**: Delegate to validation-specialist with:

- Target: API requests
- Schemas needed: CreateUserRequest, UpdateUserRequest
- Context: API endpoints

### Example 3: Validate Input

**User**: "Add validation to user input fields"

**Delegation**: Delegate to validation-specialist with:

- Target: Input fields
- Rules: Email, required, min length
- Context: Form components

## Best Practices

- **ALWAYS pass ALL collected information** - Never omit any user answers or decisions
- Use type-safe validation (Zod)
- Provide clear error messages
- Create reusable validators
- Validate at runtime
- Maintain context consistency across all delegations
