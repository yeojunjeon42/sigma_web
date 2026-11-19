---
title: Board Game Bot
year: 2025
date: 2025
tags: [2025, Making, Reinforcement learning, Robot arm]
team: Jinhyeong Kim, Jihun Choi, Seonho Park, Hyeonseok Oh, Junho Kim, Geonhui Moon, Hanjin Jang
---

## Process

### Chess Bot

- 3D-printed LeRobot CAD files
- Modified the gripper
- Modified chess pieces so the gripping area is uniform
- 3D-printed chess pieces and printed a chessboard with non-overlapping colors
- Implemented computer vision (YOLO) for chess piece recognition

### Problems

When viewed from above, chess pieces look too similar, making recognition difficult.

When picking up an adjacent chess piece, the gripper knocks over neighboring pieces. Due to the robot arm's reach limit, it cannot reach the far end of the chessboard. Extending the arm length places excessive torque on the motors, preventing them from applying sufficient force.

### Solution

Switched from chess to Gobblet. (Pieces can be recognized by size, and the game board is relatively compact.)

### Gobblet Game Bot

- 3D-printed Gobblet pieces
- Designed a dedicated gripper for Gobblet pieces
- Printed the game board
- Added cup holders (four in total, one at each corner)
- Built a camera mount

Used a RealSense camera's depth map to extract local minimum points among points with depth values smaller than a threshold relative to the board plane.

Marked regions around each local minimum that have similar depth values within a tolerance, clustered connected regions, marked their center points with red dots, and stored them in a list.

Identified which piece is present by checking the RGB and depth values of the pixels marked with red dots in the image.
