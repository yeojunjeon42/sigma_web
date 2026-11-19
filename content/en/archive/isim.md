---
title: ISIM
year: 2015
date: 2015
tags: [2015, Swarm robotics, URP, SNU Creative Design Fair]
team: Yonghyeok Kim, Yujin Park, Donghun Park, Junmo Yang
---

## Overview

Intelligent Social Insect-like Module (ISIM) is a modular swarm transport robot inspired by cooperative social insects.

Each ISIM module can operate independently or dock magnetically with neighboring units to transport payloads together. Because the electromagnets on both sides of each module are mounted on movable joints rather than fixed positions, docked swarms can reconfigure their formation dynamically while moving.

## How it works

### Star Network

ISIM communicates over a Zigbee star network in which one coordinator node manages simultaneous communication with multiple end-device modules.

### Vision Processing for Burden Recognizing

An OpenCV camera system captures the empty floor as a background reference and detects newly placed cargo via background subtraction, estimating object size so the required number of ISIM modules dispatch in an appropriate formation to carry the load.
