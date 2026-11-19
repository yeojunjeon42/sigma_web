---
title: mOm
titleKo: 마팡이
year: 2017
date: 2017
tags: [2017, Independent research, Machine learning]
team: Jeonghwan Kim, Jeonghun Kim, Howon Shin
---

## Overview

This project aimed to build a gesture-recognition controller powered by machine learning that sends infrared commands to control multiple household devices. Inspired by the idea of waving a wand to trigger different actions, we modeled the controller after a Harry Potter magic wand.

## How it works

An MPU-6050 accelerometer and gyroscope capture the wand's motion. Because real-time neural network inference exceeds the computing capacity of a small microcontroller, sensor data is streamed via Bluetooth to a PC, where a CNN–LSTM deep neural network classifies each gesture in real time and triggers corresponding infrared commands.

To demonstrate the controller, we built target peripherals including an array of LED bulbs and a model electric fan that respond to different wand gestures.
