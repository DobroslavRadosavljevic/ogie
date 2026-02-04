---
name: design-ui
description: Triggered when user asks to design UI/UX, create user interfaces, or implement frontend designs. Automatically delegates to the ui-designer agent.
allowed-tools: Read, Write, Edit, Grep, Glob
context: fork
agent: ui-designer
---

# Design UI Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "design UI" or "create interface"
- Requests UI/UX design or improvements
- Wants to "build components" or "create frontend"
- Mentions "UI", "UX", "interface", or "user experience"
- Asks about UI patterns or design

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `ui-designer` agent
2. Provide UI requirements and use cases
3. Include design preferences or constraints
4. Specify accessibility requirements
5. Include responsive design needs

## Context to Pass

- **UI Requirements**: What the interface needs to do
- **Use Cases**: User workflows and scenarios
- **Design Preferences**: Style or design preferences
- **Accessibility**: Accessibility requirements
- **Responsive**: Mobile/tablet/desktop needs
- **Components**: Existing components to use

## Agent Responsibilities

The ui-designer agent will:

1. Design UI layouts and components
2. Ensure accessibility
3. Create responsive designs
4. Follow UI/UX best practices
5. Implement component code
6. Ensure usability
