---
title: Ballboy Robot
titleKo: 볼보이 로봇 (루카)
year: 2020
date: 2020
tags: [2020, SNU Creative Design Fair, Sport, Robot]
team: Mingyu Cho, Yeongrok Choi, Changdong Kim, Sejin Lim
---

## Overview

Our project began with a common everyday inconvenience: anyone who has played table tennis knows how tedious it is to retrieve balls whenever they roll off the table. To solve this problem, we built a Ballboy Robot that collects stray balls. We programmed the control logic on an Arduino and designed and fabricated custom hardware using SolidWorks.

## Motivation

In a society with less face-to-face interaction, sports provide an important way to relieve stress and build community. However, having to pause a game repeatedly to chase down stray balls interrupts play and adds frustration to an activity meant to reduce stress. We developed the Ballboy Robot as a practical solution.

Unlike existing ball-collecting machines that patrol fixed routes within a dedicated court, our robot can be manually driven near a ball via smartphone Bluetooth control, making it adaptable to any space. Mounting the camera directly on the robot for directional alignment is far simpler and less expensive than overhead ceiling camera tracking systems. With low-cost components aside from the camera module and simple smartphone control, the robot offers a cost-effective and user-friendly design.

## How it works

We used a Pixy2 camera module, which detects objects by tracking specific color signatures. By storing the orange color of a table tennis ball, the camera locates the ball in its frame. Because the camera's field of view is narrow, the user first steers the robot roughly toward the ball; once the ball is visible, a PID controller uses the Pixy2's position data to steer the robot precisely onto the ball. Combining manual long-range driving with automated vision-guided capture allows the robot to retrieve individual balls quickly and accurately.

## Process

We broke the task down into three stages:

1. The user drives the robot via smartphone until the ball enters the camera's field of view, after which the robot uses visual feedback to position its gripper for capture.
2. An infrared sensor detects the ball and activates a servo motor to close the gripper.
3. The user drives the robot back via smartphone control.

We used a Bluetooth serial module for smartphone communication and an Arduino Mega as the main controller.

The chassis was laser-cut from acrylic sheets, and the gripper arms were 3D-printed. We designed meshed gears at the base of the two gripper arms so driving one arm synchronously rotates the other. When the infrared sensor reading exceeds a threshold indicating a ball is between the arms, a servo motor closes the gripper to capture it.

## Impact

Because the final approach and capture are automated using the camera module, the robot can retrieve balls reliably whenever they fall within its detection range. Increasing the camera's detection range would enable fully automated retrieval during casual table tennis sessions. With further refinement to mechanical precision and durability, this low-cost design has strong potential for practical use.
