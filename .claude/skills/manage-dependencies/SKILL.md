---
name: manage-dependencies
description: Triggered when user asks to manage dependencies, add/remove packages, update dependencies, or audit security. Automatically delegates to the dependency-manager agent.
allowed-tools: Read, Write, Edit, Bash, Grep
context: fork
agent: dependency-manager
---

# Manage Dependencies Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "add", "install", or "add dependency"
- Requests to "remove" or "uninstall" a package
- Wants to "update" or "upgrade" dependencies
- Mentions "security audit", "vulnerabilities", or "dependency check"
- Asks about "package management" or "dependencies"
- Mentions "bun add", "bun remove", or "bun update"

## Delegation Instructions

When this skill is triggered:

1. **CRITICAL: Pass ALL collected information** - Include every answer, decision, and preference collected from the user
2. Delegate to the `dependency-manager` agent with complete context
3. Include ALL user answers about:
   - Package names and versions
   - Production vs dev dependencies
   - Version constraints or requirements
   - Security concerns
   - Update strategies
4. Provide project context (package.json, bun.lockb)
5. Include any constraints or requirements

## Context to Pass (MUST INCLUDE ALL)

- **ALL User Answers**: Every answer collected during information gathering:
  - Package names and versions
  - Dependency type (production/dev)
  - Version constraints
  - Security requirements
  - Update preferences
- **User Request**: The original request for dependency management
- **Current State**: Current package.json and dependencies
- **Bun Commands**: Use Bun (not npm) for all operations
- **Project Standards**: Dependency management conventions
- **Security Context**: Any security concerns or requirements

**IMPORTANT**: Never delegate without passing ALL collected information. The agent needs complete context to work correctly.

## Agent Responsibilities

The dependency-manager agent will:

1. Check current dependency state
2. Execute appropriate Bun commands (bun add, bun remove, bun update)
3. Handle dependency conflicts
4. Update bun.lockb file
5. Verify installation
6. Check for security issues
7. Resolve any conflicts

## Usage Examples

### Example 1: Add Package

**User**: "Add zod validation library"

**Delegation**: Delegate to dependency-manager with:

- Package: zod
- Type: Production dependency
- Context: Current package.json

### Example 2: Update Dependencies

**User**: "Update all dependencies to latest versions"

**Delegation**: Delegate to dependency-manager with:

- Action: Update all
- Strategy: Latest versions
- Context: Current dependencies

### Example 3: Security Audit

**User**: "Check for security vulnerabilities"

**Delegation**: Delegate to dependency-manager with:

- Action: Security audit
- Context: All dependencies

## Best Practices

- **ALWAYS pass ALL collected information** - Never omit any user answers or decisions
- Always use Bun commands (not npm)
- Check for conflicts before adding
- Verify installation after changes
- Consider security implications
- Maintain context consistency across all delegations
