// ===========================================================
// main.js — versi dengan Auto-Updater dari GitHub
// ===========================================================

// 🧩 Modul dasar
const fs = require("fs")
const axios = require("axios")
const chalk = require("chalk")

// 💾 URL file GitHub (ganti username/repo sesuai punyamu)
const githubFiles = [
  {
    name: "main.js",
    url: "https://raw.githubusercontent.com/FahriSetiawan69/fahri-bot/main/main.js"
  },
  {
    name: "zeroyt7.js",
    url: "https://raw.githubusercontent.com/FahriSetiawan69/fahri-bot/main/zeroyt7.js"
  }
]

// 🧠 Fungsi updater
async function updateFromGithub() {
  console.log(chalk.cyan("🔄 Mengecek update dari GitHub..."))
  for (const f of githubFiles) {
    try {
      const { data } = await axios.get(f.url)
      fs.writeFileSync(f.name, data)
      console.log(chalk.green(`✅ ${f.name} berhasil diperbarui.`))
    } catch (err) {
      console.log(chalk.yellow(`⚠️ Tidak bisa update ${f.name}, menggunakan versi lokal.`))
    }
  }
}

// Jalankan updater lalu load bot utama
;(async () => {
  await updateFromGithub()

  // ===========================================================
  // === Setelah blok ini, isi file main.js kamu yang asli ====
  // ===========================================================

  const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers
  } = require("@whiskeysockets/baileys")
  const pino = require("pino")
  const { Boom } = require("@hapi/boom")
  const qrcode = require("qrcode-terminal")

  const gc = require("./lib/groupConfig")
  gc.load()
  const handleIncoming = require("./zeroyt7.js")

  let sockInstance = null

  async function startBot() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState("./session")
      const { version } = await fetchLatestBaileysVersion()

      const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("ZERO-YT7"),
        auth: state
      })

      if (sockInstance && sockInstance.ws) {
        try { sockInstance.ws.close() } catch {}
      }
      sockInstance = sock

      sock.ev.on("creds.update", saveCreds)

      // === CONNECTION EVENTS ===
      sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update
        if (qr) {
          console.log(chalk.cyan("\n📱 Scan QR berikut untuk login WhatsApp:"))
          qrcode.generate(qr, { small: true })
        }

        if (connection === "open") {
          console.log(chalk.green("✅ Bot Connected"))
          console.log(chalk.cyan("📁 Semua config grup dimuat otomatis (autosave aktif)."))
          const scheduleAutoClean = require("./lib/autoclean")
          scheduleAutoClean(sock)
        } else if (connection === "close") {
          const reasonCode = lastDisconnect?.error
            ? new Boom(lastDisconnect.error).output?.statusCode
            : null

          if (reasonCode === DisconnectReason.loggedOut) {
            console.log(chalk.red("❌ Session logged out."))
            console.log(chalk.yellow("→ Hapus folder ./session lalu restart untuk login ulang."))
            try { sock.ws.close() } catch {}
            return
          }

          if (!global.reconnecting) {
            global.reconnecting = true
            console.log(chalk.yellow("🔁 Connection closed. Reconnecting dalam 5 detik..."))
            try { sock.ws.close() } catch {}
            setTimeout(() => {
              console.log(chalk.cyan("⏳ Reconnecting..."))
              global.reconnecting = false
              startBot()
            }, 5000)
          }
        }
      })

      // === MESSAGE HANDLER ===
      sock.ev.on("messages.upsert", async (msg) => {
        try {
          const m = msg.messages && msg.messages[0]
          if (!m || !m.message || m.key.remoteJid === "status@broadcast") return
          await handleIncoming(sock, m)
        } catch (err) {
          console.error(chalk.red("❌ Error di handler:"), err)
        }
      })

      // === GROUP EVENTS ===
      sock.ev.on("group-participants.update", async (update) => {
        try {
          const { id, participants, action } = update
          const groupMetadata = await sock.groupMetadata(id)
          const groupName = groupMetadata.subject
          const membersCount = groupMetadata.participants.length

          if (action === "add" && global.welcomeStatus?.[id]) {
            for (let user of participants) {
              const mentionUser = user
              const textWelcome = `👋 Selamat datang @${mentionUser.split("@")[0]}!\nJangan lupa patuhi rules grup *${groupName}*.\nSekarang grup memiliki *${membersCount}* anggota.`
              await sock.sendMessage(id, { text: textWelcome, mentions: [mentionUser] })
            }
          }

          if (action === "remove" && global.goodbyeStatus?.[id]) {
            for (let user of participants) {
              const mentionUser = user
              const textBye = `👋 Selamat tinggal @${mentionUser.split("@")[0]}!\nSekarang grup memiliki *${membersCount}* anggota.`
              await sock.sendMessage(id, { text: textBye, mentions: [mentionUser] })
            }
          }
        } catch (err) {
          console.error("WELCOME/GOODBYE error:", err)
        }
      })

      // === ERROR HANDLER ===
      process.on("uncaughtException", (err) =>
        console.error(chalk.red("❗ Uncaught Exception:"), err)
      )
      process.on("unhandledRejection", (err) =>
        console.error(chalk.red("❗ Unhandled Rejection:"), err)
      )
    } catch (err) {
      console.error(chalk.red("❗ Error saat startBot:"), err)
      setTimeout(startBot, 5000)
    }
  }

  startBot()

})()
