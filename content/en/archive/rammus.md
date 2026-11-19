---
title: Rammus
year: 2016
date: 2016
tags: [2016, URP, Spherical wheel, SNU Creative Design Fair]
team: Yongjae Yoo, Jigang Kim, Jaeyeon Park
---

## Overview

Rammus is an omnidirectional mobile robot platform built around a spherical wheel rather than conventional cylindrical wheels. Earlier spherical-wheel robots relied on complex external balancing mechanisms that limited payload capacity and expandability. Rammus simplifies the architecture by housing the drive mechanism inside the sphere, achieving stable three-axis omnidirectional mobility—forward, backward, lateral, and zero-radius turning—while supporting modular upper payloads.

## How it works

We focused on internal spherical-wheel drive mechanics and ROS-based modular hardware expansion.

### Spherical wheel design and drivetrain structure

By placing the drive unit inside the spherical shell rather than balancing on top of it, we eliminated the unstable equilibrium problem of externally driven ball robots while retaining full omnidirectional freedom.

Heavy components—batteries, motors, and ball bearings—are mounted low inside a symmetric internal drive carriage to keep the center of gravity low and ensure straight tracking. Upper suspension rollers press the drive wheels against the inner sphere wall to prevent slip and protect electronics if the shell flips. As the internal carriage shifts its center of mass, it rolls the outer sphere in any direction. The outer shell splits into two bolted hemispheres so the entire internal drive module can be swapped easily for maintenance or battery replacement.

### System development using ROS

An ARM board inside the drive unit communicates via ROS with an upper Linux computer module mounted above the sphere. Upper payload modules—such as a camera module—attach mechanically and connect via USB plug-and-play, allowing users to stack and swap functional modules easily.
