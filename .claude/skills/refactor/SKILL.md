---
name: refactor
description: Triggered when user asks to refactor code, improve code structure, extract functions, or reorganize modules. Automatically delegates to the refactorer agent.
allowed-tools: Read, Edit, Grep, Glob
context: fork
agent: refactorer
---

# Refactor Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "refactor", "restructure", or "reorganize" code
- Requests code improvements or cleanup
- Wants to "extract function" or "simplify code"
- Mentions "code smell", "duplication", or "complexity"
- Asks to improve code structure or maintainability

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `refactorer` agent
2. Specify what code needs refactoring
3. Include refactoring goals or focus areas
4. Provide context about current issues
5. Include any constraints or requirements

## Context to Pass

- **Code to Refactor**: Files or components
- **Refactoring Goals**: What to improve (readability, maintainability, etc.)
- **Issues**: Known code smells or problems
- **Constraints**: Must preserve behavior, no breaking changes, etc.
- **Scope**: Full refactor vs. specific improvements
- **Standards**: Project coding standards

## Agent Responsibilities

The refactorer agent will:

1. Analyze code for improvement opportunities
2. Identify code smells and duplication
3. Refactor while preserving behavior
4. Improve code structure and organization
5. Ensure code follows standards
6. Verify refactoring doesn't break functionality

## Usage Examples

### Example 1: Extract Function

**User**: "This function is duplicated in three places, refactor it"

**Delegation**: Delegate to refactorer with:

- Issue: Code duplication
- Goal: Extract shared function
- Files: Files with duplication

### Example 2: Simplify Code

**User**: "This file is too complex, can you refactor it?"

**Delegation**: Delegate to refactorer with:

- File: Complex file
- Goal: Reduce complexity
- Constraints: Preserve functionality

### Example 3: Improve Structure

**User**: "Refactor this module to be more maintainable"

**Delegation**: Delegate to refactorer with:

- Module: Module to refactor
- Goal: Improve maintainability
- Standards: Project standards

## Best Practices

- Delegate refactoring to refactorer
- Specify refactoring goals
- Include constraints clearly
- Provide code context
- Request behavior preservation verification
