---
title: SIGMA × PORTAL301 Collaboration
titleKo: PORTAL301 기술 협업
year: 2025
tags: [2025, Collaboration, Autonomous driving, Industrial robot]
coverIllustration: /blog-illustrations/badge.svg
photos: portal301-collaboration-2x.jpg | Lit PORTAL301 sign on an office wall
---

In 2025, SIGMA collaborated with PORTAL301 on three projects in industrial robotics and autonomous driving. Each project was structured into a foundational practice assignment followed by an advanced assignment applied to a real-world problem.

## Robot Motion Planning

Coverage Path Planning (CPP) computes a trajectory that passes over every point of a target surface. 2D CPP is already widely used in industry, such as in robotic vacuum cleaners and agricultural spraying drones.

This project aimed to extend 2D CPP to 3D so an articulated robot arm can plan paths covering curved or three-dimensional surfaces. As an initial step, the team focused on core components needed for AI-based 3D CPP.

The practice assignment covered 2D CPP implementation and an Imitation Learning (IL) tutorial. In the advanced assignment, the team implemented IL-based Pick-and-Place in a physical environment and applied IL to 2D CPP.

## Vision System

XR trackers monitor human motion in VR and AR environments by combining inertial navigation with computer vision. When an infrared camera on a VR headset detects the 2D image coordinates of infrared LEDs on a tracker, a Perspective-n-Point (PnP) algorithm computes the tracker's 3D position and orientation (6D pose).

This project aimed to estimate the 6D poses of multiple objects using 2D cameras. The practice assignment (Marker-based Tracking) estimated 6D pose using a single camera and markers at fixed positions. Advanced assignments addressed the Random Marker Problem with arbitrarily placed markers, Multi-camera Tracking across multiple viewpoints, and Marker-IMU Sensor Fusion combining visual tracking with inertial sensors.

## Laser Distance Sensor Array

A single laser distance sensor measures distance to only one point, whereas an array of sensors can capture depth profiles across an object's surface.

This project aimed to reconstruct 3D object surfaces using a laser distance sensor array. Sub-tasks included Sensor Calibration to compensate for unit-to-unit measurement offsets and Simultaneous Sensor Array Control to synchronize measurements across all sensors at the same instant.
