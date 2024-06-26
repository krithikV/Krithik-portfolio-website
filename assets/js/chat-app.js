var cityName;
async function getCityName() {
    try {
      const response = await fetch('https://ipinfo.io/json');
      const data = await response.json();
      return data.city;
    } catch (error) {
      console.error('Error fetching IP information:', error);
      return null;
    }
  }
  
  window.onload = async function() {
    const cityName = await getCityName();
    if (cityName) {
      console.log('City:', cityName);
    } else {
      console.log('City name could not be fetched.');
    }
  }

function getMachineId() {
    
    let machineId = localStorage.getItem('MachineId');
    
    if (!machineId) {
        machineId = crypto.randomUUID();
        localStorage.setItem('MachineId', machineId);
    }

    return machineId;
}


function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
function cookieExists(name) {
    var cookies = document.cookie.split(';');
    for(var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf(name + '=') === 0) {
            return true; // Cookie with the given name exists
        }
    }
    return false; // Cookie with the given name does not exist
}


class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        }

        this.state = false;
        this.messages = [];
    }
    

    display() {
        const {openButton, chatBox, sendButton} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
        if(this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    async onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        document.querySelector('.send__button').disabled = true;
        textField.disabled = true;

        if (text1 === "") {
            return;
        }
        if(cookieExists('session_id')){
            var session_id = getCookie('session_id')
            console.log("Old session")
        }
        else{
            var session_id = getMachineId()
            setCookie('session_id',session_id,1)
            console.log("New Session")
        }
        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);
        
        fetch('https://krithikmyava.pythonanywhere.com/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 , session_id: session_id,city:await getCityName()}),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "Sam", message: r.answer };
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''

        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
          });
    }

    updateChatText(chatbox) {
        var html = '';

        
        
        this.messages.slice().reverse().forEach(function(item, index) {
            if (item.name === "Sam")
            {
                var chat_msg = String(item.message)
                console.log(chat_msg)
                if (chat_msg.includes("Krithik:")) {
                    console.log("Krithik")
                    chat_msg = item.message.split("Krithik:")[1];
                }
                if (chat_msg.includes("note:")) {
                    chat_msg = item.message.split("note:")[0];
                }
                if (chat_msg.includes("Note:")) {
                    chat_msg = item.message.split("Note:")[0];
                }
                if (chat_msg.includes("Reminder:")){
                    chat_msg = item.message.split("Note:")[0];
                }
                if (chat_msg.includes("reminder:")){
                    chat_msg = item.message.split("Note:")[0];
                }
                console.log(chat_msg)
                html += '<div class="messages__item messages__item--visitor">' + chat_msg + '</div>'
            }
            else
            {
             
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
          });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
        chatbox.querySelector('input').disabled = false;
        document.querySelector('.send__button').disabled = false;

    }
}


const chatbox = new Chatbox();
chatbox.display();
