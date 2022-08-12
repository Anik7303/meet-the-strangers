import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";

let connectedUserDetails;

const callingDialogRejectCallHandler = () => {
  console.log("rejecting the call");
};

export const sendPreOffer = (callType, calleePersonalCode) => {
  connectedUserDetails = {
    callType,
    socketId: calleePersonalCode,
  };
  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const data = {
      callType,
      calleePersonalCode,
    };

    ui.showCallingDialog(callingDialogRejectCallHandler);
    wss.sendPreOffer(data);
  }
};

const sendPreOfferAnswer = (answer) => {
  const data = {
    callerSocketId: connectedUserDetails.socketId,
    preOfferAnswer: answer,
  };
  ui.removeAllDialogs();
  wss.sendPreOfferAnswer(data);
};

const acceptCallHandler = () => {
  console.log("call accepted");
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  ui.showCallElements(connectedUserDetails.callType);
};

const rejectCallHandler = () => {
  console.log("call rejected");
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};

export const handlePreOffer = (data) => {
  const { callType, callerSocketId } = data;

  connectedUserDetails = {
    callType,
    socketId: callerSocketId,
  };

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
  }
};

export const handlePreOfferAnswer = (data) => {
  const { preOfferAnswer } = data;

  ui.removeAllDialogs();

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    // show dialog that callee has not been found
    ui.showInfoDialog(preOfferAnswer);
  } else if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    // show dialog that calle is not able to connect
    ui.showInfoDialog(preOfferAnswer);
  } else if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    // show dialog that call is rejected by the callee
    ui.showInfoDialog(preOfferAnswer);
  } else if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
    // send webRTC offer
    ui.showCallElements(connectedUserDetails.callType);
  }
};
