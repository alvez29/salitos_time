require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

const TOKEN = process.env.BOT_TOKEN
const USER_ID = process.env.USER_ID
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID
const TEXT_CHANNEL_ID = process.env.TEXT_CHANNEL_ID
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]})

var isInside = false
var enterHour = null
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
  isInside = true
  enterHour = new Date()
}

function registerExit(textChannelId) {
  isInside = false
  const now = new Date()
  const timeInside = now.getTime() - enterHour.getTime()
  register = [...register, timeInside]
  enterHour = null
  sendMessageToTextChannel(textChannelId)
}

function sendMessageToTextChannel(textChannelId) {
  const textChannel = client.channels.cache.get(textChannelId)
  const currentUser = client.users.cache.get(USER_ID).username

  textChannel.send(currentUser + ' ha estado ' + millisToMinutesAndSeconds(register[register.length-1]) + " en Salitos time")
  register = []
}

function userHasSwitchedToChannel(oldState, newState) {
  return oldState.channelId != null && newState.channelId != null && newState.channelId != oldState.channelId && newState.channelId === VOICE_CHANNEL_ID
}

function userHasSwitchedFromChannel(oldState, newState) {
  return oldState.channelId != null && newState.channelId != null && newState.channelId != oldState.channelId && oldState.channelId === VOICE_CHANNEL_ID
}

function userJoinedChannel(oldState, newState) {
  return oldState.channelId === null && newState.channelId === VOICE_CHANNEL_ID
}

function userLeftChannel(oldState, newState) {
  return newState.channelId === null && oldState.channelId === VOICE_CHANNEL_ID
}

function isNotCorrespondingUser(oldState, newState) {
  oldState.member.id !== USER_ID || newState.member.id !== USER_ID
}

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (isNotCorrespondingUser(oldState, newState)) {
    return
  }

  if (userHasSwitchedToChannel(oldState, newState)) {
    registerEnter()
    console.log('User switched to channel!')
  }

  if (userHasSwitchedFromChannel(oldState, newState)) {
    registerExit(TEXT_CHANNEL_ID)
    console.log('User switched from channel!')
  }

  if (userJoinedChannel(oldState, newState)) {
    registerEnter()
    console.log('User joined channel!')
  }

  if (userLeftChannel(oldState, newState)) {
    registerExit(TEXT_CHANNEL_ID)
    console.log('User left channel!')
  }

});

loginBot()

exports.client = client