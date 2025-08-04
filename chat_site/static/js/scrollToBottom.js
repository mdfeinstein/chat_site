
function scrollToBottom(container_id){
  let chatContainer = document.getElementById(container_id);
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
};