---
"blitz": patch
---

Use process.kill("SIGINT") instead of process.kill("SIGABRT") on startCustomServer() for better compatibility with operative systems
