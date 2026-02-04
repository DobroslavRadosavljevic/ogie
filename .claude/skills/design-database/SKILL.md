---
name: design-database
description: Triggered when user asks to design database schemas, plan data models, or optimize database structure. Automatically delegates to the database-designer agent.
allowed-tools: Read, Grep, Glob
context: fork
agent: database-designer
---

# Design Database Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "design database" or "create schema"
- Requests database design or data modeling
- Wants to "optimize database" or "plan tables"
- Mentions "schema", "ER diagram", or "data model"
- Asks about database structure or relationships

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `database-designer` agent
2. Provide data requirements and entities
3. Include relationships and constraints
4. Specify database type if mentioned
5. Include performance requirements

## Context to Pass

- **Entities**: Data entities to model
- **Relationships**: Entity relationships
- **Requirements**: Functional requirements
- **Performance**: Performance needs
- **Database Type**: SQL, NoSQL, etc.
- **Constraints**: Business rules and constraints

## Agent Responsibilities

The database-designer agent will:

1. Design database schema
2. Define tables and relationships
3. Plan indexes and optimization
4. Ensure normalization
5. Create migration strategy
6. Document database design
