const socket = io()

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Template
const messageTemplate = document.querySelector('#message-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})


socket.on('message', (message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
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
        console.log('Message dilivered')
    })
})

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

socket.emit('join', {username,room})