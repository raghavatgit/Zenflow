# Pomodoro State Machine Specification

## Lifecycle States
1. **Idle:** Timer at rest, customizable intervals ready.
2. **Work Session (25 min default):** Deep focus countdown, audio tracks active.
3. **Short Break (5 min default):** Rest interval, chime alert on start.
4. **Long Break (15 min default):** Triggered after every 4 completed work sessions.

## State Transitions
```text
[ Idle ] -- Start --> [ Work ] -- Finish --> [ Short Break ]
                          ^                       |
                          |------- Repeat --------|
```
