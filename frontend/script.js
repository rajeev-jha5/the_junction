const chatBox = document.getElementById('display-box');
    const messageInput = document.getElementById('message-input');


    const ws = new WebSocket('wss://thejunction.shadyether.repl.co');

    ws.onopen = (event) => {
      chatBox.innerHTML += "<p>Connected to the chat!</p>";
    };
    // var username=<%= username %>;
    var username=document.getElementById("username-data").getAttribute("data-value");
    // function setName(){
    //   username=document.getElementById('set_name_input').value;
    //   document.getElementById('set_name_input').disabled=true
    // }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const messageText = message.text;
      const sender = message.sender;

      chatBox.innerHTML += `<p><strong>${sender}: </strong>${messageText}</p>`;
    };

    function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== '') {
      const messageObject = {
        text: message,
        sender: username
      };
      ws.send(JSON.stringify(messageObject));
      chatBox.innerHTML += `<p><strong>${username}: </strong>${message}</p>`;
      messageInput.value = '';
    }
  }