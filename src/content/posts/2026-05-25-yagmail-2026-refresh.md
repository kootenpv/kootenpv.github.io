---
title: "Sending Email from Python (2026, yagmail)"
subtitle: "async support, automatic reconnects, and a cleaner API"
date: 2026-05-25
tags: ["python", "yagmail", "email"]
---

`yagmail` has been refreshed. The goal hasn't changed — send email from Python without touching `smtplib` — but the package now fits better into modern codebases, and a few long-standing rough edges are gone.

Existing code keeps working. Upgrade with:

```bash
pip install -U yagmail
```

## You can `await` it now

There's an `AsyncClient` alongside the regular client, so `yagmail` drops into async codebases without a wrapper:

```python
import asyncio
import yagmail

async def main():
    async with yagmail.AsyncClient("me@gmail.com", "app-password") as yag:
        await yag.send(to="friend@example.com", subject="hi", contents="hello")

asyncio.run(main())
```

If you reuse one client across concurrent tasks, sends won't interleave.

## Dropped connections recover on their own

If the SMTP server closes the connection between sends — which Gmail and others do after a period of inactivity — `yagmail` now reconnects and retries (up to 3 times) instead of raising. For scripts and services that send mail intermittently, this removes a common source of failure. Sockets are also cleaned up automatically when the client goes out of scope.

## `Client` and `AsyncClient`

The main classes are now called `Client` and `AsyncClient`. They better match how people actually think about the library — a reusable email client, not a thin shim over SMTP. The old names (`SMTP`, `AsyncSMTP`, `AIOSMTP`) remain as aliases, so nothing breaks.

New code:

```python
with yagmail.Client("me@gmail.com", "app-password") as yag:
    yag.send("friend@example.com", "Subject", "Body")
```

## Smaller fixes that help

- Running the CLI with no arguments prints help instead of crashing.
- The `~/.yagmail` config file is now fully optional; if it isn't there, just pass credentials directly. If `yagmail` can't infer a user, you get a clear error telling you what to do.
- The Gmail setup section has been rewritten to be clearer about App Passwords versus OAuth2, including the 7-day expiry on unverified OAuth apps.

## Docs are online

The documentation is now built and hosted on Read the Docs, reorganized so the synchronous API is covered first and async is grouped on its own: <https://yagmail.readthedocs.io/>.

If you want async or the new name, use `yagmail.AsyncClient` or `yagmail.Client`. Otherwise, your existing code keeps working unchanged.
