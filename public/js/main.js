import * as store from "./store.js";
import * as wss from "./wss.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as recordingUtils from "./recordingUtils.js";

// initialization of Socket.IO server connection
const socket = io();
wss.registerSocketEvents(socket);

webRTCHandler.getLocalPreview();

// register event listener for personal code copy button
const personalCodeCopyButton = document.getElementById(
  "personal_code_copy_button"
);

personalCodeCopyButton.addEventListener("click", () => {
  const personalCode = store.getState().socketId;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(personalCode);
  }
});

// register event listeners for connection buttons
const calleePersonalCodeInput = document.getElementById("personal_code_input");
const personalCodeChatButton = document.getElementById(
  "personal_code_chat_button"
);
const personalCodeVideoButton = document.getElementById(
  "personal_code_video_button"
);

personalCodeChatButton.addEventListener("click", () => {
  const calleePersonalCode = calleePersonalCodeInput.value;
  const callType = constants.callType.CHAT_PERSONAL_CODE;
  webRTCHandler.sendPreOffer(callType, calleePersonalCode);
});

personalCodeVideoButton.addEventListener("click", () => {
  const calleePersonalCode = calleePersonalCodeInput.value;
  const callType = constants.callType.VIDEO_PERSONAL_CODE;
  webRTCHandler.sendPreOffer(callType, calleePersonalCode);
});

// event listeners for video call buttons
document.getElementById("mic_button").addEventListener("click", () => {
  const audioTrack = store.getState().localStream.getAudioTracks()[0];
  const micEnabled = audioTrack.enabled;
  audioTrack.enabled = !micEnabled;
  ui.updateMicButton(!micEnabled);
});

document.getElementById("camera_button").addEventListener("click", () => {
  const videoTrack = store.getState().localStream.getVideoTracks()[0];
  const cameraEnabled = videoTrack.enabled;
  videoTrack.enabled = !cameraEnabled;
  ui.updateCameraButton(!cameraEnabled);
});

document
  .getElementById("screen_sharing_button")
  .addEventListener("click", () => {
    const screeSharingActive = store.getState().screenSharingActive;
    webRTCHandler.switchBetweenCameraAndScreenSharing(screeSharingActive);
  });

// messenger
const newMessageInput = document.getElementById("new_message_input");
newMessageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    webRTCHandler.sendMessageUsingDataChannel(event.target.value);
    ui.appendMessage(event.target.value, true);
    newMessageInput.value = "";
  }
});

document.getElementById("send_message_button").addEventListener("click", () => {
  const message = newMessageInput.value;
  webRTCHandler.sendMessageUsingDataChannel(message);
  ui.appendMessage(message, true);
  newMessageInput.value = "";
});

// recording
document
  .getElementById("start_recording_button")
  .addEventListener("click", () => {
    recordingUtils.startRecording();
    ui.showRecordingPanel();
  });

document
  .getElementById("stop_recording_button")
  .addEventListener("click", () => {
    recordingUtils.stopRecording();
    ui.resetRecordingButtons();
  });

document
  .getElementById("pause_recording_button")
  .addEventListener("click", () => {
    recordingUtils.pauseRecording();
    ui.toggleRecordingState();
  });

document
  .getElementById("resume_recording_button")
  .addEventListener("click", () => {
    recordingUtils.resumeRecording();
    ui.toggleRecordingState();
  });

// hang up
document.getElementById("hang_up_button").addEventListener("click", () => {
  webRTCHandler.handleHangUp();
});

document
  .getElementById("finish_chat_call_button")
  .addEventListener("click", () => {
    webRTCHandler.handleHangUp();
  });
