---
name: integrate-api
description: Triggered when user asks to integrate third-party APIs, handle API authentication, manage rate limiting, or create API clients. Automatically delegates to the api-integrator agent.
allowed-tools: Read, Write, Edit, Grep, Glob
context: fork
agent: api-integrator
---

# Integrate API Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "integrate API", "connect to API", or "add API integration"
- Requests to "handle API authentication" or "set up API keys"
- Wants to "add rate limiting" or "implement retry logic"
- Mentions "API client", "API wrapper", or "API SDK"
- Asks about "third-party API", "external API", or "API integration"
- Mentions "OAuth", "API keys", or "authentication"

## Delegation Instructions

When this skill is triggered:

1. **CRITICAL: Pass ALL collected information** - Include every answer, decision, and preference collected from the user
2. Delegate to the `api-integrator` agent with complete context
3. Include ALL user answers about:
   - API details and endpoints
   - Authentication method
   - Rate limiting requirements
   - Error handling preferences
4. Provide existing API integration code
5. Include any constraints or requirements

## Context to Pass (MUST INCLUDE ALL)

- **ALL User Answers**: Every answer collected during information gathering:
  - API provider and endpoints
  - Authentication method and credentials
  - Rate limiting needs
  - Error handling approach
- **User Request**: The original request for API integration
- **API Documentation**: API docs or reference
- **Project Standards**: API integration patterns from CLAUDE.md
- **Existing Integrations**: Current API client patterns
- **Type Safety**: Type definitions needed

**IMPORTANT**: Never delegate without passing ALL collected information. The agent needs complete context to work correctly.

## Agent Responsibilities

The api-integrator agent will:

1. Create API client with authentication
2. Implement rate limiting if needed
3. Add retry logic for transient failures
4. Handle API errors gracefully
5. Create type-safe API methods
6. Ensure security (API keys, tokens)
7. Document API usage

## Usage Examples

### Example 1: Integrate API

**User**: "Integrate Stripe payment API"

**Delegation**: Delegate to api-integrator with:

- API: Stripe
- Authentication: API keys
- Endpoints: Payment endpoints
- Context: Payment flow

### Example 2: Add Rate Limiting

**User**: "Add rate limiting to the API client"

**Delegation**: Delegate to api-integrator with:

- Target: Existing API client
- Limits: Requests per minute
- Context: Current implementation

### Example 3: API Authentication

**User**: "Set up OAuth authentication for the API"

**Delegation**: Delegate to api-integrator with:

- Method: OAuth 2.0
- Provider: API provider details
- Context: Authentication flow

## Best Practices

- **ALWAYS pass ALL collected information** - Never omit any user answers or decisions
- Keep API keys secure (environment variables)
- Implement rate limiting for external APIs
- Add retry logic for reliability
- Create type-safe clients
- Handle all error cases
- Maintain context consistency across all delegations
