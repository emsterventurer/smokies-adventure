# M3-08 Shared Adventure Foundation

Status: Architecture Complete

---

## Engineering Objective

Deliver the fastest path to a delightful shared family Adventure while preserving a clean architecture that can grow for years without major redesign.

---

## Engineering Principles

Adventure Companion follows several engineering principles throughout its implementation.

1. Architecture before implementation.
2. Small, independently testable commits.
3. Repository review before code changes.
4. Automated testing after every implementation.
5. Browser verification before every commit.
6. Documentation reflects verified behavior.
7. Cloud services remain implementation details rather than application architecture.

---

## Vision

Adventure Companion is evolving from a single-device travel companion into a shared family Adventure.

Every adventurer should be able to participate from their own phone while contributing to one shared Adventure Record.

The objective is not cloud synchronization for its own sake.

The objective is helping families experience an Adventure together.

---

## Product Philosophy

Adventure Companion is not a travel planner.

Adventure Companion is not a photo album.

Adventure Companion is a shared family Adventure.

Planning, memories, photos, readiness, and future keepsakes all exist to support one goal:

Creating and preserving family experiences together.

Every architectural decision should be evaluated against one question:

> Does this make the shared Adventure better for the family?

---

## Primary Goal

Before the Smokies trip:

- Every adventurer opens the same Adventure.
- Every adventurer sees the same itinerary.
- Every adventurer sees shared reservations.
- Every adventurer contributes memories.
- Every adventurer uploads photos.
- Every adventurer sees updates from everyone else.

Adventure Companion becomes a shared family experience instead of a personal travel journal.

---

## Guiding Principles

### 1. Adventure Companion owns its data model.

Adventure Companion defines the Adventure data model.

Firebase stores and synchronizes Adventure data without changing its structure.

---

### 2. Business logic remains local.

Adventure Brain.

Memory Journal.

Readiness.

Timeline.

Remy's Corner.

These continue to live inside Adventure Companion.

Firebase only stores and synchronizes data.

---

### 3. Cloud storage is an implementation detail.

Application code communicates through a repository abstraction.

Application code should never directly depend on Firebase APIs.

---

### 4. Local development remains possible.

Adventure Companion continues supporting local-only development.

Firebase becomes an additional storage provider.

---

### 5. Offline first.

Family members should be able to continue enjoying the Adventure even if internet connectivity is temporarily unavailable.

Synchronization should resume automatically when connectivity returns.

---

### 6. Build for Smokies first.

Only implement features required for a shared family Adventure before the trip.

Everything else waits.

---

## Pre-Smokies Scope

The objective is to deliver a complete shared Adventure experience before the Smokies trip.

Included:

- Shared Adventure
- Shared itinerary
- Shared reservations
- Shared memories
- Shared photos
- Shared readiness
- Organizer controls
- Automatic synchronization

Deferred until after Smokies:

- Multiple Adventures
- Printable Adventure Book
- AI scrapbook generation
- Comments and reactions
- Video memories
- Notifications
- Advanced permissions
- Statistics and reporting

## Success Criteria

During the Smokies trip:

- Five family members participate.
- Five phones remain synchronized.
- Memories appear for everyone.
- Photos appear for everyone.
- Reservations stay synchronized.
- Readiness stays synchronized.
- Adventure Companion feels like everyone's app.

---

If a family member opens Adventure Companion during the trip, they should naturally assume the app belongs to the whole family—not to a single person.

---

# System Architecture

## Layered Design

Adventure Companion continues to own all application logic.

Cloud services provide persistence and synchronization only.

```text
┌──────────────────────────────────────────────┐
│                 User Interface               │
├──────────────────────────────────────────────┤
│ Adventure Brain │ Memory Journal │ Dashboard │
├──────────────────────────────────────────────┤
│         Adventure Repository Interface       │
├──────────────────────┬───────────────────────┤
│ Local Repository     │ Firebase Repository   │
├──────────────────────┴───────────────────────┤
│      Local Storage / IndexedDB / Firebase    │
└──────────────────────────────────────────────┘
```

---

## Repository Responsibilities

The Adventure Repository is the single interface between Adventure Companion and persistent storage.

Application code communicates only with the repository.

The repository determines which storage provider is active and coordinates all persistence operations.

### Repository Capabilities

The repository is responsible for:

- Loading the active Adventure
- Saving Adventure changes
- Loading Adventurer information
- Persisting memories
- Retrieving memories
- Uploading media
- Retrieving media
- Observing Adventure updates
- Managing provider selection
- Reporting synchronization status

### Storage Providers

The initial architecture supports multiple interchangeable providers.

Examples include:

- Local browser storage
- Firebase
- Future providers

Each provider exposes the same repository contract.

The remainder of Adventure Companion remains unaware of the underlying storage technology.

---

## Firebase Responsibilities

Firebase is responsible for:

- Persisting Adventure data
- Synchronizing updates between devices
- Storing uploaded media
- Delivering real-time change notifications

Firebase is **not** responsible for:

- Readiness calculations
- Adventure Brain decisions
- Memory presentation
- Dashboard generation
- Timeline generation
- Validation rules
- Business logic

Those responsibilities remain inside Adventure Companion.

---

# Shared Adventure Model

## Organizer

Each Adventure has one Organizer.

For the initial release, the Organizer is Emily.

The Organizer is responsible for:

- Creating the Adventure
- Managing reservations
- Editing Adventure details
- Removing memories if necessary
- Inviting family members

Additional organizer roles may be supported in future releases.

---

## Adventurers

Each family member participates as an Adventurer.

An Adventurer has a persistent identity within the Adventure.

Examples:

- Emily
- Jake
- Kaseryn
- Bubbe
- Papa

Every memory, photo, and readiness update is attributed to the Adventurer who created it.

---

## Joining an Adventure

Before Smokies, joining an Adventure should be intentionally simple.

The Organizer shares an invitation.

A family member opens the invitation.

The application asks:

> "Who are you?"

The user selects their Adventurer identity.

The device remembers that choice for future sessions.

No usernames or passwords are required for the initial release.

Future releases may introduce optional authentication without changing the Adventure model.

---

# Synchronization Model

## Philosophy

Synchronization exists to support the shared Adventure.

Family members should never need to manually refresh, upload, or exchange information.

Whenever practical, Adventure Companion should quietly keep everyone's Adventure current.

---

## Expected Experience

When one family member updates the Adventure:

- New memories appear for everyone.
- New photos appear for everyone.
- Reservation changes appear for everyone.
- Readiness updates appear for everyone.

Synchronization should feel natural and automatic.

---

## Offline Experience

Adventure Companion should continue functioning when internet connectivity is temporarily unavailable.

Family members should be able to:

- View previously synchronized Adventure information.
- Create new memories.
- Capture new photos.
- Update readiness.

Changes made while offline should be synchronized automatically when connectivity returns.

Users should never lose Adventure content because of a temporary connection problem.

---

## Conflict Strategy

For the Smokies release, Adventure Companion should keep conflict handling intentionally simple.

Expected conflicts are rare because:

- Memories are normally appended.
- Photos are normally appended.
- Readiness updates are independent.
- Reservations are primarily managed by the Organizer.

If simultaneous edits occur, the application should preserve data whenever possible rather than silently discard changes.

Advanced conflict resolution may be introduced after Smokies.

---

## Performance Goals

During the trip:

- Most updates should appear on other devices within a few seconds.
- Photos may require additional upload time.
- The interface should remain responsive while synchronization occurs.

Synchronization should never interrupt the Adventure experience.

---

# Firebase Data Organization

## Design Goals

The cloud data model should closely mirror the existing Adventure Record.

This minimizes transformation logic and preserves compatibility between local and cloud providers.

---

## Primary Collections

The initial release stores:

- Adventures
- Adventure media
- Adventure membership

Business logic remains within Adventure Companion.

Firebase stores application state rather than deriving it.

---

## Future Expansion

The data organization should support future additions without requiring structural redesign, including:

- Multiple Adventures
- Additional Adventurers
- Shared keepsakes
- AI-generated summaries
- Family history

---

# Media Strategy

Photos are first-class Adventure memories.

Media should:

- Upload automatically.
- Synchronize automatically.
- Cache locally for viewing.
- Preserve attribution.
- Preserve creation time.

Future releases may support:

- Video
- Live Photos
- Audio memories
- Document attachments

---

# Security Strategy

The initial Smokies release prioritizes simplicity.

The Organizer controls Adventure membership.

Invited Adventurers participate using lightweight identity selection.

Future releases may introduce optional authentication, invitations, and expanded permission models without changing the Adventure data model.

---

# Implementation Roadmap

## Phase 1

Repository abstraction

---

## Phase 2

Firebase provider

---

## Phase 3

Shared Adventure synchronization

---

## Phase 4

Shared memories

---

## Phase 5

Shared photos

---

## Phase 6

Shared readiness

---

## Phase 7

Trip polish

---

# Architecture Summary

Adventure Companion remains responsible for the Adventure experience.

Cloud services exist to make that experience available to every member of the Adventure.

Every future architectural decision should reinforce one principle:

Adventure Companion belongs to the family, not to a single device.
