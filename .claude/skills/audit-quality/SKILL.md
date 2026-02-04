---
name: audit-quality
description: Triggered when user asks to audit code quality, assess maintainability, or review overall code quality. Automatically delegates to the quality-auditor agent.
allowed-tools: Read, Grep, Glob
context: fork
agent: quality-auditor
---

# Audit Quality Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "audit code quality" or "assess quality"
- Requests quality review or assessment
- Wants to "check maintainability" or "review quality"
- Mentions "code quality", "maintainability", or "code audit"
- Asks about quality improvements

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `quality-auditor` agent
2. Specify code or components to audit
3. Include quality focus areas if mentioned
4. Provide project standards context
5. Include any quality goals

## Context to Pass

- **Code to Audit**: Files or components
- **Quality Focus**: Specific dimensions (readability, maintainability, etc.)
- **Standards**: Project coding standards
- **Goals**: Quality goals or targets
- **Metrics**: Any quality metrics to consider
- **Scope**: Full audit vs. specific areas

## Agent Responsibilities

The quality-auditor agent will:

1. Assess code quality across dimensions
2. Identify code smells
3. Measure complexity
4. Evaluate maintainability
5. Provide quality recommendations
6. Create improvement plan
