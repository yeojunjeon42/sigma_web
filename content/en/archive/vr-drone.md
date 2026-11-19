---
title: VR Drone for Image Training
titleKo: 이미지 트레이닝 VR 드론
year: 2020
date: 2020
tags: [2020, SNU Creative Design Fair, Drone, Sport]
team: Seonghyeon Lee, Seokcheol Jung, Jinsol Park, Juhyeong Lee
---

## Overview

As drones become more accessible, we explored using them for personal sports and dance training by building a VR image-training drone that lets users watch themselves in real time from multiple angles to correct their posture.

For the hardware, we assembled motors, electronic speed controllers (ESCs), a Bluetooth module, a camera module, and a gyroscope sensor. We built a custom controller paired via an HC-06 Bluetooth module and mounted the camera under the drone on a two-axis servo gimbal so it can pan and tilt, streaming live video directly to a smartphone.

## Motivation

With COVID-19 reducing social contact and increasing time spent alone, people have sought ways to practice solo activities. While drones are widely used for racing and aerial filming, we wanted to build a drone for athletic training. Sports like boxing, taekwondo, basketball, and soccer normally require a coach or partner to observe form, and fixed mirrors or stationary cameras only show a single angle. Our VR image-training drone lets solo practitioners view their movements live from any angle to refine their technique.

## How it works

The drone enables solo users practicing dance or sports to monitor and correct their form in real time. Rather than a first-person view, the pan-tilt camera provides a third-person perspective, showing rear and side angles that users normally cannot see. Gyroscope-based PID stabilization keeps the footage steady even when the drone drifts, and a smartphone app allows the user to tilt their phone to adjust the camera's vertical angle.

## Process

We initially planned to program autonomous person-tracking using PID control so the drone would automatically orbit or hold position relative to the user, but due to technical constraints and COVID-19 restrictions, we implemented manual flight control instead.

Because commercial consumer drones do not allow custom flight firmware, we built our drone from an Arduino-compatible programmable drone kit. Using a gyroscope and PID stabilization, the drone maintains level flight for steady video, while two servo motors adjust the camera's pitch and yaw angles.

## Impact

By combining the capabilities of an aerial camera, a motion-tracking sensor like Kinect, and a VR viewer, this system offers a mobile alternative to stationary motion-capture setups. Unlike fixed sensors with limited range, a flying camera can follow users across wide areas for sports such as basketball or badminton and could be integrated into augmented reality fitness games.
