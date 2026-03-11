# CutFlow AI

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Full video editor interface with timeline, multi-track editing, and playback controls
- AI-assisted features: auto-captioning, smart cut suggestions, background removal
- Effects panel: filters, transitions, text overlays, audio controls
- Platform presets: YouTube, TikTok, Instagram Reels, Twitter/X
- Social media account linking (YouTube, TikTok, Instagram, Twitter/X)
- Automated publishing scheduler: set date/time, platform, and post metadata
- Project management dashboard: create, rename, delete, open video projects
- User authentication and profile management
- Automation queue: view upcoming scheduled posts, cancel/edit them

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: user auth, project CRUD, social account linking (store tokens/metadata), scheduled post queue, automation records
2. Frontend: dashboard (projects list), editor page (timeline UI, effects, AI tools panel), social accounts settings page, scheduler modal, automation queue view
