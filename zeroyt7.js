// zeroyt7_full_antilink_v5.js
// ==============================================
// 🚫 B. FITUR: ANTI-LINK
// ==============================================
// Author: generated for Fahri

// ==============================================
// 🔧 A. SETUP & IMPORT MODULES
// ==============================================
const { proto } = require('@whiskeysockets/baileys')
const chalk = require("chalk")
const moment = require("moment-timezone")
// === Auto Load & Save Config Grup ===
const gc = require('./lib/groupConfig') 
// ==============================================
// 🛠️ G. FITUR: ADMIN GRUP
// ==============================================

// === CONFIG ===
const OWNER_JID = "6285692154876@s.whatsapp.net" // ganti dengan nomor kamu
const PREFIX = "."

// untuk menghitung uptime bot
const startTime = Date.now()
function formatRuntime(ms) {
 const sec = Math.floor(ms / 1000)
 const h = Math.floor(sec / 3600)
 const m = Math.floor((sec % 3600) / 60)
 const s = sec % 60
 return `${h} jam ${m} menit ${s} detik`
}

/**
 * Handler utama
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} m
 */
module.exports = async function handleIncoming(sock, m) {
		// === AUTO LOAD CONFIG SETIAP PESAN MASUK ===
const gc = require('./lib/groupConfig') // pastikan sudah ada di atas file
const from = m.key.remoteJid
const isGroup = from?.endsWith('@g.us')

if (isGroup) {
 const confNow = gc.getGroup(from)

 // simpan status fitur aktif (optional, kalau kamu pakai global variable)
 if (confNow.antilink) global.antilinkStatus = { ...(global.antilinkStatus || {}), [from]: true }
 if (confNow.// ==============================================
// 💣 C. FITUR: ANTI-VIRTEX
// ==============================================
antivirtex) global.antivirtexStatus = { ...(global.antivirtexStatus || {}), [from]: true }
 if (confNow.// ==============================================
// 👋 D. FITUR: WELCOME & GOODBYE
// ==============================================
welcome) global.welcomeStatus = { ...(global.welcomeStatus || {}), [from]: true }
 if (confNow.goodbye) global.goodbyeStatus = { ...(global.goodbyeStatus || {}), [from]: true }
}
// === EVENT: WELCOME & GOODBYE TEKS ONLY ===
async function registerGroupEvents(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    try {
      const { id, participants, action } = update
      const groupMetadata = await sock.groupMetadata(id)
      const groupName = groupMetadata.subject
      const membersCount = groupMetadata.participants.length

      for (let user of participants) {
        const username = user.split("@")[0]

        if (action === "add") {
          if (!global.welcomeStatus[id]) return
          const text = `👋 *Welcome @${username}* ke grup *${groupName}*!\nSekarang kita punya ${membersCount} anggota.`
          await sock.sendMessage(id, { text, mentions: [user] })
        } else if (action === "remove") {
          if (!global.goodbyeStatus[id]) return
          const text = `👋 *Selamat tinggal @${username}* dari grup *${groupName}*.\nSekarang kita punya ${membersCount} anggota.`
          await sock.sendMessage(id, { text, mentions: [user] })
        }
      }
    } catch (err) {
      console.error("❌ Error di event group update:", err)
    }
  })
}
  try {
    if (!m.message) return

    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const isGroup = from.endsWith("@g.us")
const isOwner = sender === OWNER_JID

// === Hitung admin grup (buat dipakai di banyak tempat) ===
let groupAdmins = []
let isAdmin = false
let isAdmins = false // beberapa bagian kode memakai isAdmins (plural)

if (isGroup) {
  try {
    const groupMetadataForFlags = await sock.groupMetadata(from)
    groupAdmins = groupMetadataForFlags.participants
      .filter(p => p.admin)
      .map(p => p.id)
    isAdmin = groupAdmins.includes(sender)
    isAdmins = isAdmin
  } catch (err) {
    console.error("Gagal ambil metadata grup (admin flags):", err)
    // biarkan isAdmin/isAdmins = false jika gagal
  }
}

 // === GLOBAL DATA (RAM only) ===
 global.groupRules = {} // Simpan rules per grup
// ==============================================
// 📏 J. RULES & INFORMASI BOT
// ==============================================
 global.antilinkStatus = global.antilinkStatus || {} // { groupJid: true/false }
 global.antilinkWarnings = global.antilinkWarnings || {} // { groupJid: { userJid: count } }
 global.welcomeStatus = global.welcomeStatus || {} // { groupJid: true/false }
global.goodbyeStatus = global.goodbyeStatus || {} // { groupJid: true/false }
 global.antivirtexStatus = global.antivirtexStatus || {} // { groupJid: true/false }
 global.antivirtexWarnings = global.antivirtexWarnings || {} // { groupJid: { userJid: count } }

 // Ambil isi teks
 const type = Object.keys(m.message)[0]
 const text =
 m.message.conversation ||
 m.message.extendedTextMessage?.text ||
 m.message.imageMessage?.caption ||
 m.message.videoMessage?.caption ||
 ""
 if (!text) return
 const body = text.trim()

 // jangan return langsung — kita butuh cek link/virtex di pesan non-command
 const isCommand = body.startsWith(PREFIX)
 const command = isCommand ? body.slice(PREFIX.length).trim().split(" ")[0].toLowerCase() : null
 const args = isCommand ? body.split(" ").slice(1) : []
 const argText = args.join(" ")
 // === Helper reply() universal ===
const reply = async (text) => {
 await sock.sendMessage(from, { text }, { quoted: m })
}

 // -------------------------
 // HELPERS: LINK DETECTION
 // -------------------------
 // medium-level regex: menangkap domain-like dan explicit protocols
 const linkRegex = /((?:https?:\/\/|www\.|t\.me\/|bit\.ly\/|chat\.whatsapp\.com\/|[a-zA-Z0-9-]{2,}\.[a-zA-Z]{2,})(?:\/\S*)?)/i

 function looksLikeLink(text) {
 if (!text || typeof text !== "string") return false
 const clean = text.replace(/\s+/g, " ").trim()
 // cepat cek explicit patterns
 const quickRe = /(?:https?:\/\/|www\.|t\.me\/|chat\.whatsapp\.com\/|bit\.ly\/)/i
 if (quickRe.test(clean)) return true
 // token-like domain
 const tokenRe = /([a-zA-Z0-9-]{2,}\.[a-zA-Z]{2,})(\/\S*)?/g
 let m
 while ((m = tokenRe.exec(clean)) !== null) {
 const domain = m[1].toLowerCase()
 // ignore obvious short tokens
 if (domain.length < 5) continue
 // accept as link
 return true
 }
 return false
 }

// -------------------------
// HELPERS: ANTIVIRTEX DETECTION (REVISED — safer, avoid false positives)
// -------------------------
const ANTIVIRTEX_CONFIG = {
 maxLength: 1500, // pesan lebih panjang dari ini dicurigai
 maxLines: 50, // jumlah baris melebihi ini dicurigai
 maxMentions: 10, // jumlah mention melebihi ini dicurigai
 maxZeroWidth: 5, // jumlah zero-width char melebihi ini dicurigai
 maxRepeatedRatio: 0.90, // hanya deteksi repeated jika ratio sangat tinggi (lebih ketat)
 minCheckLength: 50 // ABAIKAN cek lanjutan kalau pesan < 50 karakter
}

function countZeroWidthChars(s) {
 if (!s) return 0
 const zeroRe = /[\u200B\u200C\u200D\uFEFF]/g
 const arr = s.match(zeroRe)
 return arr ? arr.length : 0
}

function repeatedCharRatio(s) {
 if (!s) return 0
 const total = s.length
 const freq = {}
 for (let ch of s) {
 freq[ch] = (freq[ch] || 0) + 1
 }
 let maxCount = 0
 for (let k in freq) {
 if (freq[k] > maxCount) maxCount = freq[k]
 }
 return maxCount / Math.max(1, total)
}

/**
 * looksLikeVirtex
 * - Mengabaikan pesan yang sangat pendek (minCheckLength)
 * - Hanya menilai repeated-ratio bila panjang pesan cukup (menghindari '.' / '...' false positive)
 * - Mengembalikan false atau objek reason
 */
function looksLikeVirtex(text, mentionsCount = 0) {
 if (!text || typeof text !== 'string') return false
 const clean = text.replace(/\r/g, '')
 const len = clean.length
 const lines = clean.split('\n').length
 const zeroCount = countZeroWidthChars(clean)

 // Jika pesan sangat pendek, abaikan semua pemeriksaan lanjutan
 if (len < ANTIVIRTEX_CONFIG.minCheckLength && lines < 5 && mentionsCount < 3) return false

 // Periksa aturan "keras" dulu
 if (len >= ANTIVIRTEX_CONFIG.maxLength) return { reason: 'length', len }
 if (lines >= ANTIVIRTEX_CONFIG.maxLines) return { reason: 'lines', lines }
 if (mentionsCount >= ANTIVIRTEX_CONFIG.maxMentions) return { reason: 'mentions', mentionsCount }
 if (zeroCount >= ANTIVIRTEX_CONFIG.maxZeroWidth) return { reason: 'zerowidth', zeroCount }

 // Periksa repeated char ratio hanya jika pesan cukup panjang (mis. > 100)
 const repRatio = repeatedCharRatio(clean)
 if (len > 100 && repRatio >= ANTIVIRTEX_CONFIG.maxRepeatedRatio) return { reason: 'repeated', repRatio }

 return false
}

 // -------------------------
 // DETEKSI & TINDAKAN: ANTILINK
 // -------------------------
 try {
 if (isGroup) {
 const groupIsAntilinkOn = !!global.antilinkStatus[from]
 if (groupIsAntilinkOn) {
 const textMsg =
 m.message.conversation ||
 m.message.extendedTextMessage?.text ||
 m.message.imageMessage?.caption ||
 m.message.videoMessage?.caption ||
 ""

 if (looksLikeLink(textMsg) || linkRegex.test(textMsg)) {
 // ambil metadata grup
 let groupMetadata = {}
 try { groupMetadata = await sock.groupMetadata(from) } catch (e) { groupMetadata = { participants: [] } }
 const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
 const senderIsAdmin = groupAdmins.includes(sender)

 // Abaikan admin/owner
 if (!senderIsAdmin && sender !== OWNER_JID) {
 // Hapus pesan (jika bot admin)
 try { await sock.sendMessage(from, { delete: m.key }) } catch (e) {}

 // Tambah peringatan (antilink uses 3-step by original design)
 global.antilinkWarnings[from] = global.antilinkWarnings[from] || {}
 const prev = global.antilinkWarnings[from][sender] || 0
 const now = prev + 1
 global.antilinkWarnings[from][sender] = now

 if (now === 1) {
 await sock.sendMessage(from, {
 text: `⚠️ *Peringatan 1/3!* @${sender.split("@")[0]} dilarang mengirim link di grup ini.`,
 mentions: [sender]
 })
 } else if (now === 2) {
 await sock.sendMessage(from, {
 text: `⚠️ *Peringatan 2/3!* @${sender.split("@")[0]} — kirim link lagi = kick.`,
 mentions: [sender]
 })
 } else {
 try {
 await sock.sendMessage(from, {
 text: `🚫 *Pelanggaran 3/3!* @${sender.split("@")[0]} akan dikeluarkan dari grup.`,
 mentions: [sender]
 })
 await sock.groupParticipantsUpdate(from, [sender], "remove")
 } catch (err) {
 await sock.sendMessage(from, {
 text: `❌ Gagal mengeluarkan @${sender.split("@")[0]}. Pastikan bot adalah admin.`,
 mentions: [sender]
 })
 }
 delete global.antilinkWarnings[from][sender]
 }
 }
 }
 }
 }
 } catch (err) {
 console.error("ANTILINK ERROR:", err)
 }

// -------------------------
// DETEKSI & TINDAKAN: ANTIVIRTEX (REVISED — safer checks + gc-based)
// -------------------------
try {
 if (isGroup) {
 // utamakan config dari groupConfig (gc), fallback ke global
 const groupCfg = gc.getGroup(from) || {}
 const antivirOn = !!(groupCfg.antivirtex || global.antivirtexStatus[from])

 if (antivirOn) {
 const textMsg =
 m.message.conversation ||
 m.message.extendedTextMessage?.text ||
 m.message.imageMessage?.caption ||
 m.message.videoMessage?.caption ||
 ""

 // ambil jumlah mentions bila ada
 const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
 const mentionsCount = mentions.length

 // PENTING: cepat cek panjang, kalau pendek langsung skip (hindari false positive)
 if (!textMsg || textMsg.length < ANTIVIRTEX_CONFIG.minCheckLength) {
 // tidak dianggap virtex
 } else {
 const vir = looksLikeVirtex(textMsg, mentionsCount)
 if (vir) {
 // ambil metadata grup & admin status
 let groupMetadata = {}
 try { groupMetadata = await sock.groupMetadata(from) } catch (e) { groupMetadata = { participants: [] } }
 const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
 const senderIsAdmin = groupAdmins.includes(sender)

 if (!senderIsAdmin && sender !== OWNER_JID) {
 // Hapus pesan
 try { await sock.sendMessage(from, { delete: m.key }) } catch (e) {}

 // update peringatan (sistem 2x)
 global.antivirtexWarnings[from] = global.antivirtexWarnings[from] || {}
 const prev = global.antivirtexWarnings[from][sender] || 0
 const now = prev + 1
 global.antivirtexWarnings[from][sender] = now

 // reason text
 let reasonText = ""
 if (vir.reason === "length") reasonText = `pesan terlalu panjang (${vir.len} karakter)`
 else if (vir.reason === "lines") reasonText = `terlalu banyak baris (${vir.lines} baris)`
 else if (vir.reason === "mentions") reasonText = `terlalu banyak mention (${vir.mentionsCount} mention)`
 else if (vir.reason === "zerowidth") reasonText = `mengandung banyak karakter zero-width (${vir.zeroCount})`
 else if (vir.reason === "repeated") reasonText = `terlalu banyak pengulangan karakter (ratio ${Math.round(vir.repRatio*100)}%)`
 else reasonText = "pola berbahaya terdeteksi"

 if (now === 1) {
 await sock.sendMessage(from, {
 text: `⚠️ *Anti-Virtex Peringatan 1/2* — @${sender.split("@")[0]} pesanmu dihapus karena ${reasonText}.\n\nJangan kirim pesan yang dapat membuat lag (VIRTEX). 1x lagi terdeteksi kamu akan di-kick.`,
 mentions: [sender]
 })
 } else {
 // now >= 2 -> kick (jika enabled)
 try {
 await sock.sendMessage(from, {
 text: `🚫 *Anti-Virtex Pelanggaran 2/2* — @${sender.split("@")[0]} dikeluarkan karena berulang kali mengirim pesan berbahaya (${reasonText}).`,
 mentions: [sender]
 })
 if (ANTIVIRTEX_CONFIG.kickOnSecond) {
 await sock.groupParticipantsUpdate(from, [sender], "remove")
 }
 } catch (err) {
 await sock.sendMessage(from, {
 text: `❌ Gagal keluarkan @${sender.split("@")[0]}. Pastikan bot adalah admin.`,
 mentions: [sender]
 })
 }
 delete global.antivirtexWarnings[from][sender]
 }
 }
 }
 }
 }
 }
} catch (err) {
 console.error("ANTIVIRTEX ERROR (REVISED):", err)
}

 // Logging command
 if (isCommand) console.log(chalk.green(`[CMD] ${command} | FROM: ${sender} | GROUP: ${isGroup}`))

 // === COMMAND: MENU ===
 if (command === "menu") {
// ==============================================
// 📜 F. FITUR: MENU / HELP
// ==============================================
 const time = moment().tz("Asia/Jakarta").format("HH:mm:ss")
 const uptime = formatRuntime(Date.now() - startTime)

 // === Menu untuk OWNER (PM only) ===
 if (!isGroup && sender === OWNER_JID) {
 const menuOwner = `
╭───❖ *OWNER PANEL* ❖───╮
│ ⏰ *Waktu:* ${time}
│ 📅 *Uptime:* ${uptime}
│ 👑 *Owner:* ${OWNER_JID.split("@")[0]}
│
│ ⚙️ Kontrol Sistem
│ • .status
│ • .restart
│
│ 🔗 Grup Management
│ • .listgc
│ • .join <link grup>
│ • .leave <id grup>
│
│ 📢 Broadcast
│ • .bc <pesan>
│
╰───────────────❖
`
 await sock.sendMessage(from, { text: menuOwner.trim() }, { quoted: m })
 return
 }

 // === Menu untuk ADMIN di GRUP (akses admin dan member) ===
 if (isGroup) {
 const groupMetadata = await sock.groupMetadata(from)
 const groupAdmins = groupMetadata.participants
 .filter(p => p.admin)
 .map(p => p.id)
 const isAdmin = groupAdmins.includes(sender)

 if (isAdmin || sender === OWNER_JID) {
 const menuAdmin = `
╭───❖ *MENU ADMIN* ❖───╮
│ ⏰ *Waktu:* ${time}
│ 📅 *Uptime:* ${uptime}
│
│ ⚙️ Pengaturan Grup
│ • .status
│ • .menu
│
│ 🔧 Kontrol Admin
│ • .add <nomor>
│ • .kick @user
│ • .h <teks>
│ • .setnamagrup <teks>
│ • .setdeskripsigrup <teks>
│ • .open / .close
│
│ 🔒 Sistem Anti & Otomatis
│ • .antilink on/off/status
│ • .antivirtex on/off/status
│ • .welcome on/off/status
│ • .goodbye on/off/status
│ • .showconfig
│
│ ⚔️ Event System
│ • .event <namaevent>-<durasi>-<biaya>-<slot>
│ • .eventedit
│ • .eventedit bayar <no peserta>
│ • .eventedit batal <no peserta>
│ • .eventreset
│
│ 🧾 Rules
│ • .setrules <teks rules>
│
╰───────────────❖
`
 await sock.sendMessage(from, { text: menuAdmin.trim() }, { quoted: m })
 return
 }

 // === Menu untuk MEMBER di GRUP ===
 const menuMember = `
╭───❖ *MENU GRUP* ❖───╮
│
│ ╭───❖ *MENU GRUP* ❖───╮
│ ⏰ *Waktu:* ${time}
│ 📅 *Uptime:* ${uptime}
│
│ • .stiker
│ • .menu
│ • .rules
│ • .report (reply pesan)
│ _Fitur Lain Coming Soon_
│
╰───────────────❖
`
 await sock.sendMessage(from, { text: menuMember.trim() }, { quoted: m })
 return
 }
 }

 // === COMMAND: STATUS ===
 if (command === "status") {
 const uptime = formatRuntime(Date.now() - startTime)
 const time = moment().tz("Asia/Jakarta").format("HH:mm:ss")
 const statusMsg = `
🧩 *STATUS BOT*

• 🕒 Waktu: ${time}
• ⚙️ Status: Online
• ⏱️ Uptime: ${uptime}

_VERSION 0.0.1_
`
 await sock.sendMessage(from, { text: statusMsg.trim() }, { quoted: m })
 return
 }
// ===========================
// 🔐 VERIFIKASI GRUP SYSTEM
// ===========================
if (command === 'verify') {
 try {
 await handleVerifyCommand(sock, m, from, sender, args, reply)
 } catch (err) {
 console.error('❌ Error di .verify:', err)
 reply('⚠️ Terjadi kesalahan saat verifikasi.')
 }
}
// ⚙️ CONFIG GRUP COMMAND (Final Version — Cleaned)
if (command === 'showconfig') {
 if (!isGroup) return reply('❗ Perintah ini hanya bisa digunakan di grup.')
 try {
 const gc = require('./lib/groupConfig')
 const data = gc.getGroup(from)
 if (!data) return reply('⚠️ Tidak ada konfigurasi untuk grup ini.')

 const filtered = [
 'welcome',
 'goodbye',
 'antilink',
 'antivirtex',
 ]

 let text = '📋 *CONFIG GRUP SAAT INI:*\n\n'
 for (const key of filtered) {
 const val = data[key]
 text += `• ${key.charAt(0).toUpperCase() + key.slice(1)}: ${val ? '✅ ON' : '❌ OFF'}\n`
 }

 text += `\n📍 *Group ID:* ${from}`

 reply(text)
 } catch (err) {
 console.error('❌ Error di .showconfig:', err)
 reply('⚠️ Terjadi kesalahan saat mengambil config.')
 }
 return
}
// === COMMAND: RULES ===
if (command === "rules") {
  try {
    if (!isGroup) return reply("❗ Perintah ini hanya bisa digunakan di dalam grup.")

    const conf = global.groupConfig[from] || {}
    const rules = conf.rules

    if (!rules) {
      return reply("📜 *Rules grup belum diatur.*\nGunakan perintah *.setrules* oleh admin untuk menambah rules.")
    }

    const teks = `📜 *Peraturan Grup:*\n\n${rules}\n\n⚠️ Harap patuhi aturan di atas.`
    reply(teks)
  } catch (err) {
    console.error("❌ Error di command .rules:", err)
    reply("⚠️ Terjadi kesalahan saat memuat rules.")
  }
  return
}
// ===========================
// ⚙️ CONFIG FITUR GRUP (Unified Auto Save)
// ===========================
if (['antilink', 'antivirtex', 'welcome', 'goodbye'].includes(command)) {
 if (!isGroup) return reply('❗ Command ini hanya bisa di grup.')
 if (!isAdmin && sender !== OWNER_JID) {
   return reply('🚫 Hanya admin grup atau owner bot yang bisa mengubah pengaturan fitur.')
 }

 const key = command
 const cfg = gc.getGroup(from)
 let newValue = cfg[key]

 if (args[0]) {
   const opt = args[0].toLowerCase()
   if (opt === 'on') newValue = true
   else if (opt === 'off') newValue = false
   else if (opt === 'status') {
     return reply(`📊 Status *${key.toUpperCase()}*: ${cfg[key] ? '✅ ON' : '❌ OFF'}`)
   } else return reply('Gunakan: .antilink on / off / status')
 } else {
   newValue = !newValue
 }

 gc.setGroup(from, { [key]: newValue })

 // ✅ Sinkronkan ke variabel global agar efek langsung
 if (key === 'antilink') global.antilinkStatus[from] = newValue
 if (key === 'antivirtex') global.antivirtexStatus[from] = newValue
 if (key === 'welcome') global.welcomeStatus[from] = newValue
 if (key === 'goodbye') global.goodbyeStatus[from] = newValue

 reply(`✅ *${key.toUpperCase()}* telah diubah menjadi ${newValue ? 'ON' : 'OFF'}`)
 return
}
//=====================//
// 👑 FITUR OWNER: LIST GROUP CHAT (.listgc)
//=====================//
if (command === "listgc") {
  try {
    const groups = await sock.groupFetchAllParticipating()
    const groupList = Object.values(groups)

    if (groupList.length === 0) {
      await sock.sendMessage(from, { text: "🤖 Bot tidak tergabung di grup mana pun." }, { quoted: m })
      return
    }

    let teks = "📋 *Daftar Grup yang Bot Ikuti:*\n\n"
    let totalMember = 0
    let i = 1

    for (const group of groupList) {
      const meta = await sock.groupMetadata(group.id)
      const memberCount = meta.participants.length
      totalMember += memberCount

      teks += `*${i}.*\n`
      teks += `Nama grup     : ${meta.subject}\n`
      teks += `ID grup       : ${group.id}\n`
      teks += `Jumlah anggota: ${memberCount}\n`

      try {
        const invite = await sock.groupInviteCode(group.id)
        teks += `Link grup     : https://chat.whatsapp.com/${invite}\n\n`
      } catch {
        teks += `Link grup     : 🔒 Tidak bisa diakses (bot bukan admin)\n\n`
      }

      i++
    }

    teks += `🧩 Total grup: *${groupList.length}*\n👥 Total seluruh anggota: *${totalMember}*`

    await sock.sendMessage(from, { text: teks }, { quoted: m })
  } catch (err) {
    console.error("❌ Error di command .listgc:", err)
    await sock.sendMessage(from, { text: "⚠️ Terjadi kesalahan saat memuat daftar grup." }, { quoted: m })
  }
  return
}
//=====================//
// 👑 FITUR OWNER: JOIN GRUP VIA LINK (.join <link>)
//=====================//
if (command === 'join') {
 try {
 if (!isOwner) return reply('🚫 Fitur ini hanya untuk owner bot.')
 if (!args[0]) return reply('❗ Contoh: .join https://chat.whatsapp.com/ABCDEFG123456789')

 const link = args[0].trim()
 const match = link.match(/chat\.whatsapp\.com\/([\w\d]+)/)

 if (!match) return reply('⚠️ Format link undangan tidak valid.')

 const inviteCode = match[1]

 // ✅ Proses join menggunakan kode undangan
 const response = await sock.groupAcceptInvite(inviteCode)

 if (response) {
 return reply(`✅ Berhasil join ke grup!\n\n📎 Group ID: ${response}`)
 } else {
 return reply('⚠️ Gagal join ke grup. Link mungkin tidak valid atau sudah kedaluwarsa.')
 }

 } catch (err) {
 console.error('❌ Error di .join:', err)
 reply('⚠️ Terjadi kesalahan saat mencoba join ke grup.')
 }
}
//=====================//
// 👑 FITUR OWNER: LEAVE GRUP TERTENTU (.leave <id_grup>)
//=====================//
if (command === 'leave') {
 try {
 if (!isOwner) return reply('🚫 Fitur ini hanya untuk owner bot.')
 if (!args[0]) return reply('❗ Contoh: .leave 120363012345678901@g.us')

 const groupId = args[0].trim()

 if (!groupId.endsWith('@g.us'))
 return reply('⚠️ ID grup tidak valid. Gunakan ID yang benar dari perintah .listgc.')

 // ✅ Kirim pesan perpisahan sebelum keluar
 await sock.sendMessage(groupId, { text: '👋 Bot akan keluar dari grup ini. Terima kasih!' })

 // ✅ Keluar dari grup
 await sock.groupLeave(groupId)

 // ✅ Konfirmasi ke owner
 return reply(`✅ Bot telah keluar dari grup:\n📎 ID: ${groupId}`)

 } catch (err) {
 console.error('❌ Error di .leave:', err)
 reply('⚠️ Terjadi kesalahan saat mencoba keluar dari grup.')
 }
}
//=====================//
// 📢 FITUR OWNER: BROADCAST KE SEMUA GRUP (.bc <pesan>)
//=====================//
if (command === 'bc') {
 try {
 if (!isOwner) return reply('🚫 Fitur ini hanya untuk owner bot.')
 const message = args.join(' ').trim()
 if (!message) return reply('❗ Contoh: .bc Halo semua!')

 // ✅ Ambil semua grup aktif
 const groups = await sock.groupFetchAllParticipating()
 const groupList = Object.values(groups)
 if (groupList.length === 0) return reply('📭 Bot belum tergabung di grup manapun.')

 reply(`📢 Mengirim broadcast ke ${groupList.length} grup...`)

 let sentCount = 0
 for (const group of groupList) {
 try {
 await sock.sendMessage(group.id, {
 text: `📢 *PENGUMUMAN DARI OWNER BOT*\n\n${message}`
 })
 sentCount++
 await new Promise(res => setTimeout(res, 800)) // jeda agar tidak terdeteksi spam
 } catch (err) {
 console.log(`Gagal kirim ke ${group.id}:`, err)
 }
 }

 await reply(`✅ Broadcast selesai!\n📬 Pesan terkirim ke ${sentCount}/${groupList.length} grup.`)

 } catch (err) {
 console.error('❌ Error di .bc:', err)
 reply('⚠️ Terjadi kesalahan saat broadcast.')
 }
 return;
}
 // === COMMAND: ADD ===
 if (command === "add") {
 if (!isGroup) {
 await sock.sendMessage(from, { text: "❗ Perintah ini hanya bisa digunakan di grup." }, { quoted: m })
 return
 }

 const groupMetadata = await sock.groupMetadata(from)
 const groupAdmins = groupMetadata.participants
 .filter(p => p.admin)
 .map(p => p.id)
 const isAdmin = groupAdmins.includes(sender)

 if (!isAdmin && sender !== OWNER_JID) {
 await sock.sendMessage(from, { text: "🚫 Hanya admin grup atau owner yang bisa menggunakan perintah ini." }, { quoted: m })
 return
 }

 const nums = args
 if (!nums || nums.length === 0) {
 await sock.sendMessage(from, { text: "❗ Format: .add 628xxxx\nContoh: .add 6281234567890" }, { quoted: m })
 return
 }

 for (const number of nums) {
 const cleanNumber = number.replace(/[^0-9]/g, "")
 const userJid = `${cleanNumber}@s.whatsapp.net`
 try {
 const inviteCode = await sock.groupInviteCode(from)
 const inviteLink = `https://chat.whatsapp.com/${inviteCode}`
 await sock.sendMessage(userJid, {
 text: `👋 Halo! Kamu diundang untuk bergabung ke grup *${groupMetadata.subject}*.\nKlik tautan berikut untuk bergabung:\n\n${inviteLink}`,
 })
 await sock.sendMessage(from, { text: `✅ Undangan dikirim ke @${cleanNumber}`, mentions: [userJid] })
 } catch (err) {
 console.error(chalk.red("❌ Gagal kirim undangan:"), err)
 await sock.sendMessage(from, { text: `❌ Gagal kirim undangan ke @${cleanNumber}.`, mentions: [userJid] })
 }
 }
 return
 }

 // === COMMAND: KICK ===
 if (command === "kick") {
 if (!isGroup) {
 await sock.sendMessage(from, { text: "❗ Perintah ini hanya bisa digunakan di grup." }, { quoted: m })
 return
 }

 const groupMetadata = await sock.groupMetadata(from)
 const groupAdmins = groupMetadata.participants
 .filter(p => p.admin)
 .map(p => p.id)
 const isAdmin = groupAdmins.includes(sender)

 if (!isAdmin && sender !== OWNER_JID) {
 await sock.sendMessage(from, { text: "🚫 Hanya admin grup atau owner yang bisa menggunakan perintah ini." }, { quoted: m })
 return
 }

 const mention = m.message.extendedTextMessage?.contextInfo?.mentionedJid || []
 const argsNums = body.split(" ").slice(1)
 let targets = []

 if (mention.length > 0) {
 targets = mention
 } else if (argsNums.length > 0) {
 targets = argsNums.map(num => num.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
 }

 if (targets.length === 0) {
 await sock.sendMessage(from, { text: "❗ Format: .kick @user atau .kick 628xxxx" }, { quoted: m })
 return
 }

 for (const user of targets) {
 if (groupAdmins.includes(user)) {
 await sock.sendMessage(from, { text: `⚠️ Tidak bisa menendang admin: @${user.split("@")[0]}`, mentions: [user] })
 continue
 }

 console.log(chalk.yellow(`[KICK] Mengeluarkan ${user} dari grup ${from}`))
 try {
 await sock.groupParticipantsUpdate(from, [user], "remove")
 await sock.sendMessage(from, { text: `✅ @${user.split("@")[0]} telah dikeluarkan.`, mentions: [user] })
 } catch (err) {
 console.error(chalk.red("❌ Gagal kick:"), err)
 await sock.sendMessage(from, { text: `❌ Gagal mengeluarkan @${user.split("@")[0]}. Pastikan bot adalah admin.`, mentions: [user] })
 }
 }

 return
 }
 // === COMMAND: HIDETAG (.h) ===
if (command === "h") {
 try {
 if (!isGroup) {
 await sock.sendMessage(from, { text: "❗ Perintah .h hanya bisa digunakan di grup." }, { quoted: m })
 return
 }

 // Ambil metadata grup & cek admin
 const groupMetadata = await sock.groupMetadata(from)
 const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
 const isAdminLocal = groupAdmins.includes(sender)
 if (!isAdminLocal && sender !== OWNER_JID) {
 await sock.sendMessage(from, { text: "🚫 Hanya admin grup atau owner yang bisa menggunakan .h" }, { quoted: m })
 return
 }

 // Ambil daftar semua peserta (mentions)
 const allMembers = groupMetadata.participants.map(p => p.id)
 if (!allMembers || allMembers.length === 0) {
 await sock.sendMessage(from, { text: "⚠️ Gagal ambil daftar peserta grup." }, { quoted: m })
 return
 }

 // Siapkan teks pesan: prioritas
 // 1) jika command membalas pesan -> gunakan pesan yang direply sebagai konten
 // 2) jika ada argText -> gunakan argText
 // 3) jika tidak ada keduanya -> tampilkan petunjuk penggunaan
 let messageText = argText && argText.trim() ? argText.trim() : ""
 if (!messageText && m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
 // Jika ada reply, coba ambil teks dari quoted (bisa berupa text atau caption)
 const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage
 messageText =
 quoted.conversation ||
 quoted.extendedTextMessage?.text ||
 quoted.imageMessage?.caption ||
 quoted.videoMessage?.caption ||
 ""
 }

 if (!messageText) {
 return await sock.sendMessage(from, {
 text: "❗ Contoh penggunaan:\n.h Halo semua!\nAtau: reply pesan lalu ketik .h untuk mengirim pesan reply ke semua anggota (hidetag)."
 }, { quoted: m })
 }

 // Build mentions (pastikan unik)
 const mentions = Array.from(new Set(allMembers))

 // Kirim pesan dengan mentions → ini akan 'hidetag' ke semua anggota
 await sock.sendMessage(from, {
 text: messageText,
 mentions
 }, { quoted: m })

 // Opsi: kirim notifikasi singkat ke pengirim (tidak wajib)
 // await sock.sendMessage(from, { text: `✅ Pesan hidetag berhasil dikirim ke ${mentions.length} anggota.` }, { quoted: m })

 } catch (err) {
 console.error("❌ Error di .h (hidetag):", err)
 try {
 await sock.sendMessage(from, { text: "⚠️ Terjadi kesalahan saat mencoba mengirim hidetag. Pastikan bot masih terhubung dan memiliki izin." }, { quoted: m })
 } catch (e) {
 console.error("⚠️ Gagal kirim pesan error fallback .h:", e)
 }
 }
 return
}

 // === COMMAND: SET NAMA GRUP ===
 if (command === "setnamagrup") {
 if (!isGroup) {
 await sock.sendMessage(from, { text: "❗ Perintah ini hanya bisa digunakan di grup." }, { quoted: m })
 return
 }

 const groupMetadata = await sock.groupMetadata(from)
 const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
 const isAdmin = groupAdmins.includes(sender)

 if (!isAdmin && sender !== OWNER_JID) {
 await sock.sendMessage(from, { text: "🚫 Hanya admin atau owner yang bisa mengubah nama grup." }, { quoted: m })
 return
 }

 if (!argText) {
 await sock.sendMessage(from, { text: "❗ Format: .setnamagrup <nama baru>" }, { quoted: m })
 return
 }

 try {
 await sock.groupUpdateSubject(from, argText)
 await sock.sendMessage(from, { text: `✅ Nama grup berhasil diganti menjadi:\n*${argText}*` }, { quoted: m })
 } catch (err) {
 console.error("Error setnamagrup:", err)
 await sock.sendMessage(from, { text: "❌ Gagal mengganti nama grup. Pastikan bot adalah admin." }, { quoted: m })
 }
 return
 }

 // === COMMAND: SET DESKRIPSI GRUP ===
 if (command === "setdeskripsigrup") {
 if (!isGroup) {
 await sock.sendMessage(from, { text: "❗ Perintah ini hanya bisa digunakan di grup." }, { quoted: m })
 return
 }

 const groupMetadata = await sock.groupMetadata(from)
 const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
 const isAdmin = groupAdmins.includes(sender)

 if (!isAdmin && sender !== OWNER_JID) {
 await sock.sendMessage(from, { text: "🚫 Hanya admin atau owner yang bisa mengubah deskripsi grup." }, { quoted: m })
 return
 }

 if (!argText) {
 await sock.sendMessage(from, { text: "❗ Format: .setdeskripsigrup <deskripsi baru>" }, { quoted: m })
 return
 }

 try {
 await sock.groupUpdateDescription(from, argText)
 await sock.sendMessage(from, { text: "✅ Deskripsi grup berhasil diperbarui." }, { quoted: m })
 } catch (err) {
 console.error("Error setdeskripsigrup:", err)
 await sock.sendMessage(from, { text: "❌ Gagal mengubah deskripsi grup. Pastikan bot adalah admin." }, { quoted: m })
 }
 return
 }

 // === COMMAND: CLOSE GROUP CHAT ===
 if (command === "close") {
 if (!isGroup) {
 await sock.sendMessage(from, { text: "❗ Perintah ini hanya bisa digunakan di grup." }, { quoted: m })
 return
 }

 const groupMetadata = await sock.groupMetadata(from)
 const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
 const isAdmin = groupAdmins.includes(sender)

 if (!isAdmin && sender !== OWNER_JID) {
 await sock.sendMessage(from, { text: "🚫 Hanya admin atau owner yang bisa menutup chat grup." }, { quoted: m })
 return
 }

 try {
 await sock.groupSettingUpdate(from, "announcement")
 await sock.sendMessage(from, { text: "🔒 Grup telah *ditutup*! Sekarang hanya admin yang dapat mengirim pesan." }, { quoted: m })
 } catch (err) {
 console.error("Error close:", err)
 await sock.sendMessage(from, { text: "❌ Gagal menutup chat grup. Pastikan bot adalah admin." }, { quoted: m })
 }
 return
 }

 // === COMMAND: OPEN GROUP CHAT ===
 if (command === "open") {
 if (!isGroup) {
 await sock.sendMessage(from, { text: "❗ Perintah ini hanya bisa digunakan di grup." }, { quoted: m })
 return
 }

 const groupMetadata = await sock.groupMetadata(from)
 const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
 const isAdmin = groupAdmins.includes(sender)

 if (!isAdmin && sender !== OWNER_JID) {
 await sock.sendMessage(from, { text: "🚫 Hanya admin atau owner yang bisa membuka chat grup." }, { quoted: m })
 return
 }

 try {
 await sock.groupSettingUpdate(from, "not_announcement")
 await sock.sendMessage(from, { text: "🔓 Grup telah *dibuka*! Semua member dapat mengirim pesan kembali." }, { quoted: m })
 } catch (err) {
 console.error("Error open:", err)
 await sock.sendMessage(from, { text: "❌ Gagal membuka chat grup. Pastikan bot adalah admin." }, { quoted: m })
 }
 return
 }

 // === COMMAND: RESTART ===
 if (command === "restart") {
 if (sender !== OWNER_JID) {
 await sock.sendMessage(from, { text: "🚫 Hanya owner yang dapat merestart bot." }, { quoted: m })
 return
 }
 await sock.sendMessage(from, { text: "🔄 *Bot sedang direstart...*" }, { quoted: m })
 setTimeout(() => {
 process.exit(1) // PM2 atau process manager akan auto-restart
 }, 1500)
 return
 }

 // === COMMAND: ANTILINK ON/OFF/STATUS ===
 if (command === 'antilink') {
 if (!isGroup) return reply('❗ Hanya bisa di grup')
 const status = args[0]?.toLowerCase()
 const gc = require('./lib/groupConfig')
 if (status === 'on') gc.setGroup(from, { antilink: true })
 else if (status === 'off') gc.setGroup(from, { antilink: false })
 else return reply('Gunakan: .antilink on / off')
 reply(`✅ Antilink ${status.toUpperCase()}`)
}
// ===============================
// 🧩 FITUR STIKER MAKER (FFmpeg + webpmux) 
// ===============================
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { tmpdir } = require('os')
const { downloadMediaMessage } = require("@whiskeysockets/baileys")

// === LOAD GROUP CONFIG SAAT STARTUP ===
global.groupConfig = {}
try {
  if (fs.existsSync('./data/groupConfig.json')) {
    global.groupConfig = JSON.parse(fs.readFileSync('./data/groupConfig.json'))
    console.log('✅ Config grup dimuat sekali saat startup.')
  } else {
    console.log('⚠️ File groupConfig.json tidak ditemukan, membuat baru...')
    fs.writeFileSync('./data/groupConfig.json', JSON.stringify({}, null, 2))
  }
} catch (err) {
  console.error('❌ Gagal memuat groupConfig:', err)
}
// === AUTO SAVE CONFIG FUNCTION ===
function saveGroupConfig() {
  fs.writeFileSync('./data/groupConfig.json', JSON.stringify(global.groupConfig, null, 2))
}
// === COMMAND: SETRULES ===
if (command === "setrules") {
  try {
    if (!isGroup) return reply("❗ Perintah ini hanya bisa digunakan di grup.")
    if (!isAdmin && !isOwner) return reply("❗ Hanya admin atau owner yang dapat mengatur rules.")

    const textRules = args.join(" ").trim()
    if (!textRules) return reply("📜 Contoh penggunaan:\n.setrules Dilarang spam, jaga sopan santun, no toxic.")

    // pastikan grup punya config
    if (!global.groupConfig[from]) global.groupConfig[from] = {}

    // simpan rules ke config grup
    global.groupConfig[from].rules = textRules
    saveGroupConfig()

    reply("✅ Rules grup berhasil diperbarui dan tersimpan otomatis.")
  } catch (err) {
    console.error("❌ Error di .setrules:", err)
    reply("⚠️ Terjadi kesalahan saat menyimpan rules.")
  }
  return
}
// === COMMAND: STIKER ===
if (command === "stiker" || command === "s") {
  try {
    if (!m.message.imageMessage && !m.message.videoMessage) {
      return reply("🖼️ Kirim atau balas ke gambar/video dengan caption *.stiker*")
    }

    const mediaType = m.message.imageMessage ? "image" : "video"
    const filePath = await downloadMediaMessage(
      m,
      "buffer",
      {},
      { reuploadRequest: sock.updateMediaMessage }
    )

    if (!filePath) return reply("⚠️ Gagal mengunduh media.")

    const tempInput = `./temp_${Date.now()}.${mediaType === "image" ? "jpg" : "mp4"}`
    const tempOutput = `./temp_${Date.now()}.webp`

    fs.writeFileSync(tempInput, filePath)

    // proses konversi ke webp via ffmpeg
    exec(
      `ffmpeg -y -i ${tempInput} -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white" -vcodec libwebp -loop 0 -ss 00:00:00 -t 00:00:07 -preset default -an -vsync 0 ${tempOutput}`,
      async (err) => {
        if (err) {
          console.error("❌ ffmpeg error:", err)
          reply("⚠️ Gagal membuat stiker, pastikan ffmpeg sudah terinstal.")
          return
        }

        const stickerBuffer = fs.readFileSync(tempOutput)
        await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: m })

        fs.unlinkSync(tempInput)
        fs.unlinkSync(tempOutput)
        console.log("✅ Stiker berhasil dikirim.")
      }
    )
  } catch (err) {
    console.error("❌ Error di command .stiker:", err)
    reply("⚠️ Terjadi kesalahan saat membuat stiker.")
  }
  return
}

//=====================//
// 🧠 HELPER EVENT SYSTEM — KONVERSI ID KE NOMOR WA DENGAN CACHE
//=====================//

global.jidCache = global.jidCache || {}

// Normalisasi bentuk input ke JID standar
function normalizeToJid(raw) {
 if (!raw) return null
 if (typeof raw !== 'string') return null
 let s = raw.trim()
 if (s.endsWith('@s.whatsapp.net')) return s
 if (s.startsWith('@')) s = s.slice(1)
 const digits = s.replace(/[^0-9]/g, '')
 if (digits.length === 0) return null
 return `${digits}@s.whatsapp.net`
}

// Konversi semua JID ke nomor WA asli
async function formatUser(jid, sock) {
 if (!jid || typeof jid !== 'string') return '[Slot Kosong]'
 if (!jid.includes('@')) return '[Slot Kosong]'

 // 1️⃣ Cek cache
 if (global.jidCache[jid]) return '@' + global.jidCache[jid]

 // 2️⃣ Jika sudah nomor normal
 const digits = jid.replace(/[^0-9]/g, '')
 if (digits.length >= 9 && digits.length <= 15) {
 global.jidCache[jid] = digits
 return '@' + digits
 }

 // 3️⃣ Jika masih ID aneh (lid/device), resolve ke nomor asli via onWhatsApp()
 try {
 const result = await sock.onWhatsApp(jid)
 if (result && result[0] && result[0].jid) {
 const fixed = result[0].jid.split('@')[0]
 global.jidCache[jid] = fixed
 console.log(`[Resolver] ${jid} -> ${fixed}`)
 return '@' + fixed
 }
 } catch (err) {
 console.log('[Resolver Error]', jid, err)
 }

 // 4️⃣ fallback terakhir
 const idPart = jid.split('@')[0].replace(/[^0-9]/g, '')
 return idPart ? '@' + idPart : '[Slot Kosong]'
}
// === COMMAND: EVENTBUAT ===
if (command === "eventbuat") {
 try {
 if (!isGroup) return reply("❗ Perintah ini hanya bisa digunakan di grup.")
 if (!isAdmin && !isOwner) return reply("❗ Hanya admin atau owner yang dapat membuat event.")

 global.eventList = global.eventList || {}

 // ?? Cegah lebih dari 1 event aktif per grup
 const existingEvent = Object.values(global.eventList).find(e => e.idGroup === from && e.status === "aktif")
 if (existingEvent) {
 return reply("⚠️ Grup ini sudah memiliki event aktif.\nGunakan *.eventreset* terlebih dahulu untuk menghapus event lama.")
 }

 // 📦 Format input: .eventbuat NamaEvent-Durasi-Biaya-Slot
 const textInput = args.join(" ")
 if (!textInput || !textInput.includes("-")) {
 return reply("❗ Format salah!\n\nGunakan:\n*.eventbuat <NamaEvent>-<Durasi>-<Biaya>-<Slot>*\n\nContoh:\n*.eventbuat X8BoostServer-6Jam-20K-19*")
 }

 const [namaEvent, durasi, biaya, slotStr] = textInput.split("-")
 const slot = parseInt(slotStr)
 if (!namaEvent || !durasi || !biaya || isNaN(slot) || slot < 1) {
 return reply("❗ Format tidak valid!\nPastikan formatnya seperti ini:\n*.eventbuat X8BoostServer-6Jam-20K-19*")
 }

 // 🎟️ Simpan data event
 const idEvent = `${from}_${Date.now()}`
 global.eventList[idEvent] = {
 idEvent,
 idGroup: from,
 name: namaEvent.trim(),
 durasi: durasi.trim(),
 biaya: biaya.trim(),
 maxSlot: slot,
 peserta: [],
 createdBy: sender,
 createdAt: Date.now(),
 status: "aktif"
 }

 // ✨ Output awal (event baru)
 const textEvent = `
🎉 *EVENT BARU DIBUAT!*

📛 *Nama Event* : ${namaEvent}
🕒 *Durasi* : ${durasi}
💰 *Biaya* : ${biaya}
🎯 *Slot* : ${slot}
👑 *Host* : @${sender.split('@')[0]}

📩 *Ketik ikut @Username Roblox kamu* untuk ikut bergabung dalam event ini!

⚠️ *Jika slot penuh, grup akan ditutup otomatis.*
`.trim()

 await sock.sendMessage(from, { text: textEvent, mentions: [sender] }, { quoted: m })

 console.log(`🟢 Event "${namaEvent}" dibuat di grup ${from} oleh ${sender}`)

 // 🔄 Monitor jumlah peserta tiap 5 detik
 const monitorEvent = setInterval(async () => {
 const data = global.eventList[idEvent]
 if (!data) return clearInterval(monitorEvent)

 if (data.peserta.length >= data.maxSlot && data.status === "aktif") {
 try {
 data.status = "penuh"

 // 🧾 Buat daftar peserta
 let pesertaList = data.peserta
 .map((p, i) => `*${i + 1}.* ${p.nick || "-"}${p.bayar ? " 💰" : ""}`)
 .join("\n")
 if (!pesertaList) pesertaList = "_Belum ada peserta._"

 await sock.groupSettingUpdate(from, "announcement")

 const fullMsg = `
✅ *Event "${data.name}" sudah penuh!*

📛 *Nama Event* : ${data.name}
🕒 *Durasi* : ${data.durasi}
💰 *Biaya* : ${data.biaya}
🎯 *Slot* : ${data.peserta.length}/${data.maxSlot}
👑 *Host* : @${data.createdBy.split('@')[0]}

📋 *Daftar Peserta:*
${pesertaList}

📢 *Grup ini ditutup sementara hingga event dimulai.*
`.trim()

 await sock.sendMessage(from, { text: fullMsg, mentions: [data.createdBy] })
 console.log(`🔒 Grup ${from} ditutup otomatis (slot penuh).`)
 clearInterval(monitorEvent)
 } catch (err) {
 console.error("❌ Gagal menutup grup otomatis:", err)
 clearInterval(monitorEvent)
 }
 }
 }, 5000)

 } catch (err) {
 console.error("❌ Error di .eventbuat:", err)
 reply("⚠️ Terjadi kesalahan saat membuat event.")
 }
 return
}

// === FITUR: IKUT EVENT TANPA PREFIX (MULTISLOT) ===
if (m.message?.conversation?.toLowerCase().startsWith("ikut ")) {
 try {
 if (!isGroup) return // hanya berfungsi di grup
 global.eventList = global.eventList || {}

 // 🔍 Cari event aktif di grup
 const eventData = Object.values(global.eventList).find(
 e => e.idGroup === from && e.status === "aktif"
 )

 // 🚫 Tidak ada event aktif → bot diam total
 if (!eventData) return

 // 📝 Ambil nama Roblox dari input
 const textBody = m.message.conversation.trim()
 const nama = textBody.split(" ").slice(1).join(" ").trim()
 if (!nama) return // tanpa nama → diam

 // ❌ Cek slot penuh
 if (eventData.peserta.length >= eventData.maxSlot) {
 return sock.sendMessage(from, {
 text: `❌ Maaf, event *${eventData.name}* sudah penuh.\n🎯 Total Slot: ${eventData.maxSlot}/${eventData.maxSlot}`,
 mentions: [sender],
 })
 }

 // ❌ Cek nama Roblox sudah digunakan (unik)
 if (eventData.peserta.some(p => p.nick.toLowerCase() === nama.toLowerCase())) {
 return sock.sendMessage(from, {
 text: `⚠️ Username *${nama}* sudah terdaftar dalam event ini.\nGunakan nama Roblox lain.`,
 mentions: [sender],
 })
 }

 // ✅ Tambahkan ke daftar peserta
 eventData.peserta.push({
 jid: sender,
 nick: nama,
 bayar: false,
 })

 const progress = `${eventData.peserta.length}/${eventData.maxSlot}`

 // 🎉 Kirim output visual sukses join
 const msg = `
╭───🎉 *BERHASIL BERGABUNG KE EVENT!* 🎉
│ 📛 *Nama Roblox:* ${nama}
│ 🏷️ *Event:* ${eventData.name}
│ 📋 *Progress:* ${progress}
│ 💰 *Status Bayar:* ❌ Belum
╰───────────────────────────────
`.trim()

 await sock.sendMessage(from, { text: msg, mentions: [sender] })

 console.log(`🟢 ${sender} mendaftarkan ${nama} ke event ${eventData.name} (${progress})`)

 // 🔒 Jika slot penuh setelah join → tutup otomatis
 if (eventData.peserta.length >= eventData.maxSlot) {
 try {
 eventData.status = "penuh"
 await sock.groupSettingUpdate(from, "announcement")

 let pesertaList = eventData.peserta
 .map((p, i) => `*${i + 1}.* ${p.nick}${p.bayar ? " 💰" : ""}`)
 .join("\n")
 if (!pesertaList) pesertaList = "_Belum ada peserta._"

 const fullMsg = `
✅ *Event "${eventData.name}" sudah penuh!*

📛 *Nama Event* : ${eventData.name}
🕒 *Durasi* : ${eventData.durasi}
💰 *Biaya* : ${eventData.biaya}
🎯 *Slot* : ${eventData.peserta.length}/${eventData.maxSlot}
👑 *Host* : @${eventData.createdBy.split('@')[0]}

📋 *Daftar Peserta:*
${pesertaList}

📢 *Grup ini ditutup sementara hingga event dimulai.*
`.trim()

 await sock.sendMessage(from, { text: fullMsg, mentions: [eventData.createdBy] })
 console.log(`🔒 Grup ${from} ditutup otomatis (slot penuh).`)
 } catch (err) {
 console.error("❌ Gagal menutup grup otomatis:", err)
 }
 }

 } catch (err) {
 console.error("❌ Error di fitur ikut (multislot):", err)
 }
}
// === COMMAND: EVENTEDIT ===
if (command === "eventedit") {
 try {
 if (!isGroup) return reply("❗ Perintah ini hanya bisa digunakan di grup.")
 if (!isAdmin && !isOwner) return reply("❗ Hanya admin atau owner yang dapat menggunakan perintah ini.")

 global.eventList = global.eventList || {}

 // 🔍 Cari event yang aktif atau penuh
 const eventData = Object.values(global.eventList).find(
 e => e.idGroup === from && (e.status === "aktif" || e.status === "penuh")
 )
 if (!eventData) return reply("⚠️ Tidak ada event aktif di grup ini.")

 // === TANPA SUBCOMMAND → tampilkan status event
 if (args.length === 0) {
 let pesertaList = eventData.peserta
 .map((p, i) => `*${i + 1}.* ${p.nick} ${p.bayar ? "✅" : ""}`)
 .join("\n")
 if (!pesertaList) pesertaList = "_Belum ada peserta._"

 const msg = `
📢 *INFO EVENT SAAT INI*

📛 *Nama Event* : ${eventData.name}
🕒 *Durasi* : ${eventData.durasi}
💰 *Biaya* : ${eventData.biaya}
🎯 *Slot* : ${eventData.peserta.length}/${eventData.maxSlot}
👑 *Host* : @${eventData.createdBy.split("@")[0]}

📋 *Daftar Peserta:*
${pesertaList}

🕓 Event akan dimulai ketika semua peserta sudah melakukan pembayaran!

_Command Admin_:
.eventedit bayar (no peserta)
.eventedit batal (no peserta)
`.trim()

 return sock.sendMessage(from, { text: msg, mentions: [eventData.createdBy] }, { quoted: m })
 }

 // === SUBCOMMAND: BAYAR
 if (args[0].toLowerCase() === "bayar") {
 const indexes = args.slice(1).map(x => parseInt(x) - 1).filter(x => !isNaN(x))
 if (indexes.length === 0) return reply("❗ Gunakan: *.eventedit bayar <no_peserta>*\nContoh: *.eventedit bayar 1 3 7*")

 let updated = []
 for (const i of indexes) {
 if (eventData.peserta[i]) {
 eventData.peserta[i].bayar = true
 updated.push(eventData.peserta[i].nick)
 }
 }

 if (updated.length === 0) return reply("⚠️ Nomor peserta tidak valid.")
 await sock.sendMessage(from, {
 text: `✅ Peserta berikut sudah melakukan pembayaran:\n${updated.map((n, i) => `${i + 1}. ${n}`).join("\n")}`
 })

 let pesertaList = eventData.peserta
 .map((p, i) => `*${i + 1}.* ${p.nick} ${p.bayar ? "✅" : ""}`)
 .join("\n")

 const updatedMsg = `
📢 *UPDATE DAFTAR PESERTA (${eventData.name})*

${pesertaList}

🕓 Event akan dimulai ketika semua peserta sudah membayar!
`.trim()

 await sock.sendMessage(from, { text: updatedMsg })
 return
 }

 // === SUBCOMMAND: BATAL
 if (args[0].toLowerCase() === "batal") {
 const indexes = args.slice(1).map(x => parseInt(x) - 1).filter(x => !isNaN(x))
 if (indexes.length === 0) return reply("❗ Gunakan: *.eventedit batal <no_peserta>*\nContoh: *.eventedit batal 2 5 8*")

 let removed = []
 indexes.sort((a, b) => b - a)
 for (const i of indexes) {
 if (eventData.peserta[i]) {
 removed.push(eventData.peserta[i].nick)
 eventData.peserta.splice(i, 1)
 }
 }

 if (removed.length === 0) return reply("⚠️ Nomor peserta tidak valid.")
 await sock.sendMessage(from, {
 text: `🗑️ Peserta berikut telah dibatalkan dari event:\n${removed.map((n, i) => `${i + 1}. ${n}`).join("\n")}`
 })

 // 🔓 Otomatis buka grup kalau sebelumnya penuh
 if (eventData.status === "penuh" && eventData.peserta.length < eventData.maxSlot) {
 try {
 await sock.groupSettingUpdate(from, "not_announcement")
 eventData.status = "aktif"
 await sock.sendMessage(from, { text: "🔓 Grup dibuka kembali untuk melanjutkan pendaftaran sisa slot!" })
 } catch (err) {
 console.error("❌ Gagal membuka grup otomatis:", err)
 }
 }

 let pesertaList = eventData.peserta
 .map((p, i) => `*${i + 1}.* ${p.nick} ${p.bayar ? "✅" : ""}`)
 .join("\n")
 if (!pesertaList) pesertaList = "_Belum ada peserta._"

 const updatedMsg = `
📢 *UPDATE DAFTAR PESERTA (${eventData.name})*

${pesertaList}

🕓 Event akan dimulai ketika semua peserta sudah membayar!
`.trim()

 await sock.sendMessage(from, { text: updatedMsg })
 return
 }

 // === Jika subcommand tidak dikenal
 return reply("⚠️ Subcommand tidak dikenal.\nGunakan: *.eventedit bayar* atau *.eventedit batal*")

 } catch (err) {
 console.error("❌ Error di .eventedit:", err)
 reply("⚠️ Terjadi kesalahan saat menjalankan perintah eventedit.")
 }
 return
}
// === COMMAND: EVENTRESET ===
if (command === "eventreset") {
 try {
 if (!isGroup) return reply("❗ Perintah ini hanya bisa digunakan di grup.")
 if (!isAdmin && !isOwner) return reply("❗ Hanya admin atau owner yang dapat menggunakan perintah ini.")

 global.eventList = global.eventList || {}

 // 🔍 Cari event aktif atau penuh di grup
 const eventKey = Object.keys(global.eventList).find(
 key => global.eventList[key].idGroup === from && ["aktif", "penuh"].includes(global.eventList[key].status)
 )

 if (!eventKey) {
 return reply("⚠️ Tidak ada event aktif yang bisa dihapus di grup ini.")
 }

 const eventData = global.eventList[eventKey]
 delete global.eventList[eventKey] // 🗑️ Hapus dari global list

 // 🔓 Buka grup kembali jika sebelumnya tertutup
 try {
 await sock.groupSettingUpdate(from, "not_announcement")
 } catch (err) {
 console.warn("⚠️ Grup sudah dalam keadaan terbuka.")
 }

 const msg = `
🗑️ *EVENT TELAH DIHAPUS!*

📛 *Nama Event* : ${eventData.name}
🕒 *Durasi* : ${eventData.durasi}
💰 *Biaya* : ${eventData.biaya}
👑 *Host* : @${eventData.createdBy.split('@')[0]}

Grup sekarang dapat membuat event baru lagi dengan perintah:
*.eventbuat <Nama>-<Durasi>-<Biaya>-<Slot>*
`.trim()

 await sock.sendMessage(from, { text: msg, mentions: [eventData.createdBy] })
 console.log(`🗑️ Event "${eventData.name}" dihapus oleh ${sender} di grup ${from}`)
 } catch (err) {
 console.error("❌ Error di .eventreset:", err)
 reply("⚠️ Terjadi kesalahan saat menghapus event.")
 }
 return
}
// ===========================
// 🧩 FITUR ANTIVIRTEX (Versi paling aman, hanya deteksi teks > 500 karakter)
// ===========================
if (command === 'antivirtex' || (isGroup && gc.getGroup(from)?.antivirtex)) {
 const groupConf = gc.getGroup(from) || { antivirtex: false }

 // === COMMAND HANDLER ===
 if (command === 'antivirtex') {
 if (!isGroup) return reply('❗ Command ini hanya bisa digunakan di grup.')
 const arg = args[0]?.toLowerCase()

 if (arg === 'on') {
 gc.setGroup(from, { antivirtex: true })
 return reply('✅ *Anti Virtex* telah diaktifkan untuk grup ini.')
 }

 if (arg === 'off') {
 gc.setGroup(from, { antivirtex: false })
 return reply('❎ *Anti Virtex* telah dinonaktifkan untuk grup ini.')
 }

 if (arg === 'status') {
 return reply(`📊 Status *Anti Virtex*: ${groupConf.antivirtex ? '✅ ON' : '❌ OFF'}`)
 }

 return reply('Gunakan: *.antivirtex on / off / status*')
 }

// === AUTO DETECTION ===
if (groupConf.antivirtex && isGroup) {
 try {
 // ✅ Ambil ID bot dengan aman
 const botJid = sock?.user?.id?.includes('@')
 ? sock.user.id
 : sock.user.id + '@s.whatsapp.net'

 const senderJid =
 m.key?.participant ||
 m.participant ||
 m.key?.remoteJid ||
 m.sender ||
 ""

 // ✅ Abaikan pesan dari bot sendiri
 if (senderJid === botJid) return

 const textMsg =
 m.message?.conversation ||
 m.message?.extendedTextMessage?.text ||
 ''

 if (!textMsg || textMsg.length <= 500) return

 await sock.sendMessage(from, {
 text: '🚫 Pesan terlalu panjang (kemungkinan virtex). Pesan dihapus otomatis.'
 }, { quoted: m })

 await sock.sendMessage(from, { delete: m.key })
 console.log(`🧩 Pesan panjang (${textMsg.length} karakter) dihapus di grup ${from}`)
 return

 } catch (err) {
 console.error('❌ Error di modul AntiVirtex:', err.message)
 }
}
}
// ===========================
// === FITUR REPORT (VOTE DELETE SYSTEM)
// ===========================
if (command === "report") {
  if (!isGroup) return reply("❗ Perintah ini hanya bisa digunakan di grup.")
  
  const groupMetadata = await sock.groupMetadata(from)
  const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)

  // Ambil pesan yang direply
  let target = null
  if (m.quoted) {
    target = m.quoted
  } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    const q = m.message.extendedTextMessage.contextInfo
    target = {
      key: {
        remoteJid: from,
        id: q.stanzaId,
        participant: q.participant,
      },
      message: q.quotedMessage,
    }
  }

  if (!target) {
    return reply("❗ Balas pesan yang ingin kamu laporkan.\nContoh: reply lalu ketik *.report*")
  }

  const targetID = target.key.id
  const targetSender = target.key.participant || target.key.remoteJid

  if (groupAdmins.includes(targetSender)) {
    return reply("⚠️ Pesan dari admin tidak bisa dilaporkan.")
  }

  if (!global.reportVotes) global.reportVotes = {}
  if (!global.reportVotes[targetID]) {
    global.reportVotes[targetID] = {
      reporters: new Set(),
      targetKey: target.key,
      targetSender,
    }
  }

  const reportInfo = global.reportVotes[targetID]
  if (reportInfo.reporters.has(sender)) {
    return reply("⚠️ Kamu sudah melaporkan pesan ini sebelumnya.")
  }

  reportInfo.reporters.add(sender)
  const VOTE_LIMIT = 3
  const count = reportInfo.reporters.size

  if (count >= VOTE_LIMIT) {
    try {
      await sock.sendMessage(from, { delete: reportInfo.targetKey })
      await sock.sendMessage(from, {
        text: `🚫 Pesan telah dihapus karena menerima ${VOTE_LIMIT} laporan dari anggota.`,
      })
      delete global.reportVotes[targetID]
    } catch (err) {
      console.error("❌ Error menghapus pesan report:", err)
      reply("⚠️ Gagal menghapus pesan, pastikan bot adalah admin.")
    }
  } else {
    await sock.sendMessage(from, {
      text: `✅ Laporan diterima!\nPesan ini telah dilaporkan *${count}/${VOTE_LIMIT}* kali.`,
    }, { quoted: target })
  }
  return
}
// === COMMAND: WELCOME ON/OFF/STATUS ===
if (command === "welcome") {
 if (!isGroup) {
 await sock.sendMessage(from, { text: "❗ Perintah ini hanya bisa digunakan di grup." }, { quoted: m })
 return
 }

 const groupMetadata = await sock.groupMetadata(from)
 const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
 const isAdmin = groupAdmins.includes(sender)

 if (!isAdmin && sender !== OWNER_JID) {
 await sock.sendMessage(from, { text: "🚫 Hanya admin atau owner yang bisa mengatur fitur ini." }, { quoted: m })
 return
 }

 const mode = args[0] ? args[0].toLowerCase() : ""
 if (mode === "on") {
 global.welcomeStatus[from] = true
 await sock.sendMessage(from, { text: "✅ *Fitur Welcome diaktifkan!*" }, { quoted: m })
 } else if (mode === "off") {
 global.welcomeStatus[from] = false
 await sock.sendMessage(from, { text: "❎ *Fitur Welcome dimatikan.*" }, { quoted: m })
 } else if (mode === "status") {
 const isOn = !!global.welcomeStatus[from]
 await sock.sendMessage(from, { text: `ℹ️ Status Welcome: *${isOn ? "ON" : "OFF"}*` }, { quoted: m })
 } else {
 await sock.sendMessage(from, { text: "❗ Format: .welcome on / .welcome off / .welcome status" }, { quoted: m })
 }
 return
}

// === COMMAND: GOODBYE ON/OFF/STATUS ===
if (command === "goodbye") {
 if (!isGroup) {
 await sock.sendMessage(from, { text: "❗ Perintah ini hanya bisa digunakan di grup." }, { quoted: m })
 return
 }

 const groupMetadata = await sock.groupMetadata(from)
 const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
 const isAdmin = groupAdmins.includes(sender)

 if (!isAdmin && sender !== OWNER_JID) {
 await sock.sendMessage(from, { text: "🚫 Hanya admin atau owner yang bisa mengatur fitur ini." }, { quoted: m })
 return
 }

 const mode = args[0] ? args[0].toLowerCase() : ""
 if (mode === "on") {
 global.goodbyeStatus[from] = true
 await sock.sendMessage(from, { text: "✅ *Fitur Goodbye diaktifkan!*" }, { quoted: m })
 } else if (mode === "off") {
 global.goodbyeStatus[from] = false
 await sock.sendMessage(from, { text: "❎ *Fitur Goodbye dimatikan.*" }, { quoted: m })
 } else if (mode === "status") {
 const isOn = !!global.goodbyeStatus[from]
 await sock.sendMessage(from, { text: `ℹ️ Status Goodbye: *${isOn ? "ON" : "OFF"}*` }, { quoted: m })
 } else {
 await sock.sendMessage(from, { text: "❗ Format: .goodbye on / .goodbye off / .goodbye status" }, { quoted: m })
 }
 return
}

// ✅ fallback: jika command tidak dikenal
if (isCommand) {
 await sock.sendMessage(from, { text: "⚠️ Perintah tidak dikenal. Ketik *.menu* untuk daftar perintah." }, { quoted: m })
}

// ✅ tutup blok try utama
} catch (err) {
 console.error("❌ Error umum di handler utama zeroyt7.js:", err)
}
}
