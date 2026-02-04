---
name: resolve-build
description: Triggered when user asks to resolve build errors, fix compilation issues, or troubleshoot build problems. Automatically delegates to the build-error-resolver agent.
allowed-tools: Read, Edit, Grep, Glob, Bash
context: fork
agent: build-error-resolver
---

# Resolve Build Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "fix build errors" or "resolve compilation errors"
- Requests build troubleshooting
- Wants to "fix build" or "solve build issues"
- Mentions "build error", "compilation error", or "build failure"
- Asks about build or compilation problems

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `build-error-resolver` agent
2. Provide build error messages
3. Include build configuration context
4. Specify build tool and environment
5. Include any recent changes

## Context to Pass

- **Error Messages**: Build error output
- **Build Tool**: Build system being used
- **Configuration**: Build configuration files
- **Environment**: Development environment
- **Recent Changes**: Recent code or config changes
- **Dependencies**: Dependency information

## Agent Responsibilities

The build-error-resolver agent will:

1. Analyze build errors
2. Identify root causes
3. Fix compilation issues
4. Resolve dependency problems
5. Update configuration if needed
6. Verify build succeeds
