# touchdesinger-mediapipe-tox
A platform-agnostic mediapipe tox for use in Touch Designer, that uses GPU acceleration.

Currently the tox just supports Facial Landmarking, but looking to expand it to more Media Pipe Vision tasks

https://developers.google.com/mediapipe/solutions/vision/face_landmarker

## Installation
Copy the dist folder to the same folder as your TouchDesigner project

## Inputs and outputs
Currently no inputs, as you select which webcam to use in the Parameters
Outputs are:
- TOP of the video feed
- CHOPs for the 478 facial landmarks
- SOP of the face mesh points (eyes and mout are not filled in)
- CHOPS for the 52 blendshapes
- Table DAT of the Transformation Matrix (I believe this is something that allows you to map a flat image onto the plane of the face, but not sure)

## Thanks
Torin Blankensmith and his idea to embed Chromium with a python-based web server to host the mediapipe.js model, and a websocket server for data transfer.
This tox is based very heavily on his implementation shown here: https://www.youtube.com/watch?v=83StND-y4fY

Bryan Chung's implementation of python MediaPipe was my starting point for this work, and where the face mesh SOP model came from http://www.magicandlove.com/blog/2021/05/31/mediapipe-in-touchdesigner-5/
