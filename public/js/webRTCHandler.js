import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";

let connectedUserDetails;
let peerConnection;
let dataChannel;

const defaultConstrains = {
  audio: true,
  video: true,
};

const configuration = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:13902", "stun:stun1.l.google.com:13902"] },
  ],
};

export const getLocalPreview = () => {
  if (navigator?.mediaDevices) {
    navigator.mediaDevices
      .getUserMedia(defaultConstrains)
      .then((stream) => {
        store.setCallState(constants.callState.CALL_AVAILABLE);
        store.setLocalStream(stream);
        ui.showVideoCallButtons();
        ui.updateLocalVideo(stream);
      })
      .catch((err) => console.error(err));
  }
};

const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(configuration);

  dataChannel = peerConnection.createDataChannel("chat");

  peerConnection.ondatachannel = (event) => {
    event.channel.addEventListener("open", () => {
      // console.log("datachannel ready to receive data");
    });

    event.channel.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      ui.appendMessage(message);
    });
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      // send our ice candidates to other peer
      wss.sendDataUsingWebRTCSignaling({
        socketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ICE_CANDIDATE,
        candidate: event.candidate,
      });
    }
  };

  peerConnection.onconnectionstatechange = (event) => {
    if (peerConnection.connectionState === "connected") {
      // console.log("successfully connected to other peer");
    }
  };

  // receiving tracks
  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  ui.updateRemoteVideo(remoteStream);

  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track);
  };

  // add our stream to peer connection
  if (
    connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE ||
    connectedUserDetails.callType === constants.callType.VIDEO_STRANGER
  ) {
    const localStream = store.getState().localStream;

    for (let track of localStream.getTracks()) {
      peerConnection.addTrack(track, localStream);
    }
  }
};

export const sendMessageUsingDataChannel = (message) => {
  const stringifiedMessage = JSON.stringify(message);
  dataChannel.send(stringifiedMessage);
};

const callingDialogRejectCallHandler = () => {
  const data = {
    socketId: connectedUserDetails.socketId,
  };
  closePeerConnectionAndResetState();
  wss.sendUserHangUp(data);
};

export const sendPreOffer = (callType, calleePersonalCode) => {
  connectedUserDetails = {
    callType,
    socketId: calleePersonalCode,
  };

  const data = {
    callType,
    calleePersonalCode,
  };

  ui.showCallingDialog(callingDialogRejectCallHandler);
  store.setCallState(constants.callState.CALL_UNAVAILABLE);
  wss.sendPreOffer(data);
};

const sendPreOfferAnswer = (answer, callerSocketId = null) => {
  const socketId = callerSocketId
    ? callerSocketId
    : connectedUserDetails.socketId;

  const data = {
    callerSocketId: socketId,
    preOfferAnswer: answer,
  };
  ui.removeAllDialogs();
  wss.sendPreOfferAnswer(data);
};

const acceptCallHandler = () => {
  createPeerConnection();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  ui.showCallElements(connectedUserDetails.callType);
};

const rejectCallHandler = () => {
  setIncomingCallsAvailable();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};

export const handlePreOffer = (data) => {
  const { callType, callerSocketId } = data;

  if (!checkCallPosibility(callType)) {
    return sendPreOfferAnswer(
      constants.preOfferAnswer.CALL_UNAVAILABLE,
      callerSocketId
    );
  }

  connectedUserDetails = {
    callType,
    socketId: callerSocketId,
  };

  store.setCallState(constants.callState.CALL_UNAVAILABLE);
  ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
};

export const handlePreOfferAnswer = async (data) => {
  const { preOfferAnswer } = data;

  ui.removeAllDialogs();

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    // show dialog that callee has not been found
    ui.showInfoDialog(preOfferAnswer);
    setIncomingCallsAvailable();
  } else if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    // show dialog that calle is not able to connect
    ui.showInfoDialog(preOfferAnswer);
    setIncomingCallsAvailable();
  } else if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    // show dialog that call is rejected by the callee
    ui.showInfoDialog(preOfferAnswer);
    setIncomingCallsAvailable();
  } else if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
    // send webRTC offer
    ui.showCallElements(connectedUserDetails.callType);
    createPeerConnection();
    await sendWebRTCOffer();
  }
};

const sendWebRTCOffer = async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  wss.sendDataUsingWebRTCSignaling({
    offer,
    socketId: connectedUserDetails.socketId,
    type: constants.webRTCSignaling.OFFER,
  });
};

export const handleWebRTCOffer = async (data) => {
  await peerConnection.setRemoteDescription(data.offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  wss.sendDataUsingWebRTCSignaling({
    answer,
    socketId: connectedUserDetails.socketId,
    type: constants.webRTCSignaling.ANSWER,
  });
};

export const handleWebRTCAnswer = async (data) => {
  await peerConnection.setRemoteDescription(data.answer);
};

export const handleWebRTCCandidate = async (data) => {
  try {
    await peerConnection.addIceCandidate(data.candidate);
  } catch (err) {
    console.error(
      "error occured when trying to add received ICE CANDIDATE",
      err
    );
  }
};

export const switchBetweenCameraAndScreenSharing = async (
  screenSharingActive
) => {
  if (screenSharingActive) {
    // go back to video track
    const localStream = store.getState().localStream;
    const videoTrack = localStream.getVideoTracks()[0];
    const sender = peerConnection
      .getSenders()
      .find((sender) => sender.track.kind === videoTrack.kind);

    if (sender) {
      const screenSharingStrem = store.getState().screenSharingStream;
      if (screenSharingStrem) {
        screenSharingStrem.getTracks().forEach((track) => track.stop());
      }

      sender.replaceTrack(videoTrack);
      store.setScreenSharingActive(!screenSharingActive);
      ui.updateLocalVideo(localStream);
    }
    return;
  }

  try {
    if (navigator?.mediaDevices) {
      const screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      store.setScreenSharingStream(screenSharingStream);

      // replace track which sender is sending
      const videoTrack = screenSharingStream.getVideoTracks()[0];
      const sender = peerConnection
        .getSenders()
        .find((sender) => sender.track.kind === videoTrack.kind);

      if (sender) {
        sender.replaceTrack(videoTrack);
        store.setScreenSharingActive(!screenSharingActive);
        ui.updateLocalVideo(screenSharingStream);
      }
    }
  } catch (err) {
    console.error("error occured while sharing screen", err);
  }
};

// hang up
export const handleHangUp = () => {
  const data = { socketId: connectedUserDetails.socketId };
  wss.sendUserHangUp(data);
  closePeerConnectionAndResetState();
};

export const handleConnectedUserHangedUp = () => {
  closePeerConnectionAndResetState();
};

export const closePeerConnectionAndResetState = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  // active mic and camera
  if (
    connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE ||
    connectedUserDetails.callType === constants.callType.VIDEO_STRANGER
  ) {
    store.getState().localStream.getAudioTracks()[0].enabled = true;
    store.getState().localStream.getVideoTracks()[0].enabled = true;
  }

  ui.updateUIAfterHangUp(connectedUserDetails.callType);
  setIncomingCallsAvailable();
  connectedUserDetails = null;
};

export const checkCallPosibility = (callType) => {
  const callState = store.getState().callState;

  if (callState === constants.callState.CALL_AVAILABLE) {
    return true;
  }

  if (
    callState === constants.callState.CALL_AVAILABLE_ONLY_CHAT &&
    (callType === constants.callType.CHAT_PERSONAL_CODE ||
      callType === constants.callType.CHAT_STRANGER)
  ) {
    return true;
  }

  return false;
};

export const setIncomingCallsAvailable = () => {
  const localStream = store.getState().localStream;
  if (localStream) {
    store.setCallState(constants.callState.CALL_AVAILABLE);
  } else {
    store.setCallState(constants.callState.CALL_AVAILABLE_ONLY_CHAT);
  }
};
