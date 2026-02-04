---
name: migrate-code
description: Triggered when user asks to migrate code, upgrade dependencies, or assist with code migrations. Automatically delegates to the migration-assistant agent.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
context: fork
agent: migration-assistant
---

# Migrate Code Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "migrate" or "upgrade" code
- Requests dependency upgrades
- Wants to "update to new version" or "migrate framework"
- Mentions "migration", "upgrade", or "version update"
- Asks about migrating between versions or frameworks

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `migration-assistant` agent
2. Specify what needs to be migrated
3. Include source and target versions
4. Provide migration context
5. Include any constraints or requirements

## Context to Pass

- **Migration Type**: What to migrate (framework, dependency, API, etc.)
- **Source Version**: Current version
- **Target Version**: Target version
- **Scope**: What code is affected
- **Constraints**: Any constraints or requirements
- **Timeline**: Migration timeline if mentioned

## Agent Responsibilities

The migration-assistant agent will:

1. Analyze current state
2. Research target state and breaking changes
3. Create migration plan
4. Execute migration incrementally
5. Fix breaking changes
6. Verify migration success
