---
name: write-docs
description: Triggered when user asks to write documentation, update README, add comments, or create technical docs. Automatically delegates to the docs-writer agent.
allowed-tools: Read, Write, Edit, Grep, Glob
context: fork
agent: docs-writer
---

# Write Docs Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "write documentation" or "create docs"
- Requests README updates or documentation
- Wants to "add comments" or "document code"
- Mentions "documentation", "README", or "JSDoc"
- Asks about documenting APIs or features

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `docs-writer` agent
2. Specify what needs documentation
3. Include documentation type (README, JSDoc, API docs, etc.)
4. Provide code or feature context
5. Include any documentation standards

## Context to Pass

- **Documentation Target**: What to document (code, feature, API, etc.)
- **Documentation Type**: README, JSDoc, API docs, guides, etc.
- **Code Context**: Code or feature being documented
- **Audience**: Target audience (developers, users, etc.)
- **Standards**: Documentation standards or templates
- **Examples**: Any examples to include

## Agent Responsibilities

The docs-writer agent will:

1. Understand what needs documentation
2. Write clear, comprehensive documentation
3. Add appropriate code comments
4. Include examples where helpful
5. Follow documentation standards
6. Ensure documentation is accurate and up-to-date

## Usage Examples

### Example 1: README Update

**User**: "Update the README with the new authentication feature"

**Delegation**: Delegate to docs-writer with:

- Type: README
- Feature: Authentication
- Context: New feature details

### Example 2: JSDoc Comments

**User**: "Add JSDoc comments to the public API functions"

**Delegation**: Delegate to docs-writer with:

- Type: JSDoc
- Code: Public API functions
- Standards: JSDoc format

### Example 3: API Documentation

**User**: "Document the new API endpoints"

**Delegation**: Delegate to docs-writer with:

- Type: API documentation
- Endpoints: New API endpoints
- Format: API doc format

## Best Practices

- Delegate documentation to docs-writer
- Specify documentation type
- Provide code or feature context
- Include documentation standards
- Request comprehensive docs
