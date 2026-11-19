---
title: Hexapod 2.0
year: 2016
date: 2016
tags: [2016, Walking robot, Independent research]
team: Donghun Park
---

## Overview

Hexapod 2.0 was built to achieve lifelike, natural multi-legged locomotion. Adopting an improved mechanical architecture over the original Hexapod 1.0, it delivers smoother gaits and a more complete control system.

## How it works

The six-legged frame was 3D-printed based on modified open-source PhantomX hexapod CAD designs, reducing weight and lowering idle current draw compared to Hexapod 1.0. Built on the ROS framework over Wi-Fi, the robot uses DYNAMIXEL smart actuators that report joint angles and current draw. For each 3-DOF leg, the controller generates foot trajectories and computes inverse kinematics in real time.

Hexapod 2.0 accepts two velocity commands—linear forward speed and angular turning rate—to compute foot placements on the fly. Users can control the robot via SSH command line or a web interface hosted on its onboard ODROID-U3 Linux computer (Exynos 4412).
