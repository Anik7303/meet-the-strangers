import * as webRTCHandler from "./webRTCHandler.js";
import * as wss from "./wss.js";
import * as ui from "./ui.js";

let strangerCallType;

export const changeStrangerConnectionStatus = (status) => {
  const data = { status };
  wss.changeStrangerConnectionStatus(data);
};

export const getStrangerSocketIdAndConnect = (callType) => {
  strangerCallType = callType;
  wss.getStrangerSocketId();
};

export const connectWithStranger = (strangerSocketId) => {
  if (!strangerSocketId) {
    // no user is available for connection
    ui.showNoStrangerAvailableDialog();
    return;
  }

  webRTCHandler.sendPreOffer(strangerCallType, strangerSocketId);
};
