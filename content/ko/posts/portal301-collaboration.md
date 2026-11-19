---
title: SIGMA × PORTAL301 Collaboration
titleKo: PORTAL301 기술 협업
year: 2025
tags: [2025, Collaboration, Autonomous driving, Industrial robot]
photos: portal301-collaboration-2x.jpg | Lit PORTAL301 sign on an office wall
---

SIGMA는 2025년 PORTAL301과 협업해 산업용 로봇과 자율주행 분야의 프로젝트 세 개를 수행했습니다. 각 프로젝트는 연습 과제로 기본 개념을 익힌 뒤 심화 과제에서 실제 문제에 적용하는 방식으로 운영했습니다.

## Robot Motion Planning

Coverage Path Planning(CPP)은 대상 영역의 표면 전체를 빠짐없이 지나는 경로를 찾는 문제입니다. 2D CPP는 로봇청소기나 농약 살포 드론처럼 이미 산업에서 쓰이고 있습니다.

이 프로젝트는 2D CPP를 3D로 확장해 다관절 로봇이 곡면이나 입체 형상의 표면 전체를 지나가는 경로를 계획하고자 했습니다. 이번에는 그 전 단계로 AI 기반 3D CPP 구현에 필요한 기본 요소를 다뤘습니다.

연습 과제는 2D CPP 구현과 Imitation Learning(IL) 튜토리얼이었습니다. 심화 과제에서는 실제 환경에서 IL 기반 Pick-and-Place를 수행하고, IL을 2D CPP에 적용했습니다.

## Vision System

XR 트래커는 VR·AR 환경에서 사람의 동작을 추적하는 장치로, 관성항법과 비전 기술을 함께 씁니다. VR 헤드셋의 적외선 카메라가 트래커에 부착된 적외선 LED의 2D 이미지상 위치를 포착하면, Perspective-n-Point(PnP) 알고리즘으로 이를 해석해 트래커의 3차원 위치와 자세인 6D 포즈를 계산합니다.

이 프로젝트는 2D 카메라로 여러 물체의 6D 포즈를 검출하고자 했습니다. 연습 과제(Marker-based Tracking)에서는 카메라 한 대와 정해진 위치에 배치한 마커로 6D 포즈를 추정했습니다. 심화 과제로는 마커를 무작위로 배치하는 Random Marker Problem, 카메라 여러 대를 쓰는 Multi-camera Tracking, 마커 추적에 관성 센서를 결합하는 Marker-IMU Sensor Fusion을 다뤘습니다.

## Laser Distance Sensor Array

레이저 거리 센서 하나는 한 점까지의 거리만 잽니다. 센서 여러 개를 배열로 놓으면 물체 표면의 깊이 정보를 얻을 수 있습니다.

이 프로젝트에서는 레이저 거리 센서 어레이로 물체의 3D 이미지를 구성하고자 했습니다. 세부 과제로는 센서마다 다른 측정 오차를 보정하는 Sensor Calibration과, 여러 센서를 동시에 제어해 같은 시점의 데이터를 얻는 Simultaneous Sensor Array Control을 수행했습니다.
