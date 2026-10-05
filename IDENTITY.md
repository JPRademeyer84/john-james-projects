# Ubuntu Afrique — Identity and promote lock

**Wave F. Adopted 2026-10-05. Do not rewrite history.**

## Actor

Every commit, push, PR, review, and reply from this machine is:

- GitHub: `MRSHAGNASTY`
- Name: `No Post On Sunday`
- Email: `mr.shagnasty1990@gmail.com`

Pass identity per command. Do not write git config.

```text
git -c user.name="No Post On Sunday" -c user.email="mr.shagnasty1990@gmail.com" commit ...
```

After every commit: `git log -1 --format="%an %ae"` must show that name and email. Refuse `JPRademeyer84`.

Existing ubuntu-fork commits through `a45b94f` were authored as `JPRademeyer84`. Leave them. Do not amend, rebase, or force-push.

## Remotes

| Remote | Repo | Rule |
|---|---|---|
| `ubuntu-fork` | `MRSHAGNASTY/ubuntu-afrique` | Only push target |
| `origin` | `JPRademeyer84/john-james-projects` | Frozen. Do not push |

## Promote (do not skip, do not invent)

1. Classify Type U.
2. Isolate this worktree. Fetch `ubuntu-fork/main`.
3. Re-read live `ua_system_settings` before claiming flags.
4. Smallest change. Version bump.
5. `npm test`.
6. Commit as MRSHAGNASTY. Verify author.
7. Push `ubuntu-fork` only.
8. **Stop.** Public checkout stays 403. Flags stay as live unless a later prompt names the exact flag.
9. Merge to `origin` / parent go-live is **not** Wave F. That is a later named sentence.

Wave F is not a go-live. Wave L/M are the only named public-commerce / release waves.