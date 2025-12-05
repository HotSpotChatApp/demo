const socket = io();

// DOM elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startBtn = document.getElementById('startBtn');
const skipBtn = document.getElementById('skipBtn');
const stopBtn = document.getElementById('stopBtn');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const status = document.getElementById('status');

// WebRTC variables
let localStream;
let peerConnection;
let currentPartner = null;

// ICE servers configuration
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Button event listeners
startBtn.addEventListener('click', startChat);
skipBtn.addEventListener('click', skipPartner);
stopBtn.addEventListener('click', stopChat);
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Socket event listeners
socket.on('waiting', () => {
    updateStatus('Looking for a stranger...');
});

socket.on('partner-found', async (data) => {
    currentPartner = data.partner;
    updateStatus('Connected! Say hi!');
    addSystemMessage('Stranger connected');
    
    skipBtn.disabled = false;
    messageInput.disabled = false;
    sendBtn.disabled = false;
    
    // Create peer connection
    await createPeerConnection(data.initiator);
});

socket.on('signal', async (data) => {
    if (!peerConnection) return;
    
    try {
        if (data.signal.type === 'offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('signal', { signal: answer });
        } else if (data.signal.type === 'answer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal));
        } else if (data.signal.candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.signal));
        }
    } catch (error) {
        console.error('Error handling signal:', error);
    }
});

socket.on('chat-message', (message) => {
    addMessage(message, 'received');
});

socket.on('partner-disconnected', () => {
    updateStatus('Stranger disconnected');
    addSystemMessage('Stranger disconnected');
    cleanupConnection();
    skipBtn.disabled = true;
    messageInput.disabled = true;
    sendBtn.disabled = true;
});

// Start chat function
async function startChat() {
    try {
        // Get user media
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        localVideo.srcObject = localStream;
        
        // Update UI
        startBtn.disabled = true;
        stopBtn.disabled = false;
        updateStatus('Starting...');
        
        // Request partner
        socket.emit('find-partner');
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Could not access camera/microphone. Please check permissions.');
    }
}

// Create peer connection
async function createPeerConnection(isInitiator) {
    peerConnection = new RTCPeerConnection(configuration);
    
    // Add local stream tracks to peer connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
    
    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('signal', { signal: event.candidate });
        }
    };
    
    // Handle connection state
    peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
            updateStatus('Connected with stranger');
        }
    };
    
    // If initiator, create and send offer
    if (isInitiator) {
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('signal', { signal: offer });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }
}

// Skip to next partner
function skipPartner() {
    socket.emit('skip');
    addSystemMessage('Looking for next stranger...');
    cleanupConnection();
    skipBtn.disabled = true;
    messageInput.disabled = true;
    sendBtn.disabled = true;
    
    // Find new partner
    setTimeout(() => {
        socket.emit('find-partner');
    }, 500);
}

// Stop chat
function stopChat() {
    if (currentPartner) {
        socket.emit('skip');
    }
    
    cleanupConnection();
    
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    localVideo.srcObject = null;
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
    skipBtn.disabled = true;
    messageInput.disabled = true;
    sendBtn.disabled = true;
    
    updateStatus('Click "Start" to begin chatting with a stranger');
    chatMessages.innerHTML = '';
}

// Cleanup connection
function cleanupConnection() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    remoteVideo.srcObject = null;
    currentPartner = null;
}

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    if (message && currentPartner) {
        socket.emit('chat-message', message);
        addMessage(message, 'sent');
        messageInput.value = '';
    }
}

// Add message to chat
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add system message
function addSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Update status
function updateStatus(text) {
    status.textContent = text;
}
