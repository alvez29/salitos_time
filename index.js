require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();

const TOKEN = process.env.BOT_TOKEN;
var inside = false
var insideHour = null
var userId = process.env.USER_ID
var voiceChannelId = process.env.VOICE_CHANNEL_ID
var textChannelId = process.env.TEXT_CHANNEL_ID
var currentUser = ''
var register = []


function loginBot(){
  bot.login(TOKEN);
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

loginBot()

bot.on('ready', () => {
    const voiceChannel = bot.channels.valueOf().get(voiceChannelId)
    const textChannel = bot.channels.valueOf().get(textChannelId)
  
    setInterval(function() {
      const currentMembers = voiceChannel.members
      const initialSize = register.length

      if (currentMembers.get(userId) && !inside){
        inside = true
        insideHour = new Date()      
        currentUser = currentMembers.get(userId).user.username

      } else if(!currentMembers.get(userId) && inside) {
        inside = false
        const aux = new Date()
        const timeInside = aux.getTime() - insideHour.getTime()
        register = [...register, timeInside]
        insideHour = null
      }

      if (register.length != initialSize) {
        textChannel.send(currentUser + ' ha estado ' + millisToMinutesAndSeconds(register[register.length-1]) + " en Salitos time")
        register = []
        currentUser = ''
      }

    }, 1000);

});



exports.client = bot
exports.loginBot = loginBot
