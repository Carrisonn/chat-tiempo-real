import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js'

const socket = io({
  auth: {
    userName: getUserName(),
    userColor: getRandomColor(),
    serverOffset: 0
  }
})

const $messages = document.querySelector('#messages')
const $input = document.querySelector('#input')
const $form = document.querySelector('#form')
$form.addEventListener('submit', handleSubmit)

// Functions
function getUserName () {
  const userLogged = localStorage.getItem('userName')
  if (userLogged) return userLogged

  const userName = prompt('¿Como te quieres identificar?')
  const invalidName = userName === null || userName.trim() === '' || Number(userName)
  if (invalidName) {
    alert('Debes introducir un nombre válido')
    window.location.reload()
    return
  }

  localStorage.setItem('userName', userName)
  return userName
}

function getRandomColor () {
  const colors = ['#90c6f1ff', '#c7acf1ff', '#bfeeb4ff', '#ec9b9bff', '#e0a8ebff', '#f3e7a6ff']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  return randomColor
}

function handleSubmit (event) {
  event.preventDefault()

  const inputValue = $input.value.trim()
  if (inputValue !== '') {
    socket.emit('message', $input.value)
    $input.value = ''
  }
}

// Socket Events
socket.on('connection', userName => {
  const $userConnected = document.createElement('p')
  $userConnected.classList.add('user-state')
  $userConnected.textContent = `${userName} se ha conectado`
  $messages.append($userConnected)
})

socket.on('disconnection', userName => {
  const $userDesconnected = document.createElement('p')
  $userDesconnected.classList.add('user-state')
  $userDesconnected.textContent = `${userName} salió del chat`
  $messages.append($userDesconnected)
})

socket.on('message', userInfo => {
  const { user, userColor, lastRowId, messageTime, message } = userInfo

  const $listMessage = document.createElement('li')
  $listMessage.style.backgroundColor = userColor
  $listMessage.classList.add('list-message')

  const $infoMessage = document.createElement('div')
  $infoMessage.classList.add('info-message')

  const $message = document.createElement('p')
  $message.classList.add('message')
  $message.textContent = message

  const $user = document.createElement('p')
  $user.classList.add('message-detail')
  $user.textContent = user

  const $messageTime = document.createElement('p')
  $messageTime.classList.add('message-detail')
  $messageTime.textContent = messageTime

  $infoMessage.append($user, $messageTime)
  $listMessage.append($message, $infoMessage)
  $messages.append($listMessage)

  $messages.scrollTop = $messages.scrollHeight
  socket.auth.serverOffset = lastRowId
})
