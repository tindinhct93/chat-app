const generateMessage = (text,user= null) => {
    let username = (user== null) ? null : user;
    return {
        text,
        createdAt: new Date().getTime(),
        user: username
    }
}

module.exports = {
    generateMessage
}