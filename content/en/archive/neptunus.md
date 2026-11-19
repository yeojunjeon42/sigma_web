---
title: Neptunus
year: 2016
date: 2016
tags: [2016, URP, Exploration robot, Amphibious]
team: Yonghyeok Kim, Donghun Park, Hyegeon Lee, Yujin Park, Yongjae Kim
---

## Overview

Neptunus is a long-range amphibious exploration robot system designed for hazardous or remote environments inaccessible to humans. Conventional exploration robots face two major constraints: limited battery life that risks unrecoverable loss in the field, and single-domain designs that require separate platforms for land and water. Neptunus addresses both with hibernation mode, solar self-charging, and a transforming amphibious chassis for sustained remote operation over land and water.

## How it works

We focused on two core engineering pillars: mechanical reliability for amphibious transitions and a solar MPPT power architecture.

### Mechanical stability for amphibious operation

Inspired by the Gibbs Quadski's hull design, Neptunus retracts its wheels into recessed wheel wells to reduce hydrodynamic drag in water. To absorb terrain shocks and stabilize onboard cameras, we adapted a rocker-bogie suspension geometry to a four-wheel layout.

The drivetrain supports land driving, water propulsion, and amphibious transformation with full waterproofing. On land, two front in-wheel permanent magnet synchronous motors (PMSMs) provide front-wheel drive alongside two rear caster wheels; because Hall sensors are vulnerable to water, we implemented sensorless field-oriented control (FOC) using a TI DSP and InstaSPIN library. On water, two detachable rear thruster modules—each housing two BLDC motors—provide propulsion. To prevent wheels from snagging on shallow shorelines during water-to-land transitions, a dual parallelogram linkage folds the wheels upward without exposed motors or fouling-prone gears.

### Reliable electrical system with solar MPPT charging

Custom-shaped solar cells fitted to the upper hull charge the robot through an MPPT (Maximum Power Point Tracking) circuit. An ultra-low-power MSP430 microcontroller manages power switching across three independent power domains—communications, locomotion, and transformation—prioritizing communication battery charging so operators can always reconnect over LTE.

Neptunus communicates over LTE using WebSockets as a client, enabling a single remote operator to control multiple units simultaneously while receiving real-time ROS telemetry on motor speed and torque.
