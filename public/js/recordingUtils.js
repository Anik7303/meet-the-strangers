import * as store from "./store.js";

let mediaRecorder;
let recordedChunks = [];

const vp9Codec = "video/webm; codecs=vp=9";
const vp9Options = { mimeType: vp9Codec };

const downloadRecordedVideo = () => {
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.classList.add("display_none");
  anchor.setAttribute("href", url);
  anchor.setAttribute("download", "recording.webm");
  document.body.appendChild(anchor);
  anchor.click();
  window.URL.revokeObjectURL(url);
};

const handleDataAvailable = (event) => {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
    downloadRecordedVideo();
  }
};

export const startRecording = () => {
  const remoteStream = store.getState().remoteStream;

  if (MediaRecorder.isTypeSupported(vp9Codec)) {
    mediaRecorder = new MediaRecorder(remoteStream, vp9Options);
  } else {
    mediaRecorder = new MediaRecorder(remoteStream);
  }

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
};

export const pauseRecording = () => {
  mediaRecorder.pause();
};

export const resumeRecording = () => {
  mediaRecorder.resume();
};

export const stopRecording = () => {
  mediaRecorder.stop();
};
