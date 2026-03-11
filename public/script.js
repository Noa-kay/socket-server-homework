// התחברות לשרת הסוקט בפורט הנוכחי
const socket = io();

// אם השרת והלקוח בפרויקטים אחרים
// const socket = io.connect("http://localhost:8000");

const h1 = document.querySelector('h1');
const activeClientsText = document.getElementById('activeClientsText');
const profileForm = document.getElementById('profileForm');
const usernameInput = document.getElementById('username');
const colorInput = document.getElementById('color');
const disconnectBtn = document.getElementById('disconnectBtn');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

let currentUsername = '';
let currentColor = '#000000';

profileForm.addEventListener('submit', (event) => {
    event.preventDefault();

    currentUsername = usernameInput.value.trim();
    currentColor = colorInput.value || '#000000';

    socket.emit('update client profile', {
        username: currentUsername,
        color: currentColor,
    });
});

// Handle form submission
form.addEventListener('submit', e => {
    e.preventDefault();

    const message = input.value.trim();
    if (message) {
        // Emit the message to the server
        socket.emit('new message', message);

        // Clear the input
        input.value = '';
    }
});

disconnectBtn.addEventListener('click', () => {
    socket.disconnect();
    disconnectBtn.disabled = true;
    input.disabled = true;
});

// Listen for incoming messages
socket.on('user connected', ({ userId }) => {
    h1.textContent += ` - user ${userId}`
});

socket.on('active clients updated', ({ count }) => {
    activeClientsText.textContent = `יש ${count} לקוחות פעילים כרגע`;
});

socket.on('send message', msgFromServer => {
    const item = document.createElement('li');
    item.textContent = `new message added by ${msgFromServer.username} (${msgFromServer.by}): ${msgFromServer.msg}`;
    item.style.color = msgFromServer.color || '#000000';
    messages.append(item);

    // Scroll to the bottom
    messages.scrollTop = messages.scrollHeight;
});

socket.on('client disconnected', ({ username, color }) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>לקוח ${username} התנתק מהמערכת</strong>`;
    item.style.color = color || '#000000';
    messages.append(item);
    messages.scrollTop = messages.scrollHeight;
});