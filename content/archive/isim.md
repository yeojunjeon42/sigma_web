---
title: ISIM
year: 2015
date: 2015
tags: [2015, 군집로봇, URP, 창의설계축전]
source: 2015 30주년 작품집 20p
team: 김용혁 (기계항공 14), 박유진 (기계항공 10), 박동훈 (전기정보 13), 양준모 (전기정보 12)
---

Intelligent Social Insect-like Module

사회적 곤충의 군집을 모사하며 기능하는 운송 로봇을 concept으로 제작된 작품입니다.

## ISIM의 구조적 특징 및 개발 목표

ISIM은 각 모듈이 독립적으로 동작할 수 있는 동시에, 개체들이 결합하여 움직일 수 있습니다.
ISIM의 특별한 점은, 결합 후에도 군집의 형태가 변화할 수 있다는 점입니다. 이것이 가능한
이유는 ISIM 양 쪽에 있는 전자석은 그 위치가 고정되어있지 않기 때문입니다.

## ISIM 사용기술

### 1) Star Network

ISIM의 통신은 Zigbee를 이용한 Star Network를 구축하여 사용하였습니다. Star Network에서는
1대의 Coordinator가 다수의 End Device들과 동시에 통신을 할 수 있습니다.

### 2) Vision Processing for Burden Recognizing

ISIM이 군집형 운송로봇으로서 기능하기 위해 자동적인 짐 인식 기능을 Software에 같이
넣었습니다. openCV 카메라가 초기에 찍고 있던 바닥면을 지속적으로 default 상태의 배경으로
인식하게 한 후, 짐이 들어오면 배경과의 차이를 통해 해당짐이 얼마나 큰 물건인지 인식합니다.
그리고 ISIM은 필요한 대수가 필요한 형태로 나가서 짐을 받습니다.
