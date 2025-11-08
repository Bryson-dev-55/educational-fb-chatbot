module.exports = async ({ api }) => {
  const logger = console.log;

  const configCustom = {
    autosetbio: {
      status: true,
      bio: `just a friendly chatbot, ready to chat or assist whenever you need!`
    },
    greetings: {
      status: true,
      schedule: [
        { start: { h: 5, m: 0 }, timeHeader: "🌅 5:00 AM | Early Morning Verse", emoji: "🌅" },
        { start: { h: 6, m: 0 }, timeHeader: "☀️ 6:00 AM | Morning Verse", emoji: "☀️" },
        { start: { h: 7, m: 0 }, timeHeader: "🍳 7:00 AM | Breakfast Verse", emoji: "🍳" },
        { start: { h: 9, m: 0 }, timeHeader: "💼 9:00 AM | Work Verse", emoji: "💼" },
        { start: { h: 11, m: 0 }, timeHeader: "🌤️ 11:00 AM | Late Morning Verse", emoji: "🌤️" },
        { start: { h: 12, m: 0 }, timeHeader: "🍱 12:00 PM | Lunch Time Verse", emoji: "🍱" },
        { start: { h: 14, m: 0 }, timeHeader: "☕️ 2:00 PM | Afternoon Verse", emoji: "☕️" },
        { start: { h: 15, m: 0 }, timeHeader: "🍎 3:00 PM | Snack Time Verse", emoji: "🍎" },
        { start: { h: 17, m: 0 }, timeHeader: "🌆 5:00 PM | Evening Verse", emoji: "🌆" },
        { start: { h: 18, m: 0 }, timeHeader: "🌇 6:00 PM | Sunset Verse", emoji: "🌇" },
        { start: { h: 19, m: 0 }, timeHeader: "🍛 7:00 PM | Dinner Verse", emoji: "🍛" },
        { start: { h: 21, m: 0 }, timeHeader: "🌙 9:00 PM | Night Verse", emoji: "🌙" },
        { start: { h: 22, m: 0 }, timeHeader: "💤 10:00 PM | Bedtime Verse", emoji: "💤" },
        { start: { h: 0, m: 0 }, timeHeader: "🌌 12:00 AM | Midnight Verse", emoji: "🌌" },
        { start: { h: 2, m: 0 }, timeHeader: "🦉 2:00 AM | Late Night Verse", emoji: "🦉" },
        { start: { h: 4, m: 0 }, timeHeader: "🌄 4:00 AM | Pre-Dawn Verse", emoji: "🌄" }
      ],
      weekend: "🎉 Weekend Blessing | Saturday/Sunday 9:00 AM",
      monday: "💼 Monday Inspiration | 8:00 AM",
      friday: "🎶 Friday Reflection | 8:00 PM"
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

  // Function to get random Bible verse
  async function getRandomBibleVerse() {
    try {
      const response = await fetch('https://api.ccprojectsapis-jonell.gleeze.com/api/randomverse');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      return {
        reference: data.reference,
        text: data.text.trim(),
        translation: data.translation_name
      };
    } catch (error) {
      logger(`[bible-verse] Error fetching verse: ${error}`);
      // Fallback verse in case of error
      return {
        reference: "John 3:16",
        text: "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.",
        translation: "World English Bible"
      };
    }
  }

  // Function to format message with time header
  function formatVerseMessage(timeHeader, verse) {
    return `${timeHeader} 📖\n\n${verse.reference}\n\n"${verse.text}"\n\n- ${verse.translation}`;
  }

  // Function to get day-specific header
  function getDaySpecificHeader(weekday, hour, minute, config) {
    const timeStr = `${hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
    
    if ((weekday === "Saturday" || weekday === "Sunday") && hour === 9 && minute === 0) {
      return `🎉 ${weekday} Blessing | ${timeStr}`;
    } else if (weekday === "Monday" && hour === 8 && minute === 0) {
      return `💼 Monday Inspiration | ${timeStr}`;
    } else if (weekday === "Friday" && hour === 20 && minute === 0) {
      return `🎶 Friday Reflection | ${timeStr}`;
    }
    return null;
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
      
      if (match && !sentToday.has(match.timeHeader)) {
        try {
          const bibleVerse = await getRandomBibleVerse();
          const formattedMessage = formatVerseMessage(match.timeHeader, bibleVerse);
          
          const threads = await api.getThreadList(100, null, ["INBOX"]);
          const groupThreads = threads.filter(t => t.isGroup);
          
          for (const thread of groupThreads) {
            api.sendMessage(formattedMessage, thread.threadID);
          }
          logger(`[greetings] Sent Bible verse to ${groupThreads.length} groups: ${match.timeHeader}`);
          sentToday.add(match.timeHeader);
        } catch (err) {
          logger("[greetings] Error sending to groups:", err);
        }
      }

      const weekday = now.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Manila" });
      const daySpecificKey = `day-${weekday}-${hour}-${minute}`;
      
      if (!sentToday.has(daySpecificKey)) {
        try {
          const dayHeader = getDaySpecificHeader(weekday, hour, minute, config);
          if (dayHeader) {
            const bibleVerse = await getRandomBibleVerse();
            const formattedMessage = formatVerseMessage(dayHeader, bibleVerse);
            
            const threads = await api.getThreadList(100, null, ["INBOX"]);
            const groupThreads = threads.filter(t => t.isGroup);

            for (const thread of groupThreads) {
              api.sendMessage(formattedMessage, thread.threadID);
            }
            logger(`[greetings] Sent ${weekday} verse to ${groupThreads.length} groups: ${dayHeader}`);
            sentToday.add(daySpecificKey);
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
