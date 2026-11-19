---
title: LEAM
titleKo: 인공근육 기반 경량화 외골격
year: 2017
date: 2017
tags: [2017, URP, Exoskeleton, Artificial muscle]
team: Seogi Ahn, Hyeonse Jang, Geonho Lim, Jonghyeok Jung
---

## Overview

LEAM is an exoskeleton project that assists human joint motion using artificial muscles. The project began with the questions: "Why do conventional exoskeletons rely only on rigid linear and rotary actuators?" and "Can we build an exoskeleton using lightweight, flexible actuators?" Drawing inspiration from MIT's open-access article *Simple and strong: twisted silver painted nylon artificial muscle actuated by Joule heating*, we set out to move a mannequin's arm using custom-built artificial muscles.

## How it works

LEAM operates as follows: an electromyography (EMG) sensor reads electrical signals from skeletal muscles and sends them to an MCU, which interprets the wearer's muscle activity and supplies the required current to the artificial muscle units to assist joint motion.

To build a lightweight, flexible exoskeleton, we fabricated artificial muscles that mimic human muscle contraction instead of using conventional motors. We twisted 0.25 mm diameter nylon thread with a DC motor, coated it with a conductive silver-copper spray, dried it to form base muscle fibers, and twisted two base fibers together into a unit muscle fiber. Passing current through the unit fiber generates Joule heating and induces contraction similar to human muscle.

To translate EMG signals into intended arm motion, we attached EMG sensors and encoders to the arm and shoulder joints to collect calibration data and experimentally establish the relationship between EMG signals and physical arm movement. We also characterized the stress–strain response of the artificial muscle units as a function of input current and mapped it to the constrained joint kinematics of the mannequin arm to achieve smooth motion.
