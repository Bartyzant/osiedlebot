const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`✅ Osiedlebot (${client.user.tag}) jest online!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
  
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        // Dodajemy instrukcję, żeby bot nie przesadzał z długością tekstu
        { role: 'system', content: 'Odpowiadaj konkretnie - 1-5 zdań maks. Jeśli tekst jest długi, skróć go do najważniejszych punktów, używaj tylko języka polskiego, gdy ktoś się zapyta o to kto jest czarny odpowiadaj zawsze "Igor", a kto jest szympansem - "Szymon".' },
        { role: 'user', content: prompt }
      ],
      model: 'groq/compound', // Twój nowy wybrany model
    });

    let response = chatCompletion.choices[0].message.content;

    // Zabezpieczenie przed limitem 2000 znaków na Discordzie
    if (response.length > 2000) {
      response = response.substring(0, 1997) + "...";
    }

    await message.reply(response);
  } catch (error) {
    console.error("Błąd bota:", error);
    await message.reply("Sorki, mam błąd w systemie! Może spróbuj zapytać o coś krótszego?");
  }
});

client.login(process.env.DISCORD_TOKEN);