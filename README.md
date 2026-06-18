# Practice Hub: Drums

## Overview

Practice Hub: Drums is a Progressive Web App (PWA) designed to help drummers practice more effectively, organize their learning, track progress over time, and access essential practice tools from any device.

The application is intended for drummers of all skill levels, from complete beginners learning their first rudiments to experienced and professional drummers maintaining technique, expanding vocabulary, and managing practice routines.

The goal is not to create a social platform, content marketplace, or online community. Practice Hub: Drums is a personal practice companion focused on helping drummers improve through structured practice, consistent tracking, and easy access to learning resources.

The application follows the same philosophy and architecture as the existing guitar and bass version of Practice Hub, while adapting its features specifically to the needs of drummers.

---

# Core Principles

The application should always prioritize:

* Fast loading
* Mobile-first usability
* Cross-device synchronization
* Minimal friction during practice
* Offline-friendly functionality
* Clear progression tracking
* Consistent user experience
* Practical value over feature bloat

Every feature should answer at least one of these questions:

* What should I practice today?
* How do I practice this skill?
* Am I improving?
* How can I stay organized?

Features that do not clearly support practice, learning, organization, or progression should generally be avoided.

---

# Technology Stack

## Frontend

* React
* Vite
* React Router

## Styling

* Plain CSS
* No CSS framework
* Custom cyberpunk / neon visual theme
* Consistent card-based interface
* Consistent HUD-inspired design language

## Backend Services

### Firebase Authentication

Authentication providers:

* Google Sign-In
* Email / Password

### Firestore

Used to store all user-created and user-specific data.

### Firebase Storage

Used for:

* User uploads
* Custom practice recordings
* Custom backing tracks
* Future downloadable resources

## Hosting

* Vercel

## PWA Support

The application should function as an installable Progressive Web App.

Features include:

* Manifest
* Service Worker
* Offline support
* Asset caching
* Cached metronome samples

---

# Application Structure

The application is organized around four pillars:

## Practice

Exercises, warmups, routines, and practice sessions.

## Tools

Metronome and future training tools.

## Library

Songs, rudiments, grooves, exercises, and saved resources.

## Progress

Practice history, streaks, statistics, and skill development.

---

# Authentication Philosophy

Users should create accounts immediately.

Anonymous authentication is intentionally not supported.

Reasons:

* Practice data should persist permanently.
* Users expect synchronization between devices.
* Anonymous accounts create duplicate records.
* Anonymous users complicate database management.

Google authentication should be the preferred sign-in method.

---

# Data Architecture

All user-specific data is stored beneath:

users/{uid}/...

Examples:

users/{uid}/songs

users/{uid}/rudiments

users/{uid}/grooves

users/{uid}/favorites

users/{uid}/practiceSessions

users/{uid}/practiceLogs

users/{uid}/metronomePresets

users/{uid}/settings

No public user-generated content is planned.

Users own their own data.

Cross-device synchronization should be automatic.

---

# Major Features

## Dashboard

The Dashboard serves as the application's home screen.

It provides quick access to:

* Current practice session
* Practice streak
* Recent activity
* Saved exercises
* Saved songs
* Recommended practice items
* Practice statistics

The Dashboard should answer:

"What should I work on right now?"

---

# Practice Sessions

Practice sessions are tracked explicitly.

The application should never attempt to automatically determine whether the user is practicing.

Users manually start and stop sessions.

Session data includes:

* Start time
* End time
* Duration

Sessions are stored in Firestore.

If the application closes unexpectedly during a session, the user should be prompted to:

* Resume Session
* End Session
* Discard Session

on next launch.

---

# Metronome

The metronome is a cornerstone feature of the application.

It should use Web Audio API scheduling techniques rather than setInterval() to ensure accurate timing.

Audio should use high-quality recorded percussion samples rather than synthesized sounds.

## Core Features

* BPM control
* Tap tempo
* Start / Stop
* Volume control

## Time Signatures

Support common and advanced meters including:

* 2/4
* 3/4
* 4/4
* 5/4
* 6/4
* 7/4
* 8/4
* 9/4

Future support should allow custom time signatures.

## Subdivisions

* Quarter Notes
* Eighth Notes
* Triplets
* Sixteenth Notes

## Swing

* Straight
* Light
* Medium
* Heavy

## Accents

Users may accent any beat pattern.

Examples:

* Beat 1
* 1 and 3
* 1 and 4
* Custom patterns

## Training Features

### Tempo Ramp

Gradually increases BPM over time.

### Gap Training

Alternates between audible and silent measures.

Example:

3 bars audible

1 bar silent

### Random Mute

Randomly silences measures to improve internal timing.

### Presets

Users may save custom metronome configurations.

Presets synchronize through Firestore.

---

# Rudiment Library

The rudiment library serves as a structured learning resource.

Examples include:

* Single Stroke Roll
* Double Stroke Roll
* Paradiddle
* Double Paradiddle
* Triple Paradiddle
* Flam
* Drag
* Ratamacue

Each rudiment contains:

* Name
* Description
* Difficulty
* Practice notes
* Video links
* Suggested tempos

Users may save favorites.

---

# Rudiment Progress Tracking

Users can track progress for individual rudiments.

Examples:

Current Tempo

Best Tempo

Target Tempo

This feature is intended to provide measurable improvement over time.

---

# Groove Library

A searchable collection of drum grooves.

Categories include:

* Rock
* Blues
* Funk
* Jazz
* Metal
* Latin
* Odd Meter

Each groove may include:

* Notation
* Video
* Difficulty
* Time Signature
* Notes

Users may save grooves to their library.

---

# Warmups

Warmups are short practice routines designed to prepare users for practice sessions.

Examples:

* 5 Minute Warmup
* Beginner Warmup
* Speed Warmup
* Practice Pad Warmup

Warmups may be categorized by duration and skill level.

---

# Practice Exercises

A structured exercise library organized by category.

Examples:

## Timing

* Quarter Note Exercises
* Eighth Note Exercises
* Triplet Exercises

## Coordination

* Limb Independence
* Kick Control
* Hi-Hat Independence

## Speed

* Endurance Exercises
* Tempo Building

## Odd Meter

* 5/4 Exercises
* 7/8 Exercises
* Polyrhythm Foundations

---

# Songs

Users can maintain a personal song library.

Each song includes:

* Title
* Artist
* YouTube Link
* Notes
* Status

Status workflow:

Planned

Learning

Complete

Songs are intended for organization rather than automated progress tracking.

---

# Jam Tracks

Users can save and organize drumless backing tracks and play-along material.

Initial implementation should focus on YouTube integration.

Tracks may be categorized by:

* Genre
* Difficulty
* BPM
* Time Signature

Users may save favorite tracks.

---

# Favorites

Users may maintain a personal collection of:

* Songs
* Rudiments
* Grooves
* Exercises
* Warmups
* Jam Tracks

Favorites should be accessible from a centralized library.

---

# Practice Logs

Users may record notes after practice sessions.

Example:

Worked on:

* Paradiddles
* Shuffle Groove

Notes:

Need cleaner transitions between fills.

Practice logs provide context for future sessions and progress tracking.

---

# Statistics

The application should provide meaningful statistics without becoming overly complex.

Examples:

## Practice Time

* Today
* This Week
* This Month
* Lifetime

## Sessions

* Total Sessions
* Average Session Length
* Longest Session

## Streaks

A practice day is defined as:

10+ minutes of practice

Track:

* Current Streak
* Longest Streak

## Rudiment Statistics

Examples:

* Most Practiced Rudiment
* Highest BPM Achieved
* Favorite Rudiments

---

# Future Features

The architecture should support future expansion without requiring major redesign.

Potential future additions include:

## Skill Trees

Visual progression through drumming concepts.

## Structured Practice Plans

Examples:

* Complete Beginner
* Speed Builder
* Independence Builder
* Odd Meter Mastery

## Subdivision Trainer

Interactive subdivision exercises.

## Polyrhythm Trainer

Visual and audio-based polyrhythm practice.

## Independence Trainer

Exercises focused on limb coordination and independence.

## Timing Analysis

Microphone-based timing feedback and performance analysis.

---

# Design Philosophy

Practice Hub: Drums should feel like a drummer's practice notebook, metronome, exercise binder, and progress tracker combined into a single application.

The focus should remain on helping drummers practice intentionally, stay organized, and see measurable improvement over time.

Every feature should reinforce that goal.
