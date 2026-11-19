---
title: Object-Detecting Vibrating Shoes
titleKo: 물체감지 진동 신발
year: 2020
date: 2020
tags: [2020, SNU Creative Design Fair, Accessibility]
team: Yuna Lee, Donghwi Kim, Junwon Yang, Wonjae Ho
---

## Motivation

People with visual impairments face difficulties detecting surrounding obstacles while walking, and a white cane only detects objects directly ahead. We saw a need for a device that detects obstacles in all directions and gauges their distance. To maximize accessibility and minimize burden without requiring external hardware, we chose shoes—an item everyone wears daily—and designed them like a self-contained wearable computer with minimal size increase over standard footwear.

## How it works

We designed the shoe frame in Fusion 360 with integrated channels and housings for wiring, switches, and ultrasonic sensors, and 3D-printed covers to conceal the electronics. Flexible TPU filament gave the printed shoes realistic bendability. Each shoe runs on a 3.3V Arduino Pro Mini powered by a 3.7V lithium-polymer battery, with three ultrasonic sensors (front, side, and rear) paired with three vibration motors. Distance is calculated from the time elapsed between the ultrasonic sensor's trigger pulse and echo return, calibrated through repeated experiments to compensate for program execution delays. Vibration intensity is programmed to scale inversely with obstacle distance so the wearer can intuitively sense proximity. A charging module with overcharge protection and a physical power switch allow convenient recharging and daily operation.

## Process

To work efficiently, we split into two sub-teams: 3D printing and Arduino electronics, later integrating both halves. The 3D-printing team modeled the shoes in Fusion 360 and printed them using flexible TPU filament to replicate the feel of real footwear. Because the build volume of our 3D printer was small, we split the CAD model in half and bonded the printed parts together. The Arduino team built the circuit and wrote the firmware on an Arduino Pro Mini to measure distances with ultrasonic sensors and adjust vibration intensity accordingly. After verifying and debugging each subsystem, we assembled the shoes, tested them, and finished the exterior.

## Impact

These shoes detect obstacles in all directions. The long detection range of the ultrasonic sensors alerts wearers to hazards farther away than a cane can reach, and continuous scanning detects moving or small obstacles in real time. Because the shoes closely match the size and form factor of ordinary footwear and require no complex setup, they provide an accessible and practical mobility aid.
