const users = []

// method



const addUser = ({id, username, room})=> {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    if (!username || !room) {
        return {
            error: "Username or room must be provided"
        }
    }

    const existUser = users.find(user => {
        return user.room ===  room && user.name === sername
    })

    if (existUser) {
        return {
            error: 'Username has exist in room'
        }
    }

    const user = {room,username,id}
    users.push(user);
    return {user}
}

const removeUser = (id) => {
    const user = users.findIndex(user => user.id ===id);
    if (index !== -1) {
        return users.splice(index,1)[0]
    }
}

const getUser = (id) => {
    return users.find(user => user.id ===id)
}

const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase();
    return users.filter(user => user.room ===room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}