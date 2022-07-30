require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

const TOKEN = process.env.BOT_TOKEN
const USER_ID = process.env.USER_ID
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID
const TEXT_CHANNEL_ID = process.env.TEXT_CHANNEL_ID
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]})

var inside = false
var insideHour = null
var register = []

function loginBot() {
  client.login(TOKEN);
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function registerEnter() {
  inside = true
  insideHour = new Date()
}

function registerExit(textChannelId) {
  inside = false
  const aux = new Date()
  const timeInside = aux.getTime() - insideHour.getTime()
  register = [...register, timeInside]
  insideHour = null
  sendMessageToTextChannel(textChannelId)
}

function sendMessageToTextChannel(textChannelId) {
  const textChannel = client.channels.cache.get(textChannelId)
  const currentUser = client.users.cache.get(USER_ID).username

  textChannel.send(currentUser + ' ha estado ' + millisToMinutesAndSeconds(register[register.length-1]) + " en Salitos time")
  register = []
}

function userHasSwitchedToChannel() {
  return oldState.channelId != null && newState.channelId != null && newState.channelId != oldState.channelId && newState.channelId === VOICE_CHANNEL_ID
}

function userHasSwitchedFromChannel() {
  return oldState.channelId != null && newState.channelId != null && newState.channelId != oldState.channelId && oldState.channelId === VOICE_CHANNEL_ID
}

function userJoinedChannel() {
  return oldState.channelId === null && newState.channelId === VOICE_CHANNEL_ID
}

function userLeftChannel() {
  return newState.channelId === null && oldState.channelId === VOICE_CHANNEL_ID
}

function isNotCorrespondingUser() {
  oldState.member.id !== USER_ID || newState.member.id !== USER_ID
}

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (isNotCorrespondingUser()) {
    return
  }

  if (userHasSwitchedToChannel()) {
    registerEnter()
    console.log('User switched to channel!')
  }

  if (userHasSwitchedFromChannel()) {
    registerExit(TEXT_CHANNEL_ID)
    console.log('User switched from channel!')
  }

  if (userJoinedChannel()) {
    registerEnter()
    console.log('User joined channel!')
  }

  if (userLeftChannel()) {
    registerExit(TEXT_CHANNEL_ID)
    console.log('User left channel!')
  }

});

loginBot()

exports.client = client