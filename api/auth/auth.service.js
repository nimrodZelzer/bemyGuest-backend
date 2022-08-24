
const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')


async function login(username, password) {
    logger.debug(`auth.service - login with username: ${username}`)
    const user = await userService.getByUsername(username)
    console.log(user);

    if (!user) return Promise.reject('Invalid username or password')
    console.log(password);
    console.log(user.password);
    // const match = await bcrypt.compare(password, user.password)
    const match=password===user.password
    // console.log(match);

    if (!match) return Promise.reject('Invalid username or password')
    delete user.password
    return user
}

async function signup(username, password, fullname, email) {
    const saltRounds = 10

    logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}, email: ${email}`)
    if (!username || !password || !fullname || !email) return Promise.reject('fullname, username, email and password are required!')

    const hash = await bcrypt.hash(password, saltRounds)
    return userService.add({ username, password: hash, fullname, email })
}

module.exports = {
    signup,
    login,
}