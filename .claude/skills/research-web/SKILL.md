---
name: research-web
description: Triggered when user asks to research information online, search for articles, find solutions, research companies, or gather web information. Uses Exa MCP. Automatically delegates to the web-researcher agent.
allowed-tools: Read, Grep, Glob, WebFetch, WebSearch, mcp__exa__web_search_exa, mcp__exa__company_research_exa, mcp__exa__crawling_exa, mcp__exa__deep_researcher_start, mcp__exa__deep_researcher_check
context: fork
agent: web-researcher
---

# Research Web Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "research" or "search for" information
- Requests web research or online information
- Wants to "find articles" or "look up" something
- Mentions "web search", "online research", or "find information"
- Asks about companies, technologies, or general topics

## Delegation Instructions

When this skill is triggered:

1. **Delegate immediately** to the `web-researcher` agent
2. Specify research topic or question
3. Include research focus or requirements
4. Provide any context or constraints
5. Include depth requirements (quick vs. deep research)

## Context to Pass

- **Research Topic**: What to research
- **Research Question**: Specific question to answer
- **Focus Areas**: Specific aspects to focus on
- **Depth**: Quick overview vs. deep research
- **Sources**: Preferred source types if mentioned
- **Context**: Project or use case context

## Agent Responsibilities

The web-researcher agent will:

1. Use Exa MCP for intelligent web search
2. Find relevant information from multiple sources
3. Synthesize findings into actionable insights
4. Verify information accuracy
5. Provide source attribution
6. Present findings clearly

## Usage Examples

### Example 1: General Research

**User**: "What are the best practices for API rate limiting?"

**Delegation**: Delegate to web-researcher with:

- Topic: API rate limiting best practices
- Focus: Current best practices
- Depth: Comprehensive

### Example 2: Company Research

**User**: "Tell me about company X and their products"

**Delegation**: Delegate to web-researcher with:

- Topic: Company X
- Focus: Products and business
- Use Case: Understanding company

### Example 3: Technical Solution

**User**: "Find solutions for implementing real-time updates"

**Delegation**: Delegate to web-researcher with:

- Topic: Real-time updates implementation
- Focus: Technical solutions
- Context: Web application

## Best Practices

- Use Exa MCP for web research
- Search multiple angles
- Verify source quality
- Synthesize information
- Provide source attribution
- Present actionable insights
