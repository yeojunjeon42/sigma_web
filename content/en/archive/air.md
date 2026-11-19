---
title: AIR
year: 2017
date: 2017
tags: [2017, Independent research, Software]
team: Jonghun Yoon, Jeonghwan Kim, Hyegeon Lee
---

## Overview

AIR is a web service that efficiently improves a user's problem-solving skills through a problem recommendation algorithm. AIR identifies problem types where the user is weak and recommends related practice problems. It also analyzes the user's skill level to continuously supply problems matched to their level, enabling faster and more efficient exam preparation.

## Motivation

Even among students selected through competitive entrance exams, significant gaps in academic readiness often appear—for example, in freshman introductory science courses at Seoul National University, as well as in the first year of science high schools and gifted academies. These gaps are hard to close because students often do not know what they do not know and lack access to well-curated practice problems. Seeing motivated peers struggle for this reason, we started the AIR project to support self-directed study, choosing General Physics as the initial target subject.

## How it works

AIR centers on two core functions: identifying a user's weak problem types and adjusting the difficulty of recommended problems.

### Identifying weak problem types

Each formula or concept used to solve a problem defines that problem's attributes and forms the basic unit of AIR's dataset. AIR presents sample problems from the database, increases the weights of attributes associated with problems the user answers incorrectly, and continues serving problems containing high-weight attributes to pinpoint weak areas.

### Determining problem difficulty

Based on solution accuracy, the system calculates the user's proficiency for each problem type and recommends problems calibrated to steadily challenge and improve their skills.
