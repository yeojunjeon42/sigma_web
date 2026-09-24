---
title: SIGMA x PORTAL301 Collaboration
titleKo: PORTAL301 기술 협업
year: 2025
tags: [2025, 협업, 자율주행, 산업용로봇]
source: PORTAL301 연계 프로젝트 과제 안내 (2025)
---

## Robot Motion Planning

다관절로봇 작업경로계획연구

### Introduction: Coverage Path Planning(CPP)란?

대상 영역 표면 전체를 커버하는 경로를 도출하는 것입니다. 로봇청소기, 드론방제(농약뿌리기)
등에 2D CPP가 산업적으로 응용되고 있습니다.

### 무엇을 해야 하나요?

본 프로젝트의 아이디어는 기존 2D CPP를 3D CPP로 확장하는 것입니다. 이번 프로젝트에서는
AI기반 3D CPP를 구현하기 위한 기본요소를 스터디해보는 것을 목표로 하여, 아래와 같이 연습
과제 2개와 심화과제 2개로 구성되어있습니다.

- 2D coverage path planning
- Imitation Learning Tutorial
- IL-based Pick-and-Place in Real world
- IL-based 2D coverage path planning

## Vision System-6D Pose Estimation

카메라 기반 6D 포즈 추정연구

### Introduction: XR Tracker의 원리

XR트래커는 VR/AR(가상/증강현실) 분야에서 사람의 동작을 추적하는데 사용하는 기본적인
툴로서, 관성항법과 비전기술의 정수가 녹아든 장치입니다. VR헤드셋에는 적외선 카메라가
내장되어 있어 2D 이미지 상에 맺힌 적외선 LED들의 위치정보를 조합(Perspective-n-Point)하여
XR트래커의 3차원 위치 및 3차원 자세를 추적하게 됩니다.

### 무엇을 해야 하나요?

본 프로젝트에서는 2D 카메라를 통해 다양한 물체의 6D pose를 검출하는 것을 목표로 합니다.
연습과제에서 하나의 카메라+정확히 배치된 마커 오브젝트에 대한 6D 포즈 추정을 수행하고,
심화과제에서 멀티카메라+랜덤마커+관성센서융합 어플리케이션을 수행합니다.

- Marker-based Tracking
- Random Marker Problem
- Multi-camera Tracking
- Marker-IMU Sensor Fusion

## Laser distance sensor array

레이저 센서 기반 6D 포즈 추정연구

### 무엇을 해야 하나요?

본 프로젝트에서는 레이저거리센서를 어레이화하여 물체에 대한 3D 이미지를 생성하는 것을
목표로 합니다.

- Sensor Calibration
- Simultaneous Sensor Array Control
