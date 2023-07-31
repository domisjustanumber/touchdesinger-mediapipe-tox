var wsURL = 'ws://localhost:9980'
var webcamId = 'default'

// import the local vision bundle
// Download the latest version here: https://www.jsdelivr.com/package/npm/@mediapipe/tasks-vision
import vision from "./mediapipe/tasks-vision/0.10.2/vision_bundle.mjs";

const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

const imageBlendShapes = document.getElementById("image-blend-shapes");
const videoBlendShapes = document.getElementById("video-blend-shapes");

let detections = {};
let webcamRunning = false;
let faceLandmarker;
const videoWidth = window.innerWidth;
let runningMode = "VIDEO";
let canWebcam = false;
let showOverlay = 0;

let stream = null;

const videoElement = document.getElementById('video');

async function setupFacelandmarker() {
  // Read more `CopyWebpackPlugin`, copy wasm set from "https://cdn.skypack.dev/node_modules" to `/wasm`
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "./mediapipe/tasks-vision/0.10.2/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `mediapipe/face_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numFaces: 1,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true
  });
}
setupFacelandmarker();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.get('wsURL')) {
  wsURL = urlParams.get('wsURL');
  console.log("Got wsURL: " + wsURL);
}
if (urlParams.get('webcamId')) {
  webcamId = urlParams.get('webcamId');
  console.log("Got webcamId via URL: " + webcamId);
  getMedia();
}
if (urlParams.get('showOverlay')) {
  showOverlay = urlParams.get('showOverlay');
  console.log("Show overlay: " + showOverlay);
}

var socket; // the websocket
socket = new WebSocket(wsURL);

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  // console.log(msg);
  if (msg.type == "selectWebcam") {
    console.log("Got webcamId via WS: " + msg.deviceId);
    webcamId = msg.deviceId;
    getMedia();
  } else if (msg.type == "overlayChange") {
    console.log("Show overlay: " + msg.showOverlay);
    showOverlay = msg.showOverlay;
  }
};


const video = document.getElementById("webcam");
const canvasElement = document.getElementById(
  "output_canvas"
);

const canvasCtx = canvasElement.getContext("2d");


// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

async function testMedia() {
  if (!hasGetUserMedia()) {
    console.warn("getUserMedia() is not supported by your browser");
    canWebcam = false;
  }
  else {
    // List all available devices and send to WS
    if (navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia supported.');
      // console.log(navigator.mediaDevices.getUserMedia({ video: true }));
      let webcamDevices = { type: "webcamDevices", devices: [] };
      let audioDevices = { type: "audioDevices", devices: [] };

      navigator.mediaDevices.enumerateDevices()
        .then(function (devices) {
          let i = 0;
          devices.forEach(function (device) {
            if (device.kind == "videoinput") {
              webcamDevices['devices'].push({ "deviceId": device.deviceId, "label": device.label });
              console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
            }
            else if (device.kind == "audioinput") {
              audioDevices['devices'].push({ "deviceId": device.deviceId, "label": device.label });
            }
          });
          if (socket.readyState === WebSocket.OPEN) {

            // Send all devices
            // socket.send(JSON.stringify(audioDevices));
            socket.send(JSON.stringify(webcamDevices));
          }
        })
        .catch(function (err) {
          document.body.style.backgroundColor = "red";
          console.log(err.name + ": " + err.message);
        });
    }
    canWebcam = true;
  }
}

testMedia();

async function getMedia() {
  if (canWebcam) {

    if (stream !== null) {
      console.log("killing tracks");
      const tracks = stream.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });

      videoElem.srcObject = null;
    }
    stream = null;

    let constraints = {
      video: {
        deviceId: webcamId,
        width: {
          exact: 1280
        },
        frameRate: {
          ideal: 60,
          min: 30
        }
      }
    };

    // Activate the webcam stream.
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
      stream.getTracks().forEach(function (track) {
        console.log(track.getSettings());
      })
    } catch (err) {
      document.body.style.backgroundColor = "red";
      console.log(err.name + ": " + err.message);
    }
    webcamRunning = true;
  }
}

let lastVideoTime = -1;
let results = undefined;
const drawingUtils = new DrawingUtils(canvasCtx);

getMedia();

async function predictWebcam() {
  const vidRatio = video.videoHeight / video.videoWidth;
  video.style.width = videoWidth + "px";
  video.style.height = videoWidth * vidRatio + "px";
  canvasElement.style.width = videoWidth + "px";
  canvasElement.style.height = videoWidth * vidRatio + "px";
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;
  // Now let's start detecting the stream.
  let nowInMs = Date.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = faceLandmarker.detectForVideo(video, nowInMs);
  }
  if (results.faceLandmarks) {
    for (const landmarks of results.faceLandmarks) {
      if (socket.readyState === WebSocket.OPEN) {

        // Send all data as JSON
        socket.send(JSON.stringify(results));
      }
      if (showOverlay != 0) {
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: "#C0C0C070", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
          { color: "#FF3030" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
          { color: "#FF3030" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
          { color: "#30FF30" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
          { color: "#30FF30" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
          { color: "#E0E0E0" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LIPS,
          { color: "#E0E0E0" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
          { color: "#FF3030" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
          { color: "#30FF30" }
        );
      }
    }
  }
  // drawBlendShapes(videoBlendShapes, results.faceBlendshapes);

  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}