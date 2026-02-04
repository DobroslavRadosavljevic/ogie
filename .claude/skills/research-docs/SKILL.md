---
name: research-docs
description: Triggered when user asks to research library documentation, look up API references, find framework docs, or needs technical documentation. Uses Context7 MCP. Automatically delegates to the docs-researcher agent.
allowed-tools: Read, Grep, Glob, WebFetch, WebSearch, mcp__context7__resolve-library-id, mcp__context7__query-docs
context: fork
agent: docs-researcher
---

# Research Docs Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "look up documentation" or "find docs"
- Requests library or framework documentation
- Wants to "research API" or "check documentation"
- Mentions "documentation", "API reference", or "library docs"
- Asks how to use a library or framework

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `docs-researcher` agent
2. Specify what documentation is needed
3. Include library/framework name
4. Provide specific questions or use cases
5. Include any version requirements

## Context to Pass

- **Library/Framework**: Name of library or framework
- **Query**: Specific documentation question or topic
- **Use Case**: What the user is trying to accomplish
- **Version**: Library version if specified
- **Context**: Project context or related code
- **Previous Research**: Any previous documentation found

## Agent Responsibilities

The docs-researcher agent will:

1. Resolve library ID using Context7 MCP
2. Query documentation for specific information
3. Find code examples and usage patterns
4. Provide comprehensive documentation summaries
5. Include practical examples
6. Verify information accuracy

## Usage Examples

### Example 1: Library Usage

**User**: "How do I use React hooks?"

**Delegation**: Delegate to docs-researcher with:

- Library: React
- Query: Hooks usage
- Use Case: Using React hooks

### Example 2: API Reference

**User**: "What are the parameters for the fetch API?"

**Delegation**: Delegate to docs-researcher with:

- Library: Fetch API
- Query: API parameters
- Context: API usage

### Example 3: Framework Documentation

**User**: "Find documentation for Next.js routing"

**Delegation**: Delegate to docs-researcher with:

- Library: Next.js
- Query: Routing documentation
- Use Case: Implementing routing

## Best Practices

- Always use Context7 MCP for documentation
- **CRITICAL: Resolve library ID FIRST (Step 1), then query docs (Step 2)**
- Never skip the resolve-library-id step
- Never call query-docs without a resolved library ID
- Query specific topics
- Provide code examples
- Include version information
