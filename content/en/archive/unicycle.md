---
title: Unicycle Robot
titleKo: 외발자전거
year: 2017
date: 2017
tags: [2017, First-year project, Control]
team: Taeu Seo, Yonghui Lee, Jaeu Choi, Yeongmin Moon
---

## Overview

Inspired by Boston Dynamics' Handle robot, which uses control engineering to drive, jump, and carry loads with minimal actuators, we built a self-balancing unicycle robot using gyroscope and accelerometer feedback.

## How it works

Built with an Arduino Uno, a three-axis gyroscope, and two servo motors, the robot decouples roll and pitch stabilization.

For roll control, an upper reaction wheel spins counterclockwise when the robot tilts left and clockwise when it tilts right, using reaction torque to restore upright balance.

For pitch control, the lower drive wheel accelerates forward when the robot leans forward and backward when it leans backward, returning the body to vertical. By holding a slight forward or backward pitch angle, the unicycle drives continuously forward or in reverse.
