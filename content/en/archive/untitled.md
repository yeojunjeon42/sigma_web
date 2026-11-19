---
title: Untitled
titleKo: 무제
year: 2016
date: 2016
tags: [2016, Media art, Hackathon]
team: Hyegeon Lee, Seunghyeon Oh, Jaeyeon Park, Taehyeong Kim
---

## Overview

Created by two fine arts students and two electrical engineering students, *Untitled* is an interactive electronic sketchbook designed to capture the playful spontaneity of doodling on blank paper.

*Untitled* is a touch-responsive illuminated paper canvas that reacts as users draw on it. Named *Untitled* to represent an open blank sheet full of creative potential, the project blends tactile paper craft with embedded electronics.

## How it works

We focused on replicating the texture and thin profile of paper while embedding a responsive LED matrix.

### Materials and thickness

To preserve a thin, paper-like feel, we laminated five layers—bottom acrylic, an LED string panel, a light-diffusing layer, top acrylic, and a touch panel—and wrapped the exterior in tracing paper.

### Displaying visuals like a sketchbook

Sized between A4 and A3, the display uses 327 tri-color LEDs controlled by an Intel Edison board and an Arduino mounted on the back. Touch inputs trigger the Intel Edison to fetch live data such as time, weather, and temperature and pass commands over serial to the Arduino, which renders dot-matrix animations across the 327 LEDs.
