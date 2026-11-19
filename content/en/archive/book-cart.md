---
title: Automatic Book Cart
titleKo: 자동 책 수레
year: 2020
date: 2020
tags: [2020, SNU Creative Design Fair, Automation, Robot]
team: Minho Cha, Hyeonseo Kim, Seongmin Jang, Changhwan Hwang
---

## Overview

In 2018, library book loans in Korea totaled approximately 250 million, each requiring staff or volunteers to reshelve returned books. To reduce the repetitive labor required for library shelving, we developed an autonomous book-shelving robot tested in a scaled library model. The robot reads book RFID tags to determine shelf addresses, navigates autonomously along a grid using line tracing, adjusts its lift height, shelves each book, and returns to its starting point. A worm gear and rack-and-pinion mechanism converts motor rotation into linear pushing motion to slide books onto shelves. The robot executes six steps: book identification, grid navigation to the target bookshelf, stopping at the exact shelf slot, lift height adjustment, book insertion, and returning to home position. Deploying a single autonomous cart eliminates the need to modify existing library bookshelves, making it an economical automation approach.

## Motivation

With over 250 million library checkouts annually in Korea—plus in-library browsing—reshelving books demands substantial labor. Existing solutions such as Singapore's AuRoss robot scan shelf RFID tags to detect misplaced books, whereas our Automatic Book Cart actively transports and inserts books into their designated shelf slots.

## How it works

Unlike systems that require installing RFID readers or conveyor mechanisms across every bookshelf in a library, our robot only requires laying simple guide lines on the floor, keeping infrastructure costs low.

## Process

Because typical libraries arrange double-sided bookshelves in rectangular grids, we designed a four-wheeled chassis optimized for grid navigation: two independently driven side drive wheels at the center and one caster wheel each at the front and rear. Differential drive on the central wheels allows the robot to pivot smoothly in place at grid intersections for precise 90-degree turns.

## Impact

Automating book shelving reduces repetitive manual labor, allows reshelving after library operating hours, and frees librarians to focus on patron services—particularly at regional libraries facing volunteer shortages. Upgrading the current prototype frame (built from Science Box parts) to 3D-printed or laser-cut components and improving motor precision and multi-size book handling would make it viable for real-world deployment.
