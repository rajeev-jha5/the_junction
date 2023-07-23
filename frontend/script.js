const chatBox = document.getElementById('display-box');
    const messageInput = document.getElementById('message-input');


    const ws = new WebSocket('wss://thejunction.shadyether.repl.co');

    ws.onopen = (event) => {
      chatBox.innerHTML += "<p>Connected to the chat!</p>";
    };
    
    var username=document.getElementById("username-data").getAttribute("data-value");
    

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const messageText = message.text;
      const sender = message.sender;

      chatBox.innerHTML += `<div id="sender-message"><p><strong id="sender-id">${sender}:</strong> ${messageText}</p></div>`;
      chatBox.scrollTop = chatBox.scrollHeight;
    };

    function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== '') {
      const messageObject = {
        text: message,
        sender: username    
      };
      ws.send(JSON.stringify(messageObject));
      chatBox.innerHTML += `<div id="client-message"><p></strong>${message}</p></div>`;
      chatBox.scrollTop = chatBox.scrollHeight;
      messageInput.value = '';
    }
  }