---
title: HandyBot
year: 2025
date: 2025
tags: [2025, Making, Teleoperation]
team: Jihwan Gong, Juhyeong Kim, Huigyeong Song, Seohyeon Lee, Donggwang Kim, Jeonghwan Kim, Seongu Hong, Seunghyeon Lee
---

## Overview

Remote operation

Signal transmission and reception using hand tilt

Omnidirectional movement

Forward/backward/left/right movement, left/right rotation, and diagonal movement

Stability and expandability

Stable communication and power supply, with potential for additional input/output device applications

## Process

### Prototype (2025-11-14)

- Main materials: Breadboard / paper / double-sided tape / electrical tape
- ICs used: Arduino Nano / HC-06 / L9110 / 6V shared power supply
- Main functions: Bluetooth control via laptop / forward, backward, left, and right movement

### Upgrade 1 (2025-12-19)

- Main materials: Breadboard / PLA bottom plate / double-sided tape / electrical tape
- Components used: Arduino Nano / HC-06 / L9110 / 6V power supply / 6V motor power supply / LEDs
- Upgraded functions: Bluetooth control via console / separated power supplies / mode-specific LEDs
- Console components used: XIAO / HC-05 / GY-9250 / 4.5V power supply / buttons
- Console functions: Bluetooth control / tilt-based directional control / drive mode button

### Upgrade 2 (2025-12-22)

- Components used: Arduino Nano / HC-06 / L9110 / relay / 6V power supply / 6V–12V variable motor power supply / LEDs / HC-SR04
- Upgraded functions: Speed control via variable motor power supply / ultrasonic obstacle avoidance
- Upgraded console functions: Tilt-based speed control

### Upgrade 3 (2026-01-22)

- Main materials: PCB / PLA housing
- Components used: Arduino Nano / HC-06 / TB6612 / relay / 6V power supply / 6V–12V variable motor power supply / headlight LEDs / turn signal LEDs / brake light LEDs / reverse light LEDs
- Upgraded functions: Upgraded motor driver / full LED lighting
- Console components used: XIAO / HC-05 / GY-9250 / 4.5V power supply / buttons / SZH-EK056 / switch
- Upgraded console functions: Control mode button / joystick-based control / boost button / power switch
