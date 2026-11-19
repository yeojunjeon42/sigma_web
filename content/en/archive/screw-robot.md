---
title: Screw-Propelled Robot
titleKo: 나선지렁이
year: 2017
date: 2017
tags: [2017, URP, Exploration robot]
team: Dogwan Guk, Gyeongtak Yoon, Jiu Hong
---

## Overview

The Screw Worm project aimed to build a robot propelled by helical screw motion to overcome terrain and spatial constraints. Quadruped robots struggle in narrow passages, while wheeled and tracked vehicles depend heavily on surface conditions. A screw-propelled drive can twist through narrow gaps and traverse varied terrain using a single rotational motion. Our goal was to build a macroscopic screw-propelled drive and evaluate its performance across soil, sand, mud, and rubble.

## How it works

We focused on implementing two serial screw-drive configurations. A screw-propelled cylinder moves forward or backward by generating friction forces parallel to its helical threads. In the first configuration, the cylinder drives the robot longitudinally or laterally.

In the second configuration, an axial angular momentum counter-cylinder is mounted inside the screw-propelled cylinder to counteract reaction torque, allowing the robot to move along either the axial or rolling direction. Because the helix angle determines friction, body length, and axial translation per revolution, we derived equations relating rotational speed to linear displacement using measured friction coefficients. Once this works, we plan to add circuits and structures for image processing and actual missions. The internal counter-cylinder cancels the angular momentum of the outer screw, enabling forward and reverse travel through tight spaces, dirt, sand, and rubble.
