export const getIncomingCallDialog = (
  callTypeInfo,
  acceptCallHandler,
  rejectCallHandler
) => {
  const dialog = document.createElement("div");
  dialog.classList.add("dialog_wrapper");
  dialog.innerHTML = `
  <div class="dialog_content">
    <p class="dialog_title">Incoming ${callTypeInfo} Call</p>
    <div class="dialog_image_container">
      <img src="/images/dialogAvatar.png" alt="Dialog Avatar" />
    </div>
    <div class="dialog_button_container">
      <button class="dialog_accept_call_button">
        <img class="dialog_button_image" src="/images/acceptCall.png" alt="Accept Button Image" />
      </button>
      <button class="dialog_reject_call_button">
        <img class="dialog_button_image" src="/images/rejectCall.png" alt="Reject Button Image" />
      </button>
    </div>
  </div>
  `;
  dialog
    .getElementsByClassName("dialog_accept_call_button")[0]
    .addEventListener("click", acceptCallHandler);
  dialog
    .getElementsByClassName("dialog_reject_call_button")[0]
    .addEventListener("click", rejectCallHandler);

  return dialog;
};

export const getCallingDialog = (rejectCallHandler) => {
  const dialog = document.createElement("div");
  dialog.classList.add("dialog_wrapper");
  dialog.innerHTML = `
    <div class="dialog_content">
      <p class="dialog_title">Calling</p>
      <div class="dialog_image_container">
        <img src="/images/dialogAvatar.png" alt="Dialog Avatar" />
      </div>
      <div class="dialog_button_container">
        <button class="dialog_reject_call_button">
          <img class="dialog_button_image" src="/images/rejectCall.png" alt="Reject Button Image" />
        </button>
      </div>
    </div>
  `;
  dialog
    .getElementsByClassName("dialog_reject_call_button")[0]
    .addEventListener("click", rejectCallHandler);
  return dialog;
};

export const getInfoDialog = (title, description) => {
  const dialog = document.createElement("div");
  dialog.classList.add("dialog_wrapper");
  dialog.innerHTML = `
  <div class="dialog_content">
    <p class="dialog_title">${title}</p>
    <div class="dialog_image_container">
      <img src="/images/dialogAvatar.png" alt="Dialog Avatar" />
    </div>
    <p class="dialog_description">${description}</p>
  </div>
  `;
  return dialog;
};

export const getMessage = (message, right = false) => {
  const side = right ? "right" : "left";
  const container = document.createElement("div");
  container.classList.add(`message_${side}_container`);
  container.innerHTML = `<p class="message_${side}_paragraph">${message}</p>`;
  return container;
};
