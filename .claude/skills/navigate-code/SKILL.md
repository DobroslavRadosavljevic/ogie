---
name: navigate-code
description: Triggered when user asks to navigate codebase, find code patterns, trace dependencies, map code relationships, or understand code structure. Automatically delegates to the code-navigator agent.
allowed-tools: Read, Grep, Glob, CodebaseSearch
context: fork
agent: code-navigator
---

# Navigate Code Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "find code", "search codebase", or "locate code"
- Requests to "find all usages" or "trace dependencies"
- Wants to "understand code structure" or "map code relationships"
- Mentions "code navigation", "code exploration", or "codebase analysis"
- Asks about "where is X used", "how does X work", or "find pattern"
- Mentions "imports", "exports", or "dependencies"

## Delegation Instructions

When this skill is triggered:

1. **CRITICAL: Pass ALL collected information** - Include every answer, decision, and preference collected from the user
2. Delegate to the `code-navigator` agent with complete context
3. Include ALL user answers about:
   - What to search for
   - Search scope and criteria
   - Relationship types to trace
   - Analysis goals
4. Provide search context and starting points
5. Include any constraints or requirements

## Context to Pass (MUST INCLUDE ALL)

- **ALL User Answers**: Every answer collected during information gathering:
  - Search query and criteria
  - Code patterns to find
  - Relationship types
  - Analysis goals
- **User Request**: The original request for code navigation
- **Search Context**: Starting files or patterns
- **Project Structure**: Codebase organization
- **Search Scope**: Directories or file types to search
- **Relationship Types**: Imports, exports, calls, etc.

**IMPORTANT**: Never delegate without passing ALL collected information. The agent needs complete context to work correctly.

## Agent Responsibilities

The code-navigator agent will:

1. Search codebase for patterns
2. Trace dependencies and imports
3. Map code relationships
4. Understand code structure
5. Find similar implementations
6. Document findings
7. Provide code navigation summary

## Usage Examples

### Example 1: Find Code Pattern

**User**: "Find all places where we handle user authentication"

**Delegation**: Delegate to code-navigator with:

- Query: User authentication handling
- Scope: Entire codebase
- Context: Authentication patterns

### Example 2: Trace Dependencies

**User**: "Trace all dependencies of the user service"

**Delegation**: Delegate to code-navigator with:

- Target: User service
- Type: Import dependencies
- Context: Service dependencies

### Example 3: Understand Structure

**User**: "Map out how the API routes are organized"

**Delegation**: Delegate to code-navigator with:

- Target: API routes
- Goal: Understand organization
- Context: Route structure

## Best Practices

- **ALWAYS pass ALL collected information** - Never omit any user answers or decisions
- Use semantic search when appropriate
- Trace relationships thoroughly
- Document findings clearly
- Provide code snippets
- Maintain context consistency across all delegations
