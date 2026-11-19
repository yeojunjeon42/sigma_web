---
title: Pygmalion
titleKo: 피그말리온
year: 2017
date: 2017
tags: [2017, URP, SNU Creative Design Fair, Cultural heritage restoration]
team: Changyeong Gwon, Seonghyeon Park, Geonjun Lee, Hyegeon Lee
---

## Overview

Named after the Greek myth of the sculptor who fell in love with his statue, Pygmalion began as a project to visualize an AI companion on a 3D display before pivoting to virtual cultural heritage restoration. Our goal was to build a 360-degree 3D display and an interactive interface for manipulating and assembling 3D cultural artifact models in mid-air.

## How it works

Based on the paper *Rendering for an Interactive 360° Light Field Display*, the display projects images onto a high-speed spinning mirror, reflecting different perspective views across 360 degrees so viewers see a stereoscopic 3D object from any angle around the device.

Displayed objects are loaded from STL files as polygon meshes, and each vertex is projected according to the mirror's instantaneous rotation angle. A Leap Motion sensor tracks the user's palm position and orientation to translate and rotate the mesh vertices in real time, streaming updated frames to the projector for interactive manipulation.
