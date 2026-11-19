---
title: Sense of Balance
titleKo: 평형감각
year: 2017
date: 2017
tags: [2017, Solo project, Control]
team: Seokjun Lee
---

## Overview

Inspired by reaction-wheel attitude control systems used in satellites at KAIST's Aerospace Engineering satellite lab, this project applies conservation of angular momentum to stabilize a ground robot. The primary goal was to achieve reliable dynamic balance using a custom-built BLDC motor driver.

## How it works

The reaction-wheel stabilization system is implemented on an inverted-pendulum chassis. A high-inertia flywheel is mounted on a BLDC motor controlled by RPM through our custom motor driver. A gyroscope measures the pendulum's tilt angle in real time, and the controller spins the reaction wheel accordingly to keep the pendulum balanced upright.
