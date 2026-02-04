---
name: add-logging
description: Triggered when user asks to add structured logging, set up error tracking, implement monitoring, or configure observability. Automatically delegates to the logging-specialist agent.
allowed-tools: Read, Write, Edit, Grep, Glob
context: fork
agent: logging-specialist
---

# Add Logging Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "add logging", "implement logging", or "set up logging"
- Requests to "add error tracking" or "set up monitoring"
- Wants to "add structured logging" or "improve logging"
- Mentions "log levels", "error tracking", or "observability"
- Asks about "logging service", "log aggregation", or "monitoring tools"
- Mentions "Sentry", "LogRocket", or other logging services

## Delegation Instructions

When this skill is triggered:

1. **CRITICAL: Pass ALL collected information** - Include every answer, decision, and preference collected from the user
2. Delegate to the `logging-specialist` agent with complete context
3. Include ALL user answers about:
   - Logging requirements and scope
   - Log levels needed
   - Error tracking needs
   - Monitoring requirements
4. Provide code/files to add logging to
5. Include any constraints or requirements

## Context to Pass (MUST INCLUDE ALL)

- **ALL User Answers**: Every answer collected during information gathering:
  - Logging scope and requirements
  - Log levels and format
  - Error tracking needs
  - Monitoring requirements
- **User Request**: The original request for logging
- **Target Code**: Files/components to add logging to
- **Project Standards**: Logging patterns from CLAUDE.md
- **Environment Context**: Development vs production
- **Existing Logging**: Current logging implementation

**IMPORTANT**: Never delegate without passing ALL collected information. The agent needs complete context to work correctly.

## Agent Responsibilities

The logging-specialist agent will:

1. Implement structured logging patterns
2. Set up error tracking
3. Add performance monitoring
4. Configure log levels
5. Add context-aware logging
6. Integrate with logging services if needed
7. Document logging patterns

## Usage Examples

### Example 1: Add Logging

**User**: "Add structured logging to the API"

**Delegation**: Delegate to logging-specialist with:

- Target: API routes
- Levels: Info, error, warn
- Context: Request/response logging

### Example 2: Error Tracking

**User**: "Set up error tracking and monitoring"

**Delegation**: Delegate to logging-specialist with:

- Service: Error tracking service
- Scope: All errors
- Context: Production environment

### Example 3: Performance Monitoring

**User**: "Add performance monitoring to database queries"

**Delegation**: Delegate to logging-specialist with:

- Target: Database queries
- Metrics: Query duration, slow queries
- Context: Database layer

## Best Practices

- **ALWAYS pass ALL collected information** - Never omit any user answers or decisions
- Use structured logging (JSON)
- Include relevant context
- Use appropriate log levels
- Don't log sensitive data
- Consider performance impact
- Maintain context consistency across all delegations
