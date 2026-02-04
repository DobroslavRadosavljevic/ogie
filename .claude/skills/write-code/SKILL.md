---
name: write-code
description: Triggered when user asks to write code, create files, implement features, add functionality, or generate new code. Automatically delegates to the code-writer agent.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
context: fork
agent: code-writer
---

# Write Code Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "write", "create", "implement", "add", or "generate" code
- Requests new files, functions, classes, or modules
- Wants to add new features or functionality
- Says things like "build", "develop", or "code"
- Requests boilerplate, scaffolding, or templates
- Mentions "new feature", "new function", or "new component"

## Delegation Instructions

When this skill is triggered:

1. **CRITICAL: Pass ALL collected information** - Include every answer, decision, and preference collected from the user
2. Delegate to the `code-writer` agent with complete context
3. Include ALL user answers about:
   - Specific features and requirements
   - Technical decisions and approaches
   - **Library preferences (CRITICAL: include "no libraries" if user chose that)**
   - Implementation details and preferences
   - File structure and naming preferences
4. Provide project context and standards
5. Include any constraints or requirements

## Context to Pass (MUST INCLUDE ALL)

- **ALL User Answers**: Every answer collected during information gathering:
  - Feature specifications and requirements
  - Technical decisions (how to implement X, how to do Y)
  - **Library Decisions**: Which libraries to use OR "no libraries - implement from scratch"
  - Implementation approaches and preferences
  - File structure preferences
  - Naming conventions
- **User Request**: The original request for code
- **Target Location**: File paths or directories mentioned
- **Language/Framework**: Any specific technologies mentioned
- **Requirements**: Functional requirements or acceptance criteria
- **Existing Context**: Related files or patterns to follow
- **Project Standards**: Coding conventions from CLAUDE.md
- **Dependencies**: Any dependencies or prerequisites

**IMPORTANT**: Never delegate without passing ALL collected information. The agent needs complete context to work correctly.

## Agent Responsibilities

The code-writer agent will:

1. Analyze the request and plan the implementation
2. Search for existing patterns and conventions in the codebase
3. Write clean, well-structured code following project standards
4. Create or modify files as needed
5. Ensure code follows best practices
6. Maintain consistency with existing codebase
7. Consider testability and maintainability

## Usage Examples

### Example 1: New Feature

**User**: "Add user authentication to the app"

**Delegation**: Delegate to code-writer with:

- Feature: User authentication
- Requirements: Login, logout, session management
- Context: Existing user model and API structure

### Example 2: New Function

**User**: "Create a function to calculate total price"

**Delegation**: Delegate to code-writer with:

- Function purpose: Calculate total price
- Input/output requirements
- Context: Related pricing code

### Example 3: New Component

**User**: "Build a dashboard component"

**Delegation**: Delegate to code-writer with:

- Component type: Dashboard
- Requirements: Display metrics, charts
- Context: Existing UI patterns

## Best Practices

- **ALWAYS pass ALL collected information** - Never omit any user answers or decisions
- **Especially important**: Include library preferences (or "no libraries" decision)
- Always delegate to code-writer for code creation
- Provide comprehensive, complete context
- Include project standards
- Reference similar existing code
- Specify requirements clearly
- Maintain context consistency across all delegations
