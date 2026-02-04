---
name: plan-feature
description: Triggered when user asks to plan features, create implementation plans, break down tasks, or analyze requirements. Automatically delegates to the planner agent.
allowed-tools: Read, Grep, Glob
context: fork
agent: planner
---

# Plan Feature Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "plan", "create a plan", or "break down" a feature
- Requests implementation planning
- Wants task breakdown or analysis
- Mentions "roadmap", "phases", or "implementation plan"
- Asks how to implement something complex

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `planner` agent
2. Provide feature requirements
3. Include any constraints or considerations
4. Specify scope and context
5. Include timeline if mentioned

## Context to Pass

- **Feature Description**: What needs to be planned
- **Requirements**: Functional and non-functional requirements
- **Constraints**: Technical or business constraints
- **Current State**: Existing system context
- **Timeline**: Any deadlines or timeline requirements
- **Dependencies**: Known dependencies or prerequisites

## Agent Responsibilities

The planner agent will:

1. Analyze requirements and constraints
2. Break down work into phases
3. Identify dependencies and risks
4. Estimate complexity and effort
5. Create detailed implementation plan
6. Provide actionable next steps

## Usage Examples

### Example 1: Feature Planning

**User**: "Plan the implementation of real-time notifications"

**Delegation**: Delegate to planner with:

- Feature: Real-time notifications
- Requirements: Push notifications, multiple channels
- Context: Current notification system

### Example 2: Refactoring Plan

**User**: "Create a plan to refactor the authentication system"

**Delegation**: Delegate to planner with:

- Task: Refactor authentication
- Goals: Improve security, maintainability
- Context: Current auth implementation

### Example 3: Task Breakdown

**User**: "Break down the e-commerce checkout feature into tasks"

**Delegation**: Delegate to planner with:

- Feature: Checkout flow
- Requirements: Payment, shipping, confirmation
- Context: Existing cart system

## Best Practices

- Delegate complex planning to planner agent
- Provide comprehensive requirements
- Include constraints and context
- Specify timeline if critical
- Request detailed breakdown
