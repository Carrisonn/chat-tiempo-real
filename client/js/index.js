import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js'

const socket = io({
  auth: {
    userName: getUserName(),
    serverOffset: 0,
  }
})

const $numberOfUsers = document.querySelector('#number-of-users')
const $messages = document.querySelector('#messages')
const $input = document.querySelector('#input')
const $form = document.querySelector('#form')
$form.addEventListener('submit', handleSubmit)

if (Notification.permission !== "granted") Notification.requestPermission()

// Functions
function getUserName() {
  const userLogged = localStorage.getItem('userName')
  if (userLogged) return userLogged

  const userName = prompt('¿Como te quieres identificar?')
  const isInvalidName = userName === null || userName.trim() === '' || Number(userName) || userName === undefined
  if (isInvalidName) {
    alert('Debes introducir un nombre válido')
    window.location.reload()
    return
  }

  const nameFormatted = formatName(userName)
  localStorage.setItem('userName', nameFormatted)
  return nameFormatted
}

function handleSubmit(event) {
  event.preventDefault()

  const inputValue = $input.value.trim()
  if (inputValue !== '') {
    socket.emit('message', inputValue)
    $input.value = ''
  }
}

function formatName(name) {
  return name.replace(/^\w/, char => char.toUpperCase())
}

// Socket Events
socket.on('connection', (userName, usersConnected) => {
  const $userConnected = document.createElement('p')
  $userConnected.classList.add('user-state')
  $userConnected.textContent = `${userName} se ha conectado`
  $numberOfUsers.textContent = usersConnected
  $messages.append($userConnected)
  $messages.scrollTop = $messages.scrollHeight
})

socket.on('disconnection', (userName, usersConnected) => {
  const $userDesconnected = document.createElement('p')
  $userDesconnected.classList.add('user-state')
  $userDesconnected.textContent = `${userName} salió del chat`
  $numberOfUsers.textContent = usersConnected
  $messages.append($userDesconnected)
  $messages.scrollTop = $messages.scrollHeight
})

socket.on('message', userInfo => {
  const { user, userColor, lastRowId, messageTime, messageDate, message } = userInfo

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

  const $messageDetails = document.createElement('p')
  $messageDetails.classList.add('message-detail')
  $messageDetails.textContent = `${messageTime} - ${messageDate}`

  $infoMessage.append($user, $messageDetails)
  $listMessage.append($message, $infoMessage)
  $messages.append($listMessage)

  if (Notification.permission === "granted") new Notification(`${user}`, { body: message, })
  $messages.scrollTop = $messages.scrollHeight
  socket.auth.serverOffset = lastRowId
})
