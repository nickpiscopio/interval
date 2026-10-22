# Agents

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/YYYY-MM-DD-<feature-slug>/` (gitignored). See `docs/agents/issue-tracker.md`.

### Execution & Progress Reporting

All procedural multi-step skills must announce each step to the user in the format:
`[Step x/y] <Step Title>`
For steps containing variable loops (such as iterating over a frontier of tickets), format the announcement with sub-progress:
`[Step x/y] (Ticket i/n: <Ticket Title>)`

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as `Status:` lines in issue files. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one root `GLOSSARY.md` plus `docs/adr/`. See `docs/agents/domain.md`.
