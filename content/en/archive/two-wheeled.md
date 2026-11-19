---
title: Two-Wheeled Self Balancing Robot
year: 2017
date: 2017
tags: [2017, First-year project, Control]
team: Jiwon Shin, Seoyun Jang, Yeonghun Go
---

## Overview

This project aimed to build a compact military transport robot that balances itself on two wheels. Modeled on the Segway personal transporter, a two-wheeled self-balancing chassis allows an unmanned transport robot to maneuver smoothly in tight spaces. Our goal was to build a robot that maintains balance even when pushed or tilted.

## How it works

The drivetrain consists of two DC motors controlled via PWM to maintain upright balance. Using a PID control algorithm, the controller reads tilt and acceleration data from a gyroscope and accelerometer and computes the PWM signals sent to each wheel motor.

In addition to balancing stationary in place, the robot maintains stability while driving like a Segway and supports wireless remote operation via a Bluetooth controller.
