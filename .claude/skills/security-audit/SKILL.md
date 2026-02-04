---
name: security-audit
description: Triggered when user asks to perform security audits, check for vulnerabilities, or review code for security issues. Automatically delegates to the security-reviewer agent.
allowed-tools: Read, Grep, Glob
context: fork
agent: security-reviewer
---

# Security Audit Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "audit security" or "check for vulnerabilities"
- Requests security review or assessment
- Wants to "scan for security issues"
- Mentions "security audit", "penetration test", or "vulnerability scan"
- Asks about security best practices

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `security-reviewer` agent
2. Specify code or components to audit
3. Include security focus areas if mentioned
4. Provide context about sensitive data
5. Include any compliance requirements

## Context to Pass

- **Code to Audit**: Files or components to review
- **Security Focus**: Specific areas (auth, input validation, etc.)
- **Sensitive Data**: Types of sensitive data handled
- **Compliance**: Any compliance requirements (GDPR, HIPAA, etc.)
- **Threat Model**: Known threats or attack vectors
- **Current Issues**: Any known security concerns

## Agent Responsibilities

The security-reviewer agent will:

1. Analyze code for security vulnerabilities
2. Check authentication and authorization
3. Review input validation
4. Identify security risks
5. Provide security recommendations
6. Prioritize issues by severity

## Usage Examples

### Example 1: Code Security Audit

**User**: "Audit the authentication code for security vulnerabilities"

**Delegation**: Delegate to security-reviewer with:

- Code: Authentication implementation
- Focus: Auth security
- Context: User authentication flow

### Example 2: Pre-Deployment Check

**User**: "Check the codebase for security issues before deployment"

**Delegation**: Delegate to security-reviewer with:

- Scope: Full codebase
- Focus: Critical vulnerabilities
- Context: Production deployment

### Example 3: Specific Vulnerability

**User**: "Check if we're vulnerable to SQL injection"

**Delegation**: Delegate to security-reviewer with:

- Focus: SQL injection
- Code: Database queries
- Context: Database access patterns

## Best Practices

- Delegate security reviews to security-reviewer
- Specify security focus areas
- Include compliance requirements
- Provide sensitive data context
- Request prioritized findings
