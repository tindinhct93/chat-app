const peer = new Peer($username.innerHTML, {
    host: 'bungbung.herokuapp.com',
    debug: 1,
    path: '/myapp',
    secure: true,
    config: { iceServers: [{
            urls: [ "stun:ss-turn1.xirsys.com" ]
        }, {
            username: "xRdJVCF9omHEucRIJIIjCoGJWoS0oj_vaT2noISPB8g5Wi5y9DbAcSGKQlZjeh6DAAAAAGEbz7h0aW5kaW5oY3Q5Mw==",
            credential: "42c2ec0a-ff6c-11eb-bc45-0242ac140004",
            urls: [
                "turn:ss-turn1.xirsys.com:80?transport=udp",
                "turn:ss-turn1.xirsys.com:3478?transport=udp",
                "turn:ss-turn1.xirsys.com:80?transport=tcp",
                "turn:ss-turn1.xirsys.com:3478?transport=tcp",
                "turns:ss-turn1.xirsys.com:443?transport=tcp",
                "turns:ss-turn1.xirsys.com:5349?transport=tcp"
            ]
        }]}
});

navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream=>window.localStream= stream);
window.peer = peer;
$('#my-video').prop('src', URL.createObjectURL(window.localStream));

peer.on('open', function () {
    window.caststatus.textContent = `Peer ID in the server is": ${peer.id}`;
});

const callBtn = document.querySelector('.call-btn');
const audioContainer = document.querySelector('.call-container');
const hangUpBtn = document.querySelector('.hangup-btn');

let conn;
let call;

function showConnectedContent() {
    window.caststatus.textContent = `You're connected`;
    callBtn.hidden = true;
    audioContainer.hidden = false;
}

function showCallContent() {
    window.caststatus.textContent = `Your device ID is: ${peer.id}`;
    callBtn.hidden = false;
    audioContainer.hidden = true;
}

function showAdminStatus (status) {
    if (String(status).toLowerCase() == "true") {
        document.getElementById('AdminStatus').innerHTML = "Admin is joined";
        callBtn.hidden = false;
    } else {
        document.getElementById('AdminStatus').innerHTML = "Admin is offline";
        callBtn.hidden = true;
    }
}

callBtn.addEventListener('click', function(){
    code = prompt("Please enter your parner id");
    conn = peer.connect(code);
    setTimeout(()=>{
        call = peer.call(code, window.localStream);
        call.on('stream', function(stream) { // B
            window.remoteVideo.srcObject = stream; // C
            window.remoteVideo.autoplay = true; // D
            window.remoteVideo.addEventListener('loadedmetadata', () => { // Play the video as it loads
                window.remoteVideo.play()
            })
            showConnectedContent(); //F
        });
        console.log('Ok')
    },2000);
})

hangUpBtn.addEventListener('click', function (){
    call.close();
    conn.close();
    showCallContent();
})

peer.on('call', function(call) {
    window.caststatus.textContent = `Calling`;
    call.answer(window.localStream); // A;
    window.localVideo.srcObject = window.localStream; // C
    window.localVideo.autoplay = true; // D
    window.localVideo.addEventListener('loadedmetadata', () => { // Play the video as it loads
        window.localVideo.play()
    })
});

peer.on('error', err => console.error(err));