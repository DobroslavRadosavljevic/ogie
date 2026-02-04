---
name: review-code
description: Triggered when user asks to review code, check code quality, audit implementation, or analyze existing code. Automatically delegates to the code-reviewer agent.
allowed-tools: Read, Grep, Glob
context: fork
agent: code-reviewer
---

# Review Code Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "review", "check", "audit", or "analyze" code
- Requests code quality assessment
- Wants feedback on implementation
- Says things like "look at", "evaluate", or "inspect" code
- Asks for suggestions or improvements on existing code
- Mentions "code review" or "quality check"

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `code-reviewer` agent
2. Pass the file paths or code to be reviewed
3. Include any specific concerns or focus areas
4. Specify the type of review requested (security, performance, style, etc.)
5. Include project standards context

## Context to Pass

- **Files to Review**: Specific file paths or directories
- **Review Focus**: Areas of concern (security, performance, readability)
- **Project Standards**: Coding conventions from CLAUDE.md
- **Scope**: Full review vs. specific aspects
- **Comparison**: Any reference implementations to compare against
- **Priority**: Critical issues vs. general review

## Agent Responsibilities

The code-reviewer agent will:

1. Read and analyze the specified code
2. Check for adherence to project coding standards
3. Identify potential bugs, security issues, or performance problems
4. Evaluate code structure and maintainability
5. Provide actionable feedback and suggestions
6. Report findings in a structured format with severity levels

## Usage Examples

### Example 1: General Review

**User**: "Review the authentication code"

**Delegation**: Delegate to code-reviewer with:

- Files: Authentication-related files
- Focus: General code quality
- Standards: Project coding standards

### Example 2: Security Review

**User**: "Check the API endpoints for security issues"

**Delegation**: Delegate to code-reviewer with:

- Files: API endpoint files
- Focus: Security vulnerabilities
- Standards: Security best practices

### Example 3: Performance Review

**User**: "Review this code for performance issues"

**Delegation**: Delegate to code-reviewer with:

- Files: Specific code files
- Focus: Performance optimization
- Context: Performance requirements

## Best Practices

- Always delegate code reviews to code-reviewer
- Specify review focus clearly
- Include project standards
- Provide file paths or code
- Request prioritized findings
