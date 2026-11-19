---
title: Medicine Management for the Elderly
titleKo: 노인 약 관리 시스템
year: 2020
date: 2020
tags: [2020, SNU Creative Design Fair, Healthcare, Ageing]
team: Seongmin Lee, Seoyeon Park, Gyujin Cho
---

## Overview

The population of older adults is growing, and many take multiple medications for conditions such as diabetes, hypertension, arthritis, and dementia. According to the Ministry of Health and Welfare, older adults in Korea take an average of 5.3 medications per day. Because it is difficult for caregivers to manage medication schedules individually for every older adult, we designed a system that dispenses and tracks medications automatically.

The system consists of a medication-dispensing device for older adults and a management mobile application for caregivers. Caregivers register and log in on the app, enter schedules such as pill counts and dosing times, and transmit the data to the device via Bluetooth. The app tracks the remaining medication supply and sends an alert when 3 days' worth remains. The device houses a storage compartment for medication pouches alongside an Arduino and other components. When loading medication, bringing a pouch near the slot—similar to a bill acceptor—triggers an infrared sensor that activates a servo motor to draw the pouch inside. At the scheduled time, a speaker alerts the user and the device dispenses one pouch at a time for the user to tear open and take.

## Motivation

As society ages, the number of older adults living alone is rising rapidly, many of whom take numerous medications for diabetes, hypertension, arthritis, dementia, and blood circulation. Managing each person's medication manually is challenging, so we developed an automated medication management system. Caregivers can monitor how many days of medication remain via the app, while the device alerts the user via a speaker and dispenses the medication using a servo motor at the programmed time. Our goal was to make medication management convenient and reliable in daily life.

## How it works

After all pouches are loaded, the RTC module tracks the time in real time. At the time set by the caregiver, the speaker sounds an alarm and the servo motor activates to push out a single medication pouch so the user can easily tear and take it. Once dispensed, the updated remaining pouch count is sent via Bluetooth to the mobile app so the caregiver can monitor it easily.

## Process

We designed the enclosure in SolidWorks as a rectangular box measuring 10.8 cm x 18 cm x 16 cm, separated into a medication storage compartment and a compartment for the Arduino, sensors, and electronics. Rubber rollers feed and dispense the medication pouches, and an infrared sensor detects pouches inserted into the slot to pull them inside automatically, similar to a bill acceptor. The housing was fabricated by laser-cutting and assembling MDF boards.

When the pouch count inside the device is 0, the infrared sensor stays active. Inserting a pouch into the slot changes the sensor reading, triggering the servo motor to pull the pouch in. Once loading is complete, the infrared sensor turns off. An RTC module then continuously tracks the current time, and when the scheduled time arrives, the speaker plays an alert while the device dispenses a pouch.

## Impact

According to the Ministry of Health and Welfare, adults aged 65 and older in Korea take an average of 5.3 medications daily. Furthermore, the Korea Institute for Health and Social Affairs projects the older adult population to reach 10,331,075 in 2025 and 14,750,787 in 2035, with single-person older adult households accounting for 23.2%. Demand for medication management systems is therefore expected to grow. Because our system is designed for ease of use by older adults while allowing caregivers to refill and configure schedules effortlessly, it offers practical utility for both users and caregivers.
