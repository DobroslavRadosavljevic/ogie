---
name: optimize-performance
description: Triggered when user asks to optimize performance, improve speed, or identify bottlenecks. Automatically delegates to the performance-optimizer agent.
allowed-tools: Read, Grep, Glob, Bash
context: fork
agent: performance-optimizer
---

# Optimize Performance Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "optimize performance" or "improve speed"
- Requests performance analysis or profiling
- Wants to "fix slow code" or "identify bottlenecks"
- Mentions "performance", "optimization", or "bottleneck"
- Asks about performance improvements

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `performance-optimizer` agent
2. Specify code or components to optimize
3. Include performance requirements or targets
4. Provide context about performance issues
5. Include any profiling data if available

## Context to Pass

- **Code to Optimize**: Files or components
- **Performance Issues**: Known performance problems
- **Requirements**: Performance targets or SLAs
- **Metrics**: Current performance metrics
- **Bottlenecks**: Suspected bottlenecks
- **Profiling Data**: Any profiling results

## Agent Responsibilities

The performance-optimizer agent will:

1. Analyze code for performance issues
2. Identify bottlenecks
3. Recommend optimizations
4. Improve algorithm efficiency
5. Optimize database queries
6. Suggest caching strategies
