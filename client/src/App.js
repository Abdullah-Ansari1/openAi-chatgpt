import React, { useState } from 'react'
import axios from 'axios';
import bot from './assets/bot.svg'
import user from './assets/user.svg'
import { UilMessage,UilRobot ,UilArrowDown  } from '@iconscout/react-unicons'
const App = () => {
  const [inputText, setInputText] = useState('');
  const [blockHeader, setBlockHeader] = useState(true);
  const chatContainer = document.querySelector('#chat_container');
  let loadInterval;

  // handleChange input function
  const handleChange = (event) => {
    setInputText(event.target.value);
  }
  // handle when user press enter key in the form
  const handleEnter=(e)=>{
    if (e.keyCode === 13 && inputText.trim().length===0) {
      setInputText('');
      alert("Please enter some text");
    }else if (e.keyCode === 13 && inputText.trim().length!==0) {
      handleSubmit(e)
  }
}

//loader when data is fetching
const loader = (element) => {
  element.textContent = ''

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += '.';

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

//typing effect text function
const typeText = (element, text) => {
  let index = 0

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}


  // generate unique ID for each message div of bot
  // necessary for typing text effect for that specific reply
  // without unique ID, typing text will work on every element
  const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
  }



  const chatStripe = (isAi, value, uniqueId) => {
    return (
      `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
  }


  const handleSubmit = async (event) => {
    event.preventDefault();
    let data = inputText;
if (inputText.trim().length===0) {
  setInputText('');
  alert("Please enter some text");
}else{
  setBlockHeader(false);  
 // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, inputText);
    setInputText('');
    
    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
    
    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // specific message div 
    const messageDiv = document.getElementById(uniqueId)
    
    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    try {
      // Make a POST request to the OpenAI API to generate text
      const response = await axios.post('http://localhost:5000/', {
        prompt: data,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      clearInterval(loadInterval)
      messageDiv.innerHTML = " ";
      const parsedData = response.data.bot.trim() // trims any trailing spaces/'\n' 
      typeText(messageDiv, parsedData);
    } catch (error) {
      console.error(error);
    }
}
  }

  const handleDown=()=>{
    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  return (
    <>
      <div id="app">
      <div className='header'><h1>Codex</h1> <UilRobot size="2rem"/></div>
      {blockHeader&&<div className='block-header'>Ask anything to the Codex....</div>}
        <div id="chat_container"></div>

        <form onSubmit={handleSubmit}>
          <textarea name="prompt" rows="1" cols="1" placeholder="Ask codex..." value={inputText} onChange={handleChange} onKeyDown={(e) => handleEnter(e)}></textarea>
          {/* <button type="submit"><img src={SendImg} alt="send" /></button> */}
          <button type="submit"><UilMessage className="sendbtn"/></button>
        </form>
      </div>
      <div onClick={()=>handleDown()} className={"scrollup show-scroll"}>
      <UilArrowDown className="scrollup__icon" size="1.5rem"/>
    </div>
    </>
  )
}

export default App