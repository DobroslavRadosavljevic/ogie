---
name: improve-types
description: Triggered when user asks to create TypeScript types, improve type safety, handle complex types, or ensure type consistency. Automatically delegates to the type-specialist agent.
allowed-tools: Read, Write, Edit, Grep, Glob
context: fork
agent: type-specialist
---

# Improve Types Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "create types", "define types", or "add types"
- Requests to "improve type safety" or "fix type errors"
- Wants to "create type definitions" or "add TypeScript types"
- Mentions "type guards", "type inference", or "type narrowing"
- Asks about "shared types" or "type consistency"
- Mentions "complex types", "generics", or "utility types"

## Delegation Instructions

When this skill is triggered:

1. **CRITICAL: Pass ALL collected information** - Include every answer, decision, and preference collected from the user
2. Delegate to the `type-specialist` agent with complete context
3. Include ALL user answers about:
   - Type requirements and structure
   - Type safety goals
   - Shared type needs (frontend/backend)
   - Complex type requirements
4. Provide existing type definitions
5. Include any constraints or requirements

## Context to Pass (MUST INCLUDE ALL)

- **ALL User Answers**: Every answer collected during information gathering:
  - Type structure and properties
  - Type safety requirements
  - Shared type needs
  - Complex type scenarios
- **User Request**: The original request for type definitions
- **Existing Types**: Current type definitions in codebase
- **Usage Context**: Where types will be used (frontend/backend)
- **Project Standards**: TypeScript conventions from CLAUDE.md
- **Type Safety Goals**: What type safety improvements are needed

**IMPORTANT**: Never delegate without passing ALL collected information. The agent needs complete context to work correctly.

## Agent Responsibilities

The type-specialist agent will:

1. Analyze type requirements
2. Create comprehensive type definitions
3. Improve type safety across codebase
4. Handle complex types (generics, conditional types)
5. Create shared types for frontend/backend
6. Create type guards if needed
7. Ensure type consistency

## Usage Examples

### Example 1: Create Types

**User**: "Create TypeScript types for the user model"

**Delegation**: Delegate to type-specialist with:

- Model: User
- Properties: id, name, email, etc.
- Context: Where it will be used

### Example 2: Improve Type Safety

**User**: "Improve type safety in the API layer"

**Delegation**: Delegate to type-specialist with:

- Target: API layer
- Current issues: Any type errors or any usage
- Goals: Full type safety

### Example 3: Shared Types

**User**: "Create types shared between frontend and backend"

**Delegation**: Delegate to type-specialist with:

- Types needed: User, ApiResponse, etc.
- Context: Frontend and backend usage

## Best Practices

- **ALWAYS pass ALL collected information** - Never omit any user answers or decisions
- Provide existing type context
- Specify type safety goals
- Include usage context
- Consider shared type needs
- Maintain context consistency across all delegations
