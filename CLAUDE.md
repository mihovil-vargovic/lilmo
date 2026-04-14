# Lilmo — Claude Code Instructions

## Committing

When the user says "commit" (or any variation like "push", "save", "commit and push"):

1. Run `git diff` and `git status` to see what changed
2. Stage all modified tracked files: `git add -u`
3. Write a concise commit message based on the actual changes
4. Commit with the message
5. Push to `origin main`

Do all of this without asking for confirmation. The user wants one-word commits that just work.

The working directory for git commands is:
`/Users/mihovilhome/Library/CloudStorage/GoogleDrive-mihovilvargovic@gmail.com/My Drive/Claude/lilmo/app`

## Localhost

When the user mentions "localhost", open http://localhost:3010 in Google Chrome:

```
open -a "Google Chrome" http://localhost:3010
```

Also start the dev server in the background if it isn't already running.

## Release notes

Before every commit, always update `src/data/releases.ts` with a new entry describing what changed. Use today's date. Write it in plain language for the user, not technical jargon. Add it at the top of the array.
