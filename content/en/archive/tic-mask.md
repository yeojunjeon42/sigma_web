---
title: Noise Cancellation Mask for Patients with Vocal Tics
titleKo: 노이즈 캔슬링 마스크
year: 2020
date: 2020
tags: [2020, SNU Creative Design Fair, Healthcare, Accessibility]
team: Minu Yang, Gyuhui Kim, Gwangho Lee, Taegyeong Lee
---

## Overview

This project addresses tics, which are involuntary, repetitive, and irregular muscle movements. While medication and therapy exist for tics, they require long treatment periods, cause significant discomfort, and often result in relapse. Meanwhile, few assistive devices exist to reduce daily inconveniences for people with tics. To overcome the limitations of existing devices that only work in specific situations, we designed a new assistive mask. A key limitation of existing masks made with sound-absorbing materials is that they cannot cancel vocal tics occurring in the middle of everyday conversation. We addressed this using acoustic interference: the device generates an anti-phase sound wave based on the sound of a tic and plays it when a tic occurs, canceling out the noise. The moment of a tic is detected by sensing muscle movement or sound intensity. A major advantage of this device is that it selectively cancels only vocal tics during normal conversation. Because treatment takes a long time, an assistive device that immediately eases daily discomfort offers a practical solution. Furthermore, while designed for people with tics, this device could also benefit patients with speech-related disorders caused by other neurological conditions.

## Motivation

Patients with chronic vocal tics, including those with Tourette syndrome, face severe difficulties in daily life—such as holding conversations or using public transportation—due to sudden, involuntary vocalizations. Thick masks using passive noise cancellation with sound-absorbing materials have served as an aid, but they cannot block tics that occur during conversation.

Therefore, our team proposed an assistive mask for patients with vocal tics that applies active noise cancellation using acoustic interference.

## Process

Because vocal tic symptoms vary widely, we targeted a specific symptom—simple shouting—seen in a Tourette syndrome patient featured on the television program *Ask Us Anything Fortune Teller*. We conceived three methods to implement noise cancellation in the mask, categorized by the mask's passive sound insulation and how the input signal detecting a tic is acquired.

First, we tested a Pololu MyoWare muscle sensor. However, unlike an electroglottograph (EGG), its structure prevented attaching electrodes to both sides of the vocal cords. Attaching it to one side of the neck could not distinguish between body movement, normal speech, and shouting tics. Because we did not meet actual patients during development, we could not verify whether measuring muscle signals from other body parts, such as the arms, would yield better results (we reached out to several tic support communities and a YouTuber with vocal tics, likely without success due to COVID-19). Consequently, we switched from a muscle sensor to a sound sensor that detects sound intensity.

We used an SMG sound sensor mounted on the mask. When the sound intensity from the user exceeds a set threshold, the system determines that a tic has occurred and outputs a pre-generated anti-phase audio file. We adopted this method for our final prototype. Due to processing latency, complete noise cancellation was not achieved in real time. However, the system successfully generated anti-phase audio in response to sound amplitude, and Python testing confirmed that full noise cancellation is achievable if the anti-phase output timing is properly synchronized. Future work will involve testing with actual patients, replacing the sound sensor with a muscle sensor, and tuning the timing synchronization.

## Impact

The Noise-Cancelling Mask is virtually the only assistive device tailored for patients with vocal tics and has the potential to significantly improve their quality of life. Because current treatments focus mostly on medication and therapy, many patients suffer from severe depression while unable to lead normal lives during long treatment periods, and severe tics frequently recur. This mask can help patients with vocal tics maintain normal daily activities, including employment, throughout their treatment.
