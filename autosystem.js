module.exports = async ({ api }) => {
  const logger = console.log;

  const configCustom = {
    autosetbio: {
      status: true,
      bio: `boWrat quh nahmamagA 😓💔`
    },
    greetings: {
      status: true,
      schedule: [
        { start: { h: 5, m: 0 }, message: "Good morning everyone! rise and shine ☀️" },
        { start: { h: 6, m: 0 }, message: "Time for morning stretches! 🧘‍♂️" },
        { start: { h: 7, m: 0 }, message: "Breakfast time! don't skip it 🍳🥖" },
        { start: { h: 9, m: 0 }, message: "Keep hustling! productivity vibes  💼" },
        { start: { h: 11, m: 0 }, message: "Good late morning! Almost lunch 🍲" },
        { start: { h: 12, m: 0 }, message: "🍲 Lunch time! wag nang kumain yung mga hindi minahal dyan" },
        { start: { h: 14, m: 0 }, message: "Afternoon vibes! Stay hydrated 🤭" },
        { start: { h: 15, m: 0 }, message: "Snack time mga bOwraT 🍜" },
        { start: { h: 17, m: 0 }, message: "Evening is coming! 🌆 Take a deep breath" },
        { start: { h: 18, m: 0 }, message: "Good evening everyone! 🌇 Time to relax" },
        { start: { h: 19, m: 0 }, message: "🍛 Dinner time! Eat well babies 🍗" },
        { start: { h: 21, m: 0 }, message: "Night vibes! 🌙 Almost bedtime 😴" },
        { start: { h: 22, m: 0 }, message: "10:00 pm, mag rerelapse na naman yung tanga dyan. 🥀" },
        { start: { h: 0, m: 0 }, message: "12 na tama na kakarelapse 💓" },
        { start: { h: 2, m: 0 }, message: "Late night alert! 🦉 Don't stay up too long baka pumanaw ka" },
        { start: { h: 4, m: 0 }, message: "Sunrise is comming 😍🌄" }
      ],
      weekend: "🎉 Happy weekend! Chill and enjoy your freedom 🏖️🍻",
      monday: "💼 Monday grind! Start the week strong 💪🔥",
      friday: "🎶 Friday night vibes! End the week with good energy, kasi wala nang pasok bukas 🕺💃"
    },
    acceptPending: { status: false, time: 10 },
    keepAlive: { status: true, interval: 1000 * 60 * 10 }
  };

  function autosetbio(config) {
    if (!config.status) return;
    try {
      api.changeBio(config.bio, (err) => {
        if (err) logger(`[setbio] Error: ${err}`);
        else logger(`[setbio] Changed bot bio to: ${config.bio}`);
      });
    } catch (error) {
      logger(`[setbio] Unexpected error: ${error}`);
    }
  }
  
  async function greetings(config) {
    if (!config.status) return;

    let sentToday = new Set();
    let currentDate = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Manila" });

    setInterval(async () => {
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
      const hour = now.getHours();
      const minute = now.getMinutes();
      const today = now.toLocaleDateString("en-US", { timeZone: "Asia/Manila" });

      logger(`[timecheck] Now: ${hour}:${minute}, Date: ${today}`);

      if (today !== currentDate) {
        sentToday.clear();
        currentDate = today;
      }

      const nowTotal = hour * 60 + minute;

      const match = config.schedule.find(s => {
      const startTotal = s.start.h * 60 + s.start.m;
      return nowTotal === startTotal || nowTotal === startTotal + 1;
      });
      if (match && !sentToday.has(match.message)) {
        try {
          const threads = await api.getThreadList(100, null, ["INBOX"]);
          const groupThreads = threads.filter(t => t.isGroup);
          for (const thread of groupThreads) {
            api.sendMessage(match.message, thread.threadID);
          }
          logger(`[greetings] Sent to ${groupThreads.length} groups: ${match.message}`);
          sentToday.add(match.message);
        } catch (err) {
          logger("[greetings] Error sending to groups:", err);
        }
      }

      const weekday = now.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Manila" });
      if (!sentToday.has(`day-${weekday}-${hour}-${minute}`)) {
        try {
          const threads = await api.getThreadList(100, null, ["INBOX"]);
          const groupThreads = threads.filter(t => t.isGroup);

     if ((weekday === "Saturday" || weekday === "Sunday") && hour === 9 && minute === 0) {
         for (const thread of groupThreads) api.sendMessage(config.weekend, thread.threadID);
         sentToday.add(`day-${weekday}-${hour}-${minute}`);
       } else if (weekday === "Monday" && hour === 8 && minute === 0) {
         for (const thread of groupThreads) api.sendMessage(config.monday, thread.threadID);
         sentToday.add(`day-${weekday}-${hour}-${minute}`);
       } else if (weekday === "Friday" && hour === 20 && minute === 0) {
         for (const thread of groupThreads) api.sendMessage(config.friday, thread.threadID);
         sentToday.add(`day-${weekday}-${hour}-${minute}`);
       }
     } catch (err) {
       logger("[greetings] Error sending weekly/daily greetings:", err);
       }
     }
    }, 1000 * 60); 
  }

  function acceptPending(config) {
    if (!config.status) return;
    setInterval(async () => {
      try {
        const list = [
          ...(await api.getThreadList(1, null, ["PENDING"])),
          ...(await api.getThreadList(1, null, ["OTHER"]))
        ];
        if (list[0]) {
          api.sendMessage("This thread was automatically approved by our system.", list[0].threadID);
          logger(`[pending] Approved thread: ${list[0].threadID}`);
        }
      } catch (err) {
        logger(`[pending] Error: ${err}`);
      }
    }, config.time * 60 * 1000);
  }

  // Keep session alive
  function keepAlive(config) {
    if (!config.status) return;
    setInterval(async () => {
      try {
        await api.getCurrentUserID();
        logger("[keepAlive] Session refreshed.");
      } catch (err) {
        logger("[keepAlive] Error refreshing session:", err);
      }
    }, config.interval);
  }

  // run all
  autosetbio(configCustom.autosetbio);
  greetings(configCustom.greetings);
  acceptPending(configCustom.acceptPending);
  keepAlive(configCustom.keepAlive);

  logger("[SYSTEM] Autosystem is running...");
};
