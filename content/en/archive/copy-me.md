---
title: Copy Me
titleKo: 날 따라해봐요
year: 2017
date: 2017
tags: [2017, First-year project, SNU Creative Design Fair, Robot arm]
team: Geonho Lim, Changhyeon Kim, Hyeongju Kim, Hyeongseo Ahn
---

## Overview

"Copy Me" is a robotic arm that replicates complex human arm movements without requiring the user to wear any sensors or markers. Our development benchmarks were enabling the arm to feed a person with a spoon and play table tennis, working toward a robotic arm capable of mirroring everyday human tasks.

## How it works

To achieve contactless motion capture, we used a Leap Motion controller to track the position and orientation of the user's palm. These coordinates are converted into target joint angles for each motor in the robotic arm, with our primary development focus placed on accurate motion replication and arm control.

### Design

The system comprises a Windows PC application and an embedded controller. The Java desktop application uses the Leap Motion SDK for hand tracking, the Caliko library for inverse kinematics, and the RXTX library for serial communication with the embedded board, which was programmed in EWARM using the HAL library.

### Materials

The robot consists of an actuator assembly, a base stage, and arm links. Actuation is driven by one geared stepper motor at the base joint (where the highest torque is required) and seven analog servo motors. The base stage was built from an acrylic box and aluminum profiles, while the arm links were made from size-20 PVC pipes connected via 3D-printed joints and Science Box parts.

## Results

Acrylic proved too brittle and difficult to machine for the load-bearing base stage; we recommend high-stiffness engineering plastics such as MC nylon for similar designs. Because Leap Motion sensor readings contain noise, applying a low-pass filter is recommended. Additionally, the lowest rotational axis bears the entire weight of the arm and requires a sturdier, easier-to-assemble mechanical structure, whereas PVC pipes worked well as lightweight links.
