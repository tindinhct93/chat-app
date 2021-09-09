const peer = new Peer(''+Math.floor(Math.random()*2**18).toString(36).padStart(4,0), {
    host: 'bungbung83.xyz',
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

peer.on('open', function () {
    window.caststatus.textContent = `ID của nick chat trên server là: ${peer.id}`;
});