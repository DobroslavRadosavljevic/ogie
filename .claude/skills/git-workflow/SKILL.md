---
name: git-workflow
description: Triggered when user asks to perform git operations, create commits, manage branches, prepare pull requests, or handle git conflicts. Automatically delegates to the git-workflow agent.
allowed-tools: Bash, Read, Grep
context: fork
agent: git-workflow
---

# Git Workflow Skill

## Trigger Phrases

This skill is automatically triggered when the user:

- Asks to "commit", "create commit", or "make commit"
- Requests to "create branch", "switch branch", or "merge branch"
- Wants to "push", "pull", or "sync" git changes
- Mentions "pull request", "PR", or "merge request"
- Asks about "git status", "git diff", or git operations
- Mentions "git conflicts" or "resolve conflicts"

## Delegation Instructions

When this skill is triggered:

1. **CRITICAL: Pass ALL collected information** - Include every answer, decision, and preference collected from the user
2. Delegate to the `git-workflow` agent with complete context
3. Include ALL user answers about:
   - Commit message preferences
   - Branch naming conventions
   - PR requirements
   - Conflict resolution preferences
4. Provide git status and current state
5. Include any constraints or requirements

## Context to Pass (MUST INCLUDE ALL)

- **ALL User Answers**: Every answer collected during information gathering:
  - Commit message style preferences
  - Branch naming conventions
  - PR description requirements
  - Conflict resolution approach
- **User Request**: The original request for git operations
- **Current Git State**: Git status, current branch, changes
- **Project Standards**: Git workflow conventions from CLAUDE.md
- **Commit Context**: Files changed and scope of changes
- **Branch Context**: Current branch and target branch

**IMPORTANT**: Never delegate without passing ALL collected information. The agent needs complete context to work correctly.

## Agent Responsibilities

The git-workflow agent will:

1. Check current git status
2. Stage appropriate files
3. Create well-formatted commit messages
4. Create/switch branches as needed
5. Handle git conflicts if they occur
6. Prepare pull requests
7. Push changes if needed

## Usage Examples

### Example 1: Create Commit

**User**: "Create a commit for these changes"

**Delegation**: Delegate to git-workflow with:

- Files changed: List of modified files
- Commit type: Feature/fix/etc.
- Context: What the changes do

### Example 2: Create Branch

**User**: "Create a new branch for authentication feature"

**Delegation**: Delegate to git-workflow with:

- Branch name: feat/authentication
- Base branch: main
- Context: Feature description

### Example 3: Handle Conflicts

**User**: "Resolve merge conflicts"

**Delegation**: Delegate to git-workflow with:

- Conflicted files: List of files
- Context: Merge source and target

## Best Practices

- **ALWAYS pass ALL collected information** - Never omit any user answers or decisions
- Check git status before operations
- Use clear commit messages
- Follow branch naming conventions
- Handle conflicts carefully
- Maintain context consistency across all delegations
