---
title: Walk
titleKo: 산책
year: 2017
date: 2017
tags: [2017, Independent research, Software, Music]
team: Yongjae Yoo, Jaeyeon Park, Garam Choi
---

## Overview

Walk, a project by the team MT Latecomers, is a software application that generates music in real time to match the atmosphere of the place being filmed. Our goal was to implement real-time melody and harmony generation with musical variation and repetition, paired with live computer vision and location data, on a resource-constrained mobile device.

## How it works

We developed the software as an iOS mobile application. Using OpenCV for fast image processing, the app extracts the center pixel color, image entropy (visual complexity), and the six dominant colors and their area ratios via k-means clustering from each video frame.

Combining these visual features with the current time and GPS location, the app estimates the mood of the scene and sets musical parameters including key, register, tempo, time signature, and dynamics. It then generates harmonic progressions and melodies in real time based on fundamental music theory rules, pinning generated tracks to locations on a map for users to share.
