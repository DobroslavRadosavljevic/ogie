---
name: improve-accessibility
description: Triggered when user asks to audit accessibility, ensure WCAG compliance, improve keyboard navigation, or enhance screen reader support. Automatically delegates to the accessibility-specialist agent.
allowed-tools: Read, Write, Edit, Grep, Glob
context: fork
agent: accessibility-specialist
---

# Improve Accessibility Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "audit accessibility", "check a11y", or "test accessibility"
- Requests to "ensure WCAG compliance" or "meet accessibility standards"
- Wants to "improve keyboard navigation" or "add keyboard support"
- Mentions "screen reader", "ARIA", or "accessibility labels"
- Asks about "color contrast", "focus indicators", or "skip links"
- Mentions "accessibility", "a11y", or "inclusive design"

## Delegation Instructions

When this skill is triggered:

1. **CRITICAL: Pass ALL collected information** - Include every answer, decision, and preference collected from the user
2. Delegate to the `accessibility-specialist` agent with complete context
3. Include ALL user answers about:
   - Accessibility goals (WCAG level)
   - Specific issues to address
   - Keyboard navigation requirements
   - Screen reader needs
4. Provide components/files to audit
5. Include any constraints or requirements

## Context to Pass (MUST INCLUDE ALL)

- **ALL User Answers**: Every answer collected during information gathering:
  - Accessibility goals and standards
  - Specific issues or concerns
  - Keyboard navigation needs
  - Screen reader requirements
- **User Request**: The original request for accessibility improvements
- **Target Components**: Files/components to audit
- **Project Standards**: Accessibility conventions from CLAUDE.md
- **Framework Context**: Next.js accessibility patterns
- **Current State**: Existing accessibility implementation

**IMPORTANT**: Never delegate without passing ALL collected information. The agent needs complete context to work correctly.

## Agent Responsibilities

The accessibility-specialist agent will:

1. Audit accessibility issues
2. Check WCAG compliance
3. Improve keyboard navigation
4. Enhance screen reader support
5. Add ARIA labels and roles
6. Fix color contrast issues
7. Ensure semantic HTML

## Usage Examples

### Example 1: Audit Accessibility

**User**: "Check accessibility of the login form"

**Delegation**: Delegate to accessibility-specialist with:

- Target: Login form component
- Standards: WCAG 2.1 AA
- Context: Current implementation

### Example 2: WCAG Compliance

**User**: "Ensure the component meets WCAG 2.1 AA standards"

**Delegation**: Delegate to accessibility-specialist with:

- Target: Component
- Standards: WCAG 2.1 AA
- Context: Current state

### Example 3: Keyboard Navigation

**User**: "Add keyboard navigation to the modal"

**Delegation**: Delegate to accessibility-specialist with:

- Target: Modal component
- Requirements: Full keyboard support
- Context: Current modal implementation

## Best Practices

- **ALWAYS pass ALL collected information** - Never omit any user answers or decisions
- Specify WCAG level (A, AA, AAA)
- Test with screen readers
- Test keyboard navigation
- Verify color contrast
- Maintain context consistency across all delegations
