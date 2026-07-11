---
tags: [teachpath, design]
---

# Design System

**Feel:** calm, human, editorial, warm but professional. Linear + Apple Notes + a private teaching journal.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#faf7f1` | warm off-white page |
| `--surface` | `#fffdf9` | cards |
| `--ink` | `#26231e` | charcoal text |
| `--muted` | `#77705f` | secondary text |
| `--line` | `#e8e1d3` | hairline borders |
| `--accent` | `#3e5c4b` | deep sage — the ONE accent |
| headings | Iowan Old Style / Palatino / Georgia | editorial serif |
| body | system sans | quiet, readable |

## Principles

- Generous whitespace; hairline borders; no shadows, no glow, no gradients
- Serif for names and headings — learners are people, not rows
- Reflections render in *italic serif* — a journal, not a log
- One accent color used only where the eye should go (primary action, "Noticing" card spine, streak dots)
- The streak is seven small dots and a number. No fire, no confetti

## What we refuse to build

KPI card grids · fake analytics · robot mascots · emoji confetti · neon gradients · chat-as-main-interface · anything that looks like a crypto dashboard

## Accessibility (Best UI/UX criterion)

- Contrast: ink on bg ≈ 12:1, muted on bg ≈ 4.6:1 — passes AA
- Real `<label>` on every form control; `lang` attribute on translated text
- Keyboard-reachable everything; native controls (`<select>`, `<audio>`, `<textarea>`)

Related: [[06 Judging Strategy]]
