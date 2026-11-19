---
title: Alpha-D
year: 2016
date: 2016
tags: [2016, URP, Machine learning, Drone]
team: Jaeyeong Jung, Junyeong Jang, Yongjae Kim, Changyeong Gwon, Chanyeong Jung
---

## Overview

While machine learning has seen wide success on structured data such as images and text, applying it to real-time physical control systems has been more challenging. Alpha-D applied machine learning to optimize quadcopter flight control. Conventional quadcopters rely on Extended Kalman Filters and PID controllers whose gains are tuned empirically, leaving flight suboptimal when payloads change or rotor thrust becomes unbalanced. We used large-scale simulation datasets and machine learning to optimize quadcopter control across four key tasks: hovering PID tuning, variable-payload flight, motor-failure stabilization, and path planning.

## How it works

### Deriving PID gains for hovering

Because individual motors and propellers vary slightly in thrust, quadcopters tend to drift during hover. We used reinforcement learning to automatically tune PID gains so the quadcopter maintains stable stationary hover.

### Developing a flight algorithm for arbitrary payloads

Carrying arbitrary payloads alters a quadcopter's mass and center of gravity. Using the ROS Gazebo simulator, we applied a genetic algorithm—evolving, mutating, and selecting candidate parameter sets under varying simulated payloads—to determine optimal PID gains for stable loaded flight.

### Stabilizing flight during failure conditions

To maintain stability under severe thrust imbalance across rotors, we implemented attitude estimation using Madgwick's quaternion filter fusion algorithm. We simulated actuator degradation by altering the size of one of the four propellers, trained a convolutional neural network (CNN) on the flight data, and used the trained model to select stabilizing PID gains during failure conditions.

### Implementing path planning

To minimize real-time computation, the quadcopter selects trajectories from a precomputed trajectory library using reinforcement learning. For visual perception, we implemented depth extraction based on PTAM (Parallel Tracking and Mapping) and used supervised learning to determine optimal edge-detection thresholds.
