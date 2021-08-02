const socket = io()

function calcVH() {
    $('.chat').innerHeight( $(this).innerHeight() );
}
$(window).on('load resize orientationchange', function() {
    calcVH();
});

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');
const $users = document.querySelector('#users');

gotoBottom('messages');
socket.on('join', (room)=>{
    console.log(room);
    //Tạo ra 1 chuỗi html có id là message.
    room = JSON.parse(room);
    let htmlString = '';
    room.forEach(user=>{htmlString += createHTMLUser(user)})
    $users.innerHTML = htmlString
})

socket.on('left', (room)=>{
    console.log(room);
    //Tạo ra 1 chuỗi html có id là message.
    room = JSON.parse(room);
    let htmlString = '';
    room.forEach(user=>{htmlString += createHTMLUser(user)})
    $users.innerHTML = htmlString;
})

socket.on('message', (message)=>{
    console.log(message);
    const html = createHTMLMesssage(message)
    $messages.insertAdjacentHTML('beforeend',html);
    gotoBottom('messages');
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    if( $messageFormInput.value == '') {
        return;
    }
    $messageFormButton.setAttribute('disabled','disabled ');
    const message = e.target.elements.message.value;
    socket.emit('sendMessage',message, (err)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (err) {
            return console.log(err)
        }
        console.log('Message dilivered');
        gotoBottom('messages');
    })
})

/*
$sendLocationButton.addEventListener('click',()=>{
    if (!navigator.geolocation) {
        return alert("Can't get logcation")
    }

    $sendLocationButton.setAttribute('disabled','disabled ');

    navigator.geolocation.getCurrentPosition((pos)=>{
        socket.emit('sendLocation',{
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        }, ()=> {setTimeout(()=>{
                $sendLocationButton.removeAttribute('disabled');
                console.log("Location shared")
            },2000)}
        )
    })
})
 */


function createHTMLMesssage (res) {
    let time = new Date(res.createdAt)
    return `<div class="message">
            <p>
                <span class="message__name">${res.user}</span>
                <span class="message__meta">${moment(time).format("hh:mm a")}</span>
            </p>
            <p  class="message">${res.text}</p>
        </div>`
}

function createHTMLUser (user) {
    return `<li class="${user}">${user}</li>`
}

function gotoBottom(id){
    var element = document.getElementById(id);
    element.scrollTop = element.scrollHeight - element.clientHeight;
}