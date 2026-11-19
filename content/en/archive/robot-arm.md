---
title: Robot Arm
year: 2025
date: 2025
tags: [2025, Making, Robot arm]
team: Seeun Kim, Siyeon Park, Seunggyeong Seo, Yeonguk Yoo, Inseong Hwang
---

## Process

Built the hardware by referencing a YouTube video.

Fabricated most parts using the STL files provided in the YouTube video.

## Results

### Limitations

Power supply defect

Because the YouTuber was based in Europe, using the exact European power supply caused compatibility issues and prevented the robot from operating in Korea.

### Workaround

Used a 6V battery holder.

Studied the circuit layout to determine how power was distributed, then bypassed the original power supply and connected the battery holder.

Testing with this setup resulted in slow response times and movements that differed from controller inputs.

### Next steps

Two potential approaches:

- Purchase an EU-to-KR voltage converter to retain the original power supply system
- Replace the power supply system entirely with a battery holder

Common tasks:

- Adjust voltage levels and modify code based on experimental results
- Investigate and resolve the cause of the slow response time
