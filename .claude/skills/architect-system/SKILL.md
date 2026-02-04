---
name: architect-system
description: Triggered when user asks to design architecture, plan system structure, or make architectural decisions. Automatically delegates to the architect agent.
allowed-tools: Read, Grep, Glob
context: fork
agent: architect
---

# Architect System Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "design architecture" or "plan system architecture"
- Requests system design or structure
- Wants architectural decisions or patterns
- Mentions "microservices", "monolith", or "system design"
- Asks about scalability or system structure

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `architect` agent
2. Provide system requirements
3. Include scalability and performance needs
4. Specify constraints and context
5. Include any architectural preferences

## Context to Pass

- **System Requirements**: Functional and non-functional requirements
- **Scale Requirements**: Expected load and growth
- **Constraints**: Technical or business constraints
- **Current Architecture**: Existing system structure
- **Preferences**: Architectural style preferences
- **Integration Needs**: External system integrations

## Agent Responsibilities

The architect agent will:

1. Analyze requirements and constraints
2. Design system architecture
3. Choose appropriate patterns
4. Plan for scalability
5. Ensure maintainability
6. Document architectural decisions

## Usage Examples

### Example 1: New System Design

**User**: "Design the architecture for a microservices e-commerce system"

**Delegation**: Delegate to architect with:

- System: E-commerce platform
- Style: Microservices
- Requirements: Scalability, reliability

### Example 2: Architecture Review

**User**: "Review and improve the current system architecture"

**Delegation**: Delegate to architect with:

- Task: Architecture review
- Current: Existing architecture
- Goals: Improvements needed

### Example 3: Architectural Decision

**User**: "Should we use microservices or monolith for this project?"

**Delegation**: Delegate to architect with:

- Decision: Architecture style
- Context: Project requirements
- Constraints: Team size, timeline

## Best Practices

- Delegate architecture design to architect agent
- Provide comprehensive requirements
- Include scalability needs
- Specify constraints clearly
- Request detailed design
