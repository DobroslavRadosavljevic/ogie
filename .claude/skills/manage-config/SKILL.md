---
name: manage-config
description: Triggered when user asks to manage configuration files, update tsconfig, configure bunfig, set up Next.js config, or manage environment variables. Automatically delegates to the config-manager agent.
allowed-tools: Read, Write, Edit, Bash, Grep
context: fork
agent: config-manager
---

# Manage Config Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "update tsconfig", "configure TypeScript", or "change tsconfig"
- Requests to "configure bunfig" or "update bunfig.toml"
- Wants to "set up Next.js config" or "configure Next.js"
- Mentions "environment variables", ".env", or "configuration"
- Asks about "build config", "compiler options", or "project config"
- Mentions "docker config", "CI/CD config", or other config files

## Delegation Instructions

When this skill is triggered:

1. **CRITICAL: Pass ALL collected information** - Include every answer, decision, and preference collected from the user
2. Delegate to the `config-manager` agent with complete context
3. Include ALL user answers about:
   - Configuration requirements
   - Settings to enable/disable
   - Environment-specific needs
   - Build requirements
4. Provide current configuration files
5. Include any constraints or requirements

## Context to Pass (MUST INCLUDE ALL)

- **ALL User Answers**: Every answer collected during information gathering:
  - Configuration requirements
  - Settings preferences
  - Environment needs
  - Build requirements
- **User Request**: The original request for configuration changes
- **Current Config**: Existing configuration files
- **Project Standards**: Configuration conventions from CLAUDE.md
- **Framework Context**: Next.js, Elysia.js, Bun specific needs
- **Environment Context**: Development, production, etc.

**IMPORTANT**: Never delegate without passing ALL collected information. The agent needs complete context to work correctly.

## Agent Responsibilities

The config-manager agent will:

1. Read current configuration files
2. Understand configuration requirements
3. Update configuration appropriately
4. Maintain existing settings where appropriate
5. Verify configuration is valid
6. Test configuration changes
7. Document changes

## Usage Examples

### Example 1: Update TypeScript Config

**User**: "Update tsconfig.json to enable strict mode"

**Delegation**: Delegate to config-manager with:

- Config file: tsconfig.json
- Change: Enable strict mode
- Context: Current config state

### Example 2: Configure Next.js

**User**: "Configure Next.js for production builds"

**Delegation**: Delegate to config-manager with:

- Config file: next.config.js
- Requirements: Production optimizations
- Context: Current Next.js setup

### Example 3: Environment Variables

**User**: "Set up environment variables for the project"

**Delegation**: Delegate to config-manager with:

- Variables needed: List of env vars
- Context: Development and production needs

## Best Practices

- **ALWAYS pass ALL collected information** - Never omit any user answers or decisions
- Read current config first
- Make incremental changes
- Verify config validity
- Test configuration changes
- Document changes
- Maintain context consistency across all delegations
