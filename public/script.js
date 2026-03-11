// התחברות לשרת הסוקט בפורט הנוכחי
const socket = io();

// אם השרת והלקוח בפרויקטים אחרים
// const socket = io.connect("http://localhost:8000");

const profileSection = document.getElementById('profileSection');
const chatSection = document.getElementById('chatSection');
const activeClientsText = document.getElementById('activeClientsText');
const profileForm = document.getElementById('profileForm');
const profileStatus = document.getElementById('profileStatus');
const usernameInput = document.getElementById('username');
const colorInput = document.getElementById('color');
const currentUserText = document.getElementById('currentUserText');
const disconnectBtn = document.getElementById('disconnectBtn');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

let currentUsername = '';
let currentColor = '#7c3aed';
let currentUserId = null;
let profileSaved = false;

const showChatScreen = () => {
    profileSection.classList.add('hidden');
    chatSection.classList.remove('hidden');
    currentUserText.textContent = `מחוברת בתור: ${currentUsername || 'unknown'}`;
    currentUserText.style.color = currentColor;
    input.focus();
};

profileForm.addEventListener('submit', (event) => {
    event.preventDefault();

    currentUsername = usernameInput.value.trim();
    currentColor = colorInput.value || '#000000';
    profileSaved = true;

    socket.emit('update client profile', {
        username: currentUsername,
        color: currentColor,
    });

    profileStatus.textContent = `נשמר בהצלחה. תיכף נכנסת לצ׳אט כ־${currentUsername || 'unknown'}.`;
    showChatScreen();
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
    form.querySelector('button').disabled = true;
    currentUserText.textContent = 'התנתקת. כדי להתחבר מחדש צריך לרענן את הדף.';
    currentUserText.style.color = '#b91c1c';
});

// Listen for incoming messages
socket.on('user connected', ({ userId }) => {
    currentUserId = userId;
    if (profileSaved) {
        currentUserText.textContent = `מחוברת בתור: ${currentUsername || 'unknown'} (user ${currentUserId})`;
        currentUserText.style.color = currentColor;
    }
});

socket.on('active clients updated', ({ count }) => {
    activeClientsText.textContent = `יש ${count} לקוחות פעילים כרגע`;
});

socket.on('send message', msgFromServer => {
    const item = document.createElement('li');
    const userSpan = document.createElement('span');
    userSpan.className = 'message-user';
    userSpan.textContent = msgFromServer.username;
    item.append(userSpan, `: ${msgFromServer.msg}`);
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