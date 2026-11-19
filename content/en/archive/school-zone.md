---
title: School Zone Safety Device
titleKo: 스쿨존 안전장치
year: 2020
date: 2020
tags: [2020, SNU Creative Design Fair, Safety, Social problem]
team: Sumi Lee, Jinhui Yoon, Seoin Ahn, Mingwon Kim
---

## Overview

Traffic accidents between vehicles and pedestrians cause severe casualties and frequent disputes over fault, especially in school zones where child pedestrian accidents remain a persistent issue. Following the passage of the "Minsik Law," which sparked debate over placing heavy legal liability on drivers, we designed an active warning system that alerts pedestrians to approaching vehicles so they can exercise caution proactively.

Functionally inspired by parking garage exit sirens and structurally modeled after floor-mounted vehicle detection sensors, our system places ultrasonic sensors and warning indicators along the center of the road to provide real-time visual and auditory alerts of vehicle movement. In our model road prototype, when an ultrasonic sensor detects a passing vehicle overhead, it triggers the next three sensor units ahead along the vehicle's path. This alerts pedestrians in advance to approaching traffic—particularly vehicles emerging from blind spots—helping prevent accidents. The modular linear layout allows installation on various road geometries.

## Motivation

Child pedestrian safety in school zones has drawn growing public concern. Despite existing measures such as pedestrian guardrails, speed bumps, and curved lane markings, police data showed that school-zone accidents and fatalities involving children aged 12 and under increased in 2019 compared to the previous year, prompting the passage of the Minsik Law.

However, because strict driver-liability laws alone cannot prevent accidents caused by blind spots from illegally parked cars or walls, we saw a need for an active pedestrian warning device. Beyond school zones, such a system can also be deployed in senior protection zones, disability protection zones, and high-accident crosswalks.

## How it works

All 16 sensor units operate independently so the system can track multiple vehicles in a school zone simultaneously. To prevent overlapping or conflicting alerts when two or more vehicles travel in close succession, each unit immediately turns off its LED and buzzer as soon as a vehicle passes over it.

## Process

Sensor units are installed linearly along the roadway. As a vehicle drives over them, the sensors trigger sequentially, illuminating LEDs and sounding buzzers on a set number of units ahead in the vehicle's direction of travel.

Each sensor unit requires at least three I/O pins for its ultrasonic sensor, LED, and buzzer. Because a single Arduino lacks enough pins to control many units directly, we used I2C communication to connect multiple slave Arduinos—each managing four sensor units—to a master Arduino. The master Arduino aggregates sensor readings from the slaves, determines vehicle approach direction, and issues output commands.

## Impact

Although developed to prevent child traffic accidents in school zones, this system is adaptable to senior protection zones, disability protection zones, and any pedestrian area with high collision risk.
