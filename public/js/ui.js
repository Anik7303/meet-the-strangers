import * as constants from "./constants.js";
import * as elements from "./elements.js";

const personalCodeParagraph = document.getElementById(
  "personal_code_paragraph"
);

export const updatePersonalCode = (personalCode) => {
  personalCodeParagraph.textContent = personalCode;
};

export const updateLocalVideo = (stream) => {
  const localVideo = document.getElementById("local_video");
  localVideo.srcObject = stream;

  localVideo.addEventListener("loadedmetadata", () => {
    localVideo.play();
  });
};

export const updateRemoteVideo = (stream) => {
  const remoteVideo = document.getElementById("remote_video");
  remoteVideo.srcObject = stream;
};

export const showVideoCallButtons = () => {
  const personalCodeVideoButton = document.getElementById(
    "personal_code_video_button"
  );
  const strangerVideoButton = document.getElementById("stranger_video_button");
  showElement(personalCodeVideoButton);
  showElement(strangerVideoButton);
};

export const showIncomingCallDialog = (
  callType,
  acceptCallHandler,
  rejectCallHandler
) => {
  const callTypeInfo =
    callType === constants.callType.CHAT_PERSONAL_CODE ? "Chat" : "Video";
  const incomingCallDialog = elements.getIncomingCallDialog(
    callTypeInfo,
    acceptCallHandler,
    rejectCallHandler
  );

  removeAllDialogs();

  dialog.appendChild(incomingCallDialog);
};

export const showCallingDialog = (rejectCallHanlder) => {
  const callingDialog = elements.getCallingDialog(rejectCallHanlder);

  removeAllDialogs();

  dialog.appendChild(callingDialog);
};

export const removeAllDialogs = () => {
  const dialog = document.getElementById("dialog");
  // dialog.innerHTML = "";
  // removing all dialogs inside HTML dialog element
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
};

export const showInfoDialog = (preOfferAnswer) => {
  let infoDialog = null;

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    infoDialog = elements.getInfoDialog(
      "Call rejected",
      "Callee rejected your call"
    );
  } else if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    infoDialog = elements.getInfoDialog(
      "Callee not found",
      "Please check personal code"
    );
  } else if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    infoDialog = elements.getInfoDialog(
      "Call is not possible",
      "Probably callee is busy, Please try again later"
    );
  }

  if (infoDialog) {
    showDialog(infoDialog);
  }
};

export const showNoStrangerAvailableDialog = () => {
  let infoDialog = elements.getInfoDialog(
    "No Stranger available",
    "Please try again later"
  );

  if (infoDialog) {
    showDialog(infoDialog);
  }
};

const showDialog = (dialog) => {
  document.getElementById("dialog").appendChild(dialog);
  setTimeout(() => removeAllDialogs(), 4000);
};

export const showCallElements = (callType) => {
  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.CHAT_STRANGER
  ) {
    showChatCallElements();
  } else if (
    callType === constants.callType.VIDEO_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_STRANGER
  ) {
    showVideoCallElements();
  }
};

const showChatCallElements = () => {
  const finishConnectionChatButtonContainer = document.getElementById(
    "finish_chat_button_container"
  );
  showElement(finishConnectionChatButtonContainer);

  const newMessageContainer = document.getElementById("new_message");
  showElement(newMessageContainer);

  // block panel
  disableDashboard();
};

const showVideoCallElements = () => {
  const callButtons = document.getElementById("call_buttons");
  showElement(callButtons);

  const placeholder = document.getElementById("video_placeholder");
  hideElement(placeholder);

  const remoteVideo = document.getElementById("remote_video");
  showElement(remoteVideo);

  const newMessageContainer = document.getElementById("new_message");
  showElement(newMessageContainer);

  //block panel
  disableDashboard();
};

// ui call buttons
export const updateMicButton = (micActive) => {
  const micImage = micActive ? "mic.png" : "micOff.png";
  const micButtonImage = document.getElementById("mic_button_image");
  micButtonImage.setAttribute("src", `/images/${micImage}`);
};

export const updateCameraButton = (cameraActive) => {
  const cameraImage = cameraActive ? "camera.png" : "cameraOff.png";
  const buttonImage = document.getElementById("camera_button_image");
  buttonImage.setAttribute("src", `/images/${cameraImage}`);
};

// ui messages
const messagesContainer = document.getElementById("messages_container");
export const appendMessage = (message, right = false) => {
  messagesContainer.appendChild(elements.getMessage(message, right));
};

export const clearMessages = () => {
  messagesContainer.innerHTML = "";
};

// recording
const recordingButtons = document.getElementById("video_recording_buttons");
const startRecordingButton = document.getElementById("start_recording_button");
const pauseRecordingButton = document.getElementById("pause_recording_button");
const resumeRecordingButton = document.getElementById(
  "resume_recording_button"
);
export const showRecordingPanel = () => {
  showElement(recordingButtons);

  // hide start recording button
  hideElement(startRecordingButton);
};

export const toggleRecordingState = () => {
  pauseRecordingButton.classList.toggle("display_none");
  resumeRecordingButton.classList.toggle("display_none");
};

export const resetRecordingButtons = () => {
  showElement(startRecordingButton);
  // hide recording panel
  hideElement(recordingButtons);
};

// ui after hang up

export const updateUIAfterHangUp = (callType) => {
  enableDashboard();

  // hide the call buttons
  if (
    callType === constants.callType.VIDEO_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_STRANGER
  ) {
    const callButtons = document.getElementById("call_buttons");
    hideElement(callButtons);
  } else {
    const chatCallButtons = document.getElementById(
      "finish_chat_button_container"
    );
    hideElement(chatCallButtons);
  }

  const newMessageInput = document.getElementById("new_message");
  hideElement(newMessageInput);
  clearMessages();

  updateMicButton(true);
  updateCameraButton(true);

  // hide remote video and show placeholder
  const remoteVideo = document.getElementById("remote_video");
  hideElement(remoteVideo);

  const placeholder = document.getElementById("video_placeholder");
  showElement(placeholder);

  removeAllDialogs();
};

//  changing status of checkout
export const updateStrangerCheckbox = (allowConnections) => {
  const checkboxImg = document.getElementById("allow_strangers_checkbox_image");
  allowConnections ? showElement(checkboxImg) : hideElement(checkboxImg);
};

// ui helper function
const enableDashboard = () => {
  const dashboardBlocker = document.getElementById("dashboard_blur");
  if (!dashboardBlocker.classList.contains("display_none")) {
    dashboardBlocker.classList.add("display_none");
  }
};

const disableDashboard = () => {
  const dashboardBlocker = document.getElementById("dashboard_blur");
  if (dashboardBlocker.classList.contains("display_none")) {
    dashboardBlocker.classList.remove("display_none");
  }
};

const hideElement = (element) => {
  if (!element.classList.contains("display_none")) {
    element.classList.add("display_none");
  }
};

const showElement = (element) => {
  if (element.classList.contains("display_none")) {
    element.classList.remove("display_none");
  }
};
