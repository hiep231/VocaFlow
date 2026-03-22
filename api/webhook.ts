import { Telegraf } from 'telegraf';
import { getFirebaseAdmin } from './_firebase';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN must be provided!');
}

const bot = new Telegraf(botToken);
const db = getFirebaseAdmin();

// --- Command Handlers ---

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

bot.command('link', async (ctx) => {
  if (!db) return ctx.reply('⚠️ Firebase not configured.');

  const uid = ctx.message.text.split(' ').slice(1).join(' ').trim();
  if (!uid) {
    return ctx.reply('Vui lòng cung cấp UID VocaFlow của bạn.\nCách dùng: /link <uid-của-bạn>');
  }

  try {
    const chatId = ctx.chat.id;
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({ telegramChatId: chatId }, { merge: true });
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

bot.command('status', async (ctx) => {
  if (!db) return ctx.reply('⚠️ Firebase not configured.');

  const chatId = ctx.chat.id;

  try {
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

bot.on('callback_query', async (ctx) => {
  if (!db) return;
  const data = (ctx.callbackQuery as any).data as string;
  if (!data?.startsWith('settime_')) return;

  const hour = parseInt(data.replace('settime_', ''), 10);
  const chatId = ctx.callbackQuery.from.id;

  try {
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

// --- Serverless Export ---
export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    // Forward the webhook update to Telegraf
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } else {
    // Helper to setup webhook easily by visiting /api/webhook via browser
    if (req.query.setup === 'true') {
      const webhookUrl = `https://${req.headers.host}/api/webhook`;
      await bot.telegram.setWebhook(webhookUrl);
      res.status(200).send(`Webhook set to ${webhookUrl}`);
    } else {
      res.status(200).send('Webhook is active. Use ?setup=true to register it.');
    }
  }
}
