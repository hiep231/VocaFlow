import { Telegraf } from 'telegraf';
import * as admin from 'firebase-admin';
import { getFirebaseAdmin } from './_firebase';

export default async function handler(req: any, res: any) {
  // Only allow GET requests for the Cron trigger (Vercel Cron natively uses GET)
  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }

  // Authorization: Vercel sends a CRON_SECRET header to prevent abuse.
  const authHeader = req.headers.authorization;
  if (
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    console.warn('Unauthorized cron attempt');
    return res.status(401).end('Unauthorized');
  }

  const db = getFirebaseAdmin();
  if (!db) {
    console.error('Firebase DB not initialized in Cron.');
    return res.status(500).send('Firebase Setup Failed');
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN missing.');
    return res.status(500).send('Bot Token Missing');
  }
  
  const bot = new Telegraf(botToken);

  const vnHourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: 'numeric',
    hourCycle: 'h23',
  }).format(new Date());
  
  const currentHour = parseInt(vnHourStr, 10);
  console.log(`[API CRON] Bắt đầu cron lúc ${currentHour}:00 (VN)`);

  let checkedSchedules = 0;
  let sentMessages = 0;

  try {
    const schedulesSnap = await db.collection('schedules')
      .where('status', '==', 'active')
      .get();

    if (schedulesSnap.empty) {
      console.log('No active schedules found.');
      return res.status(200).json({ status: 'ok', msg: 'No active schedules' });
    }

    for (const scheduleDoc of schedulesSnap.docs) {
      const schedule = scheduleDoc.data();
      const { userId, deckId, wordsPerDay, totalWords, processedCount, words, deckTitle } = schedule;

      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const userSendHour = userData?.sendHour ?? 7;

      if (userSendHour !== currentHour) {
        continue;
      }
      
      checkedSchedules++;

      if (processedCount >= totalWords) {
        await scheduleDoc.ref.update({ status: 'completed' });
        continue;
      }

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

      const deckRef = db.collection('decks').doc(deckId);
      await deckRef.update({
        cardCount: admin.firestore.FieldValue.increment(todayWords.length),
      });

      const newProcessed = endIdx;
      const isCompleted = newProcessed >= totalWords;
      await scheduleDoc.ref.update({
        processedCount: newProcessed,
        status: isCompleted ? 'completed' : 'active',
      });

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
          sentMessages++;
        }
      } catch (msgErr) {
        console.error(`Failed to send Telegram message to user ${userId}:`, msgErr);
      }
    }

    console.log(`[API CRON] Hoàn tất vòng cron: Đã check ${checkedSchedules} lịch, gửi ${sentMessages} tin nhắn.`);
    
    return res.status(200).json({
      status: 'ok',
      hour: currentHour,
      checked: checkedSchedules,
      sent: sentMessages
    });

  } catch (err: any) {
    console.error('Error in cron handler:', err);
    return res.status(500).json({ status: 'error', error: err.message });
  }
}
