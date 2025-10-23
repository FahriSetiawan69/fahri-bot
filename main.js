// main.js
// UPDATED FOR WHISKEYSOCKETS
// Entry point: inisialisasi socket & delegasi pesan ke zeroyt7 handler
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers
} = require("@whiskeysockets/baileys")
const pino = require("pino")
const chalk = require("chalk")
const { Boom } = require("@hapi/boom")
const qrcode = require("qrcode-terminal")
const fs = require("fs")
// === Auto Load Config Grup ===
const gc = require('./lib/groupConfig')
gc.load() // muat config dari file setiap bot hidup
// Import handler pesan — file ini hanya menerima socket + message
// Pastikan file handler (handler.js / zeroyt7.js) tersedia sesuai struktur project-mu
const handleIncoming = require("./zeroyt7.js")

let sockInstance = null // keep reference to current socket

async function startBot() {
  try {
    // Jangan ubah session; gunakan folder ./session yang sudah ada/akan dibuat
    const { state, saveCreds } = await useMultiFileAuthState("./session")

    // Ambil versi baileys yg kompatibel
    const { version } = await fetchLatestBaileysVersion()

    // Buat socket baru
    const sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      browser: Browsers.macOS("ZERO-YT7"),
      auth: state
    })

    // simpan referensi global (untuk close di reconnect)
    if (sockInstance && sockInstance.ws) {
      try { sockInstance.ws.close() } catch {}
    }
    sockInstance = sock

    // Auto-save credentials
    sock.ev.on("creds.update", saveCreds)

// Connection update (QR, connection state)
sock.ev.on("connection.update", (update) => {
  const { connection, lastDisconnect, qr } = update

  // Tampilkan QR
  if (qr) {
    console.log(chalk.cyan("\n📱 Scan QR berikut untuk login WhatsApp:"))
    qrcode.generate(qr, { small: true })
  }

  // Jika koneksi terbuka
  if (connection === "open") {
    console.log(chalk.green("✅ Bot Connected"))
    console.log(chalk.cyan("📁 Semua config grup dimuat otomatis (autosave aktif)."))
  const scheduleAutoClean = require('./lib/autoclean')
scheduleAutoClean(sock)
}
  // Jika koneksi tertutup
  else if (connection === "close") {
    const reasonCode = lastDisconnect?.error
      ? new Boom(lastDisconnect.error).output?.statusCode
      : null

    if (reasonCode === DisconnectReason.loggedOut) {
      console.log(chalk.red("❌ Session logged out (credential revoked)."))
      console.log(chalk.yellow("→ Hapus folder ./session lalu restart bot untuk login ulang."))
      try { sock.ws.close() } catch {}
      return
    }

    // Hindari spam reconnect
    if (!global.reconnecting) {
      global.reconnecting = true
      console.log(chalk.yellow("🔁 Connection closed. Mencoba reconnect dalam 5 detik..."))
      try { sock.ws.close() } catch {}
      setTimeout(() => {
        console.log(chalk.cyan("⏳ Reconnecting..."))
        global.reconnecting = false
        startBot()
      }, 5000)
    }
  }
})
    // Pesan masuk - delegasi ke handler yang ada (zeroyt7.js)
    sock.ev.on("messages.upsert", async (msg) => {
      try {
        const m = msg.messages && msg.messages[0]
        if (!m) return
        // ignore jika status broadcast
        if (!m.message || m.key.remoteJid === "status@broadcast") return
        await handleIncoming(sock, m) // zeroyt7.js harus export function (sock, m)
      } catch (err) {
        console.error(chalk.red("❌ Error di handler:"), err)
      }
    })
// === EVENT: MEMBER JOIN / LEAVE ===
sock.ev.on('group-participants.update', async (update) => {
  try {
    const { id, participants, action } = update
    const groupMetadata = await sock.groupMetadata(id)
    const groupName = groupMetadata.subject
    const membersCount = groupMetadata.participants.length

    if (action === 'add') {
      if (global.welcomeStatus && global.welcomeStatus[id]) {
        for (let user of participants) {
          const mentionUser = user
          const textWelcome = `👋 Selamat datang @${mentionUser.split("@")[0]}!\nJangan lupa patuhi rules grup *${groupName}*.\nSekarang grup memiliki *${membersCount}* anggota.`
          await sock.sendMessage(id, { text: textWelcome, mentions: [mentionUser] })
        }
      }
    }

    if (action === 'remove') {
      if (global.goodbyeStatus && global.goodbyeStatus[id]) {
        for (let user of participants) {
          const mentionUser = user
          const textBye = `👋 Selamat tinggal @${mentionUser.split("@")[0]}!\nSekarang grup memiliki *${membersCount}* anggota.`
          await sock.sendMessage(id, { text: textBye, mentions: [mentionUser] })
        }
      }
    }
  } catch (err) {
    console.error("WELCOME/GOODBYE error:", err)
  }
})
    // safety logs
    process.on("uncaughtException", (err) => console.error(chalk.red("❗ Uncaught Exception:"), err))
    process.on("unhandledRejection", (err) => console.error(chalk.red("❗ Unhandled Rejection:"), err))

  } catch (err) {
    console.error(chalk.red("❗ Error saat startBot:"), err)
    // restart dengan delay agar tidak loop cepat
    setTimeout(startBot, 5000)
  }
}

startBot()