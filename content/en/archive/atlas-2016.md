---
title: ATLAS 2016
year: 2016
date: 2016
tags: [2016, URP, Disaster rescue]
team: Seonghyeon Park, Geonjun Lee, Gyuwon Lee, Gyeongjun Ji
---

## Overview

Inspired by the rescue challenges following the 2015 Nepal earthquake—where collapsed buildings and limited manpower hampered search efforts—ATLAS (revival) set out to build a disaster rescue and remote reconnaissance robot. Modeled on an aircraft carrier, the main ATLAS rover carries smaller modular scout robots inside its hull and deploys them into narrow rubble zones that the main chassis cannot enter.

## How it works

We focused on two main areas: rugged mechanical design for disaster sites and real-time multi-camera video streaming.

### Reliable mechanical design for disaster environments

To house and transport smaller module robots over rough debris, we designed the main hull out of 3 mm steel plate while retaining the tracked drivetrain from the original 2007 ATLAS robot. Because the original CAD files had been lost, we reverse-engineered the mounting holes of the legacy drivetrain to design the new upper deck, sealing the interior to protect expanded electronics from dust and debris. Finite-element stress analysis identified stress concentrations at corners, guiding adjustments to upper-hull joint angles, with dustproofing, waterproofing, and heat shielding planned as next steps.

### Video streaming from modules for real-time monitoring

Each scout module carries a controller and webcam that stream video over Wi-Fi to the main ATLAS rover, which relays the feed to a remote web server via a 4G LTE module. Future plans include expanding the web server to stream up to four module feeds simultaneously and mounting a pan-tilt camera on the main rover synchronized with the remote operator's head movements.
