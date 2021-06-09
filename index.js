//?IMPORT PACKAGE
const TeleBot = require('telebot');
const gTTS = require('gtts');
const fs = require('fs');
const axios = require('axios');
//!BOT SETTINGS
const bot = new TeleBot(process.env.token);

//*SLEEP

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//*CHECKS

const checkAdmin = async (chatId, userId) => {
    var isAdmin = false;
    JSON.parse(JSON.stringify(await bot.getChatAdministrators(chatId))).forEach(element => {
        if(element.user.id == userId) {
            isAdmin = true
        }
    })
    return isAdmin;
}

const checkPermission = async (chatId, userId) => {
    var isRestrict = false;
    JSON.parse(JSON.stringify(await bot.getChatAdministrators(chatId))).forEach(element => {
        if(element.user.id == userId) {
            if(element.status == 'creator' || element.can_restrict_members == true) {
                isRestrict = true
            }
        }
    })
    return isRestrict;
}

//!SLAP
const slapList = (selfUsername, targetUsername) => {
    const list = [`${selfUsername}, ${targetUsername} üzerine tüplü TV fırlattı`, `${selfUsername}, ${targetUsername}'ye osmanlı tokadı attı!`,
`${selfUsername}, ${targetUsername} üzerine benzin döktü ve ateşe verdi!`, `${selfUsername}, ${targetUsername} üzerine iPhone3GS fırlattı!`,
`${selfUsername}, ${targetUsername}'nin RTX 2080Ti'sini kırdı!`,`${selfUsername}, ${targetUsername}'nin kalbini kırdı!`, 
`${selfUsername}, ${targetUsername} üzerine kahve döktü!`, `${selfUsername}, ${targetUsername}'nin yüzüne pasta fırlattı!`,
`${selfUsername}, ${targetUsername} için aldığı hediyeyi parçaladı!`]
    return list[Math.floor(Math.random() * list.length)]
}

//!WEATHER
bot.on(/^\/hava (.+)$/, (msg, reg) => 
{ 
    axios.get(`http://wttr.in/${reg.match[1].toUpperCase()}?qmT0`, {
        headers: {
            'User-Agent':'curl/7.63',
            'Accept-Language':'tr'
        }
    })
    .then(function (response) {
        response.data.search('404 BILINMEYEN KONUM') == -1 ? 
            bot.sendMessage(msg.chat.id, '<pre>'+ response.data +'</pre>', {parseMode:'html'}) :
                bot.sendMessage(msg.chat.id, '<pre>Kullanım: /hava {şehir | ilçe adı}</pre>', {parseMode:'html'})
    })
    .catch(function (err) {
        bot.sendMessage(msg.chat.id, '<pre>Kullanım: /hava {şehir | ilçe adı}</pre>', {parseMode:'html'})
    })
})

//!SLAP
bot.on(/^\/saplak (.+)$/, (msg, reg) => 
{
    if(reg.match[1].search('@') == -1) {
        return bot.sendMessage(msg.chat.id, slapList('@' + msg.from.username, '@' + reg.match[1]));
    }else {
        return bot.sendMessage(msg.chat.id, slapList('@' + msg.from.username, reg.match[1]));
    }
})

//!CALCULATOR
bot.on(/^\/hesapla (.+)$/, (msg, reg) => 
{
    try {
        return bot.sendMessage(msg.chat.id, `<pre> Sonuç: ${eval(reg.match[1])} </pre>`, {parseMode: 'html'});
    } catch(err) {
        return bot.sendMessage(msg.chat.id, '<pre> Kullanım: /hesapla 1+1 </pre>', {parseMode: 'html'});
    }
})

//!TEXT TO SOUND
bot.on(/^\/ses (.+)$/, async (msg, reg) => 
{
    var random = Math.floor(Math.random() * 100000) + '.mp3'
    var gtts = new gTTS(reg.match[1], 'tr');
    gtts.save(random);
    await sleep(1000);
    bot.sendVoice(msg.chat.id, random, {replyToMessage: msg.message_id});
    return fs.unlinkSync(random);
})

//!KICKME
bot.on('/beniat', async msg => 
{
    if (await checkAdmin(msg.chat.id, msg.from.id) == false) {
        bot.kickChatMember(msg.chat.id, msg.from.id).
        then(data => {
            bot.sendMessage(msg.chat.id, 'Bencede çık dışarı.', {replyToMessage: msg.message_id});
            return bot.unbanChatMember(msg.chat.id, msg.from.id);
        })
        .catch(err => {
            return bot.sendMessage(msg.chat.id, 'Yönetici izinlerine sahip olmadığımdan veya başka bir sorun oluştuğundan dolayı bu işlemi yapamıyorum.', {replyToMessage: msg.message_id});
        })
    } else {
        return bot.sendMessage(msg.chat.id, 'Yönetici olduğundan dolayı seni atamadım, çok çıkmak istiyorsan kendin çıkabilirsin.', {replyToMessage: msg.message_id});
    }
})

//!BAN SYSTEM
bot.on(/^\/engelle (.+)$/, async (msg, reg) => 
{
    if(msg.reply_to_message) {
        if (await checkPermission(msg.chat.id, msg.from.id) == true) {
            bot.kickChatMember(msg.chat.id, msg.reply_to_message.from.id).
            then(data => {
                return bot.sendMessage(msg.chat.id, `İşte birisi daha haklandı! \n<a href="https://t.me/${msg.reply_to_message.from.username}">${msg.reply_to_message.from.username}</a> yasaklandı. \nSebep: ${reg.match[1]}`, {replyToMessage: msg.message_id, parseMode: 'html'});
            })
            .catch(err => {
                return bot.sendMessage(msg.chat.id, 'Yönetici izinlerine sahip olmadığımdan veya başka bir sorun oluştuğundan dolayı bu işlemi yapamıyorum.', {replyToMessage: msg.message_id});
            })
        } else {
            return bot.sendMessage(msg.chat.id, 'Bu komutu sadece yöneticiler çalıştırabilir!', {replyToMessage: msg.message_id});
        }
    }else {
        return bot.sendMessage(msg.chat.id, 'Kimden bahsettiğin hakkında bir fikrim yok, bir kullanıcı belirtmek durumundasın!', {replyToMessage: msg.message_id})
    }
})

bot.on('/ekaldir', async (msg, reg) => 
{
    if(msg.reply_to_message) {
        if (await checkPermission(msg.chat.id, msg.from.id) == true) {
            bot.unbanChatMember(msg.chat.id, msg.reply_to_message.from.id).
            then(data => {
                return bot.sendMessage(msg.chat.id, `Pekâlâ, tekrar katılabilirler.`, {replyToMessage: msg.message_id});
            })
            .catch(err => {
                return bot.sendMessage(msg.chat.id, 'Yönetici izinlerine sahip olmadığımdan veya başka bir sorun oluştuğundan dolayı bu işlemi yapamıyorum.', {replyToMessage: msg.message_id});
            })
        } else {
            return bot.sendMessage(msg.chat.id, 'Bu komutu sadece yöneticiler çalıştırabilir!', {replyToMessage: msg.message_id});
        }
    }else {
        return bot.sendMessage(msg.chat.id, 'Kimden bahsettiğin hakkında bir fikrim yok, bir kullanıcı belirtmek durumundasın!', {replyToMessage: msg.message_id})
    }
})

//!REPEAT ME
bot.on(/^\/tekrarla (.+)$/, (msg, reg) => {
    return bot.sendMessage(msg.chat.id, reg.match[1], {replyToMessage: msg.message_id})
})

//!DELETE MESSAGE
bot.on('/sil', async (msg, reg) => 
{
    if(msg.reply_to_message) {
        if (await checkAdmin(msg.chat.id, msg.from.id) == true) {
            return bot.deleteMessage(msg.chat.id, msg.reply_to_message.message_id).catch(err => {
                return bot.sendMessage(msg.chat.id, 'Yönetici izinlerine sahip olmadığımdan veya başka bir sorun oluştuğundan dolayı bu işlemi yapamıyorum.', {replyToMessage: msg.message_id});
            })
        } else {
            return bot.sendMessage(msg.chat.id, 'Bu komutu sadece yöneticiler çalıştırabilir!.', {replyToMessage: msg.message_id});
        }
    }else {
        return bot.sendMessage(msg.chat.id, 'Neyden bahsettiğin hakkında bir fikrim yok, bir mesaj yanıtlamak durumundasın!', {replyToMessage: msg.message_id})
    }
})

//!AUTHOR
bot.on('/author', msg => 
{
    fs.readFile('logo.txt', (err, data) => {
        return bot.sendMessage(msg.chat.id, `<pre> ${data.toString('utf8')} </pre> <a href ="t.me/xleongod">Telegram adresim</a>`, {parseMode: 'html'}).catch(err => console.log(err))
    })
})

bot.on(/^\/sustur (.+)$/, async (msg, reg) => 
{
    var date = '';
    if (await checkAdmin(msg.chat.id, msg.reply_to_message.from.id) == false) {
        if(msg.reply_to_message) {
            if (await checkPermission(msg.chat.id, msg.from.id) == true) {
                if(reg.match[1].search('gun') != -1) {
                    date = eval(reg.match[1].replace(/\D/g, '') * 86400);
                }else if(reg.match[1].search('saat') != -1) {
                    date = eval(reg.match[1].replace(/\D/g, '') * 3600);
                }else if(reg.match[1].search('dakika') != -1) {
                    date = eval(reg.match[1].replace(/\D/g, '') * 60);
                }
                bot.restrictChatMember(msg.chat.id, msg.reply_to_message.from.id, {untilDate: new Date().getTime()/1000+date, canSendMessages: false, canSendMediaMessages: false, canSendOtherMessages: false, canAddWebPagePreviews: false}).
                then(data => {
                    return bot.sendMessage(msg.chat.id, `Şşşt... şimdi sessiz ol. \n<a href="https://t.me/${msg.reply_to_message.from.username}">${msg.reply_to_message.from.username}</a> sessize alındı.`, {replyToMessage: msg.message_id, parseMode: 'html'});
                })
                .catch(err => {
                    return bot.sendMessage(msg.chat.id, 'Yönetici izinlerine sahip olmadığımdan veya başka bir sorun oluştuğundan dolayı bu işlemi yapamıyorum.', {replyToMessage: msg.message_id});
                })
            } else {
                return bot.sendMessage(msg.chat.id, 'Bu komutu sadece yöneticiler çalıştırabilir!', {replyToMessage: msg.message_id});
            }
        }else {
            return bot.sendMessage(msg.chat.id, 'Kimden bahsettiğin hakkında bir fikrim yok, bir kullanıcı belirtmek durumundasın!', {replyToMessage: msg.message_id})
        }
    }else {
        return bot.sendMessage(msg.chat.id, 'Imm, bir yöneticinin susturulmasında rol oynamamayı tercih ederim. Teklif için teşekkürler ama normal kullanıcıları susturmakla yetineceğim.', {replyToMessage: msg.message_id});
    }
})
bot.on('/skaldir', async msg => 
{
    if(msg.reply_to_message) {
        if (await checkPermission(msg.chat.id, msg.from.id) == true) {
            bot.restrictChatMember(msg.chat.id, msg.reply_to_message.from.id, {untilDate: 0,  canSendMessages: true, canSendMediaMessages: true, canSendOtherMessages: true, canAddWebPagePreviews: true}).
            then(data => {
                return bot.sendMessage(msg.chat.id, `Güzel, <a href="https://t.me/${msg.reply_to_message.from.username}">${msg.reply_to_message.from.username}</a> tekrardan konuşabilir.`, {replyToMessage: msg.message_id, parseMode: 'html'});
            })
            .catch(err => {
                return bot.sendMessage(msg.chat.id, 'Yönetici izinlerine sahip olmadığımdan veya başka bir sorun oluştuğundan dolayı bu işlemi yapamıyorum.', {replyToMessage: msg.message_id});
            })
        } else {
            return bot.sendMessage(msg.chat.id, 'Bu komutu sadece yöneticiler çalıştırabilir!', {replyToMessage: msg.message_id});
        }
    }else {
        return bot.sendMessage(msg.chat.id, 'Kimden bahsettiğin hakkında bir fikrim yok, bir kullanıcı belirtmek durumundasın!', {replyToMessage: msg.message_id})
    }
})

//*START BOT

bot.start();