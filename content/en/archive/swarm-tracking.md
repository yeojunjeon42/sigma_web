---
title: Collective Robot Tracking System in Urban Environment
titleKo: 도심 집단로봇 추적 시스템
year: 2020
date: 2020
tags: [2020, SNU Creative Design Fair, Autonomous driving, Swarm robotics]
team: Seongmin Seo, Jeongmin Seo, Minseok Kim, Minho Hwang
---

## Overview

While autonomous driving technology offers many benefits, it also raises concerns about new types of crime, such as vehicle-borne attacks. Conversely, autonomous police vehicles could perform law enforcement tasks, including pursuing fleeing manned or unmanned vehicles exploited by criminals in dense urban environments where accurate tracking is critical for public safety.

Our team developed a cooperative multi-robot tracking algorithm for pursuing a fleeing target in an urban environment with buildings and road networks, and tested its effectiveness in a physical simulation using a model city and Arduino-based robots. In the model city composed of blocks and streets, three pursuer robots chase one faster evader robot trying to reach one of four randomly selected exits. The simulation ends when the evader reaches an exit or a pursuer gets close enough to capture it. All robots connect to a central computer that tracks the positions of the pursuers and evader and sends movement commands based on our algorithm. This architecture models a real-world scenario where tracking sensors locate the fleeing vehicle and pursuers exchange data with a central dispatch computer.

## Motivation

Systems that use multiple drones to pursue rogue unmanned aerial vehicles conducting illegal flights or espionage are already under research worldwide. However, few studies have examined unmanned pursuer–evader scenarios in ground environments rather than in the air. Unlike drones that can fly freely along shortest-time trajectories, ground vehicles are restricted to road networks. Our project differentiates itself by studying cooperative multi-robot pursuit under constrained urban road topologies.

## How it works

The central computer and robots interact as follows. Before the simulation starts, the initial positions and headings of all robots are entered into the central computer. During the simulation, whenever a robot reaches an intersection, it reports to the central computer, which updates all robot positions. Based on the map and current positions, the computer computes the optimal path and transmits the next turning or movement direction to each robot. Each robot turns accordingly and drives along the road until the simulation terminates—either when the evader reaches an exit or when a pursuer intercepts the evader.

## Process

To solve this problem, we developed a path-selection algorithm enabling each robot to choose optimal routes, and designed the robots to send their positions and states to a central computer while receiving optimal movement commands in return. Although a fleeing target would not communicate with a central computer in reality, we simplified the simulation by having both pursuers and the evader exchange position data with the central computer to represent sensor-based detection and target awareness.

Each robot is built on Arduino, equipped with four ultrasonic sensors (one in each direction) to detect grid intersections and a Bluetooth module to communicate with the central computer. To minimize the robots' footprint on the model roads, we designed a three-tier vertical chassis and sized the dimensions tightly around the components. The 3D-printed parts were modeled in Onshape.

## Impact

This project demonstrates a model-scale cooperative target-tracking system for autonomous robots in an urban environment. Although still at an abstract prototype stage, it presents a multi-robot coordination approach for ground-based urban pursuit scenarios that are likely to become more common in the autonomous driving era. Because a single pursuer faces severe limitations in complex city grids, networked pursuers sharing information can achieve more reliable interception and contribute to public safety.
