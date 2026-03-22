import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as cron from 'node-cron';

// Load the .env from the parent directory (VocaFlow root)
dotenv.config({ path: path.join(__dirname, '../.env') });

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('Error: TELEGRAM_BOT_TOKEN is missing in the root .env file');
  process.exit(1);
}

// --- Firebase Admin Init ---
let firebaseInitialized = false;
try {
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized.');
  } else {
    console.warn(`⚠️  serviceAccountKey.json not found at ${serviceAccountPath}`);
    console.warn('   Download it from Firebase Console > Project Settings > Service accounts.');
  }
} catch (error) {
  console.error('❌ Firebase Admin init error:', error);
}

const db = firebaseInitialized ? admin.firestore() : null;
const bot = new Telegraf(botToken);

// ────────────────────────────────────────────────────────────────────────────
// BOT COMMANDS
// ────────────────────────────────────────────────────────────────────────────

bot.start((ctx) => {
  ctx.reply(
    '🚀 Chào mừng bạn đến với VocaFlow Bot!\n\n' +
    'Các lệnh có sẵn:\n' +
    '/link <uid> — Liên kết tài khoản VocaFlow\n' +
    '/settime — Chọn giờ nhận từ vựng hàng ngày\n' +
    '/status — Xem lịch trình đang hoạt động\n\n' +
    'Tạo lịch trình trên Dashboard → Tab Schedule, và tôi sẽ gửi từ vựng mỗi ngày cho bạn! 📚'
  );
});

// /link <uid> — Pair Telegram chat with VocaFlow user
bot.command('link', async (ctx) => {
  if (!db) return ctx.reply('⚠️ Firebase not configured.');

  const uid = ctx.message.text.split(' ').slice(1).join(' ').trim();
  if (!uid) {
    return ctx.reply('Vui lòng cung cấp UID VocaFlow của bạn.\nCách dùng: /link <uid-của-bạn>');
  }

  try {
    const chatId = ctx.chat.id;
    // Store chatId in the users collection
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create a minimal user document if it doesn't exist yet
      await userRef.set(
        { telegramChatId: chatId },
        { merge: true }
      );
    } else {
      await userRef.update({ telegramChatId: chatId });
    }

    ctx.reply(
      `✅ Liên kết thành công!\n\n` +
      `Telegram của bạn đã được kết nối với VocaFlow UID: ${uid.slice(0, 8)}...\n` +
      `Tôi sẽ gửi từ vựng hàng ngày từ lịch trình của bạn. 📬\n\n` +
      `📌 Bước tiếp theo:\n` +
      `/settime — Chọn giờ nhận từ vựng hàng ngày\n` +
      `/status — Xem lịch trình đang hoạt động`
    );
  } catch (err) {
    console.error('Error linking account:', err);
    ctx.reply('❌ Liên kết thất bại. Vui lòng kiểm tra lại UID và thử lại.');
  }
});

// /status — Show active schedules
bot.command('status', async (ctx) => {
  // Xem trạng thái lịch trình
  if (!db) return ctx.reply('⚠️ Firebase not configured.');

  const chatId = ctx.chat.id;

  try {
    // Find user by chatId
    const usersSnap = await db.collection('users')
      .where('telegramChatId', '==', chatId)
      .limit(1)
      .get();

    if (usersSnap.empty) {
      return ctx.reply('Bạn chưa liên kết tài khoản.\nHãy dùng lệnh /link <uid-của-bạn> trước nhé.');
    }

    const userId = usersSnap.docs[0].id;

    const schedulesSnap = await db.collection('schedules')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();

    if (schedulesSnap.empty) {
      return ctx.reply('📭 Không có lịch trình nào đang hoạt động. Tạo lịch mới trên Dashboard → Tab Schedule nhé!');
    }

    let msg = '📋 **Lịch trình đang hoạt động:**\n\n';
    schedulesSnap.docs.forEach((doc, idx) => {
      const s = doc.data();
      const progress = Math.round((s.processedCount / s.totalWords) * 100);
      msg += `${idx + 1}. ${s.deckTitle}\n`;
      msg += `   ${s.processedCount}/${s.totalWords} words (${progress}%) · ${s.wordsPerDay}/day\n\n`;
    });

    ctx.reply(msg);
  } catch (err) {
    console.error('Error fetching status:', err);
    ctx.reply('❌ Lỗi khi tải lịch trình.');
  }
});

// /settime — Choose daily send time
bot.command('settime', async (ctx) => {
  ctx.reply('⏰ Chọn giờ bạn muốn nhận từ vựng mỗi ngày:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🌅 6:00 sáng', callback_data: 'settime_6' },
          { text: '🌄 7:00 sáng', callback_data: 'settime_7' },
          { text: '☀️ 8:00 sáng', callback_data: 'settime_8' },
        ],
        [
          { text: '🕘 9:00 sáng', callback_data: 'settime_9' },
          { text: '🕙 10:00 sáng', callback_data: 'settime_10' },
          { text: '🕛 12:00 trưa', callback_data: 'settime_12' },
        ],
        [
          { text: '🌤️ 14:00 chiều', callback_data: 'settime_14' },
          { text: '🌇 18:00 tối', callback_data: 'settime_18' },
          { text: '🌙 20:00 tối', callback_data: 'settime_20' },
        ],
        [
          { text: '🛏️ 21:00 tối', callback_data: 'settime_21' },
          { text: '🌃 22:00 đêm', callback_data: 'settime_22' },
        ],
      ],
    },
  });
});

// Handle settime callback
bot.on('callback_query', async (ctx) => {
  if (!db) return;
  const data = (ctx.callbackQuery as any).data as string;
  if (!data?.startsWith('settime_')) return;

  const hour = parseInt(data.replace('settime_', ''), 10);
  const chatId = ctx.callbackQuery.from.id;

  try {
    // Find user by chatId
    const usersSnap = await db.collection('users')
      .where('telegramChatId', '==', chatId)
      .limit(1)
      .get();

    if (usersSnap.empty) {
      await ctx.answerCbQuery('❌ Bạn chưa liên kết tài khoản. Dùng /link trước nhé.');
      return;
    }

    await usersSnap.docs[0].ref.update({ sendHour: hour });

    await ctx.answerCbQuery(`✅ Đã đặt giờ gửi: ${hour}:00`);
    await ctx.editMessageText(
      `✅ Đã cập nhật thành công!\n\n` +
      `📬 Bạn sẽ nhận từ vựng hàng ngày lúc *${hour}:00* (giờ Việt Nam).\n\n` +
      `Dùng /settime để thay đổi bất cứ lúc nào.`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error('Error setting time:', err);
    await ctx.answerCbQuery('❌ Lỗi khi lưu. Thử lại sau nhé.');
  }
});

// ────────────────────────────────────────────────────────────────────────────
// DAILY DRIP-FEED LOOP
// ────────────────────────────────────────────────────────────────────────────

async function processDailySchedules(currentHour: number) {
  if (!db) return;

  console.log(`[${new Date().toISOString()}] Kiểm tra lịch trình cho giờ ${currentHour}:00...`);

  try {
    // Get all active schedules
    const schedulesSnap = await db.collection('schedules')
      .where('status', '==', 'active')
      .get();

    if (schedulesSnap.empty) {
      console.log('No active schedules found.');
      return;
    }

    for (const scheduleDoc of schedulesSnap.docs) {
      const schedule = scheduleDoc.data();
      const { userId, deckId, wordsPerDay, totalWords, processedCount, words, deckTitle } = schedule;

      // Check user's preferred send hour (default: 7)
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const userSendHour = userData?.sendHour ?? 7;

      if (userSendHour !== currentHour) {
        continue; // Skip — not this user's send time
      }

      // Check if there are words remaining
      if (processedCount >= totalWords) {
        await scheduleDoc.ref.update({ status: 'completed' });
        continue;
      }

      // Get the next batch of words
      const startIdx = processedCount;
      const endIdx = Math.min(startIdx + wordsPerDay, totalWords);
      const todayWords = (words as any[]).slice(startIdx, endIdx);

      if (todayWords.length === 0) {
        await scheduleDoc.ref.update({ status: 'completed' });
        continue;
      }

      // Write cards to Firestore
      const batch = db.batch();
      for (const word of todayWords) {
        const cardRef = db.collection('cards').doc();
        batch.set(cardRef, {
          term: word.term || '',
          definition: word.definition || '',
          ipa: word.ipa || '',
          collocation: word.collocation || '',
          example: word.example || '',
          type: 'vocab',
          userId,
          deckId,
          level: 0,
          reps: 0,
          interval: 0,
          easeFactor: 2.5,
          nextReview: admin.firestore.FieldValue.serverTimestamp(),
          unlockAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();

      // Update deck cardCount
      const deckRef = db.collection('decks').doc(deckId);
      await deckRef.update({
        cardCount: admin.firestore.FieldValue.increment(todayWords.length),
      });

      // Update schedule progress
      const newProcessed = endIdx;
      const isCompleted = newProcessed >= totalWords;
      await scheduleDoc.ref.update({
        processedCount: newProcessed,
        status: isCompleted ? 'completed' : 'active',
      });

      // Send Telegram notification
      try {
        const chatId = userData?.telegramChatId;

        if (chatId) {
          let message = `📚 *Từ vựng hôm nay - VocaFlow*\n`;
          message += `Bộ thẻ: *${deckTitle}*\n\n`;

          todayWords.forEach((w: any, i: number) => {
            message += `${i + 1}. *${w.term}* ${w.ipa ? `(${w.ipa})` : ''}\n`;
            message += `   → ${w.definition}\n`;
            if (w.collocation) message += `   📎 ${w.collocation}\n`;
            if (w.example) message += `   💬 "${w.example}"\n`;
            message += '\n';
          });

          message += `\n📊 Tiến độ: ${newProcessed}/${totalWords} từ`;
          if (isCompleted) {
            message += '\n\n🎉 Hoàn thành lịch trình! Tất cả từ vựng đã được thêm vào.';
          }

          await bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        }
      } catch (msgErr) {
        console.error(`Failed to send Telegram message to user ${userId}:`, msgErr);
      }

      console.log(`  ✅ Processed ${todayWords.length} words for user ${userId} → deck ${deckTitle}`);
    }
  } catch (err) {
    console.error('Error in daily drip-feed:', err);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// LAUNCH
// ────────────────────────────────────────────────────────────────────────────

bot.launch().then(() => {
  console.log('🤖 VocaFlow Telegram Bot is running!');

  // Run every hour at :00 — only sends to users whose sendHour matches
  cron.schedule('0 * * * *', () => {
    const vnHourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: 'numeric',
      hourCycle: 'h23',
    }).format(new Date());
    const vnHour = parseInt(vnHourStr, 10);
    console.log(`⏰ Cron check tại giờ VN: ${vnHour}:00`);
    processDailySchedules(vnHour);
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  console.log('📅 Cron đã sẵn sàng — kiểm tra mỗi giờ và gửi theo cấu hình từng người dùng.');

  // Run once on startup to catch up
  const currentVnHourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: 'numeric',
    hourCycle: 'h23',
  }).format(new Date());
  processDailySchedules(parseInt(currentVnHourStr, 10));
}).catch((err) => {
  console.error('Failed to start bot:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
