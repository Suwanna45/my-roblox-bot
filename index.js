require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // Application ID
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID = process.env.UNIVERSE_ID;
const TOPIC = "GlobalAnnouncement"; // Must match Roblox script

// Register Slash Command
const commands = [
    {
        name: 'announce',
        description: 'Send a global announcement to Roblox servers',
    },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        // Note: For production specific guild, use Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID) for faster updates
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'announce') {
            const modal = new ModalBuilder()
                .setCustomId('announceModal')
                .setTitle('Global Roblox Announcement');

            const titleInput = new TextInputBuilder()
                .setCustomId('titleInput')
                .setLabel("Headline / Title")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("BREAKING NEWS");

            const messageInput = new TextInputBuilder()
                .setCustomId('messageInput')
                .setLabel("Message Content")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("Server restart in 5 minutes...");

            const durationInput = new TextInputBuilder()
                .setCustomId('durationInput')
                .setLabel("Duration (seconds)")
                .setStyle(TextInputStyle.Short)
                .setValue("10");

            const soundIdInput = new TextInputBuilder()
                .setCustomId('soundIdInput')
                .setLabel("Sound ID (Optional)")
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(titleInput),
                new ActionRowBuilder().addComponents(messageInput),
                new ActionRowBuilder().addComponents(durationInput),
                new ActionRowBuilder().addComponents(soundIdInput)
            );

            await interaction.showModal(modal);
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'announceModal') {
            const title = interaction.fields.getTextInputValue('titleInput');
            const message = interaction.fields.getTextInputValue('messageInput');
            const duration = parseInt(interaction.fields.getTextInputValue('durationInput')) || 10;
            const soundId = interaction.fields.getTextInputValue('soundIdInput') || "";

            // Confirmation Embed
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('📢 Confirm Announcement?')
                .setDescription(`**Title:** ${title}\n**Message:** ${message}\n**Duration:** ${duration}s\n**Sound ID:** ${soundId || "None"}`)
                .setFooter({ text: 'This will act as a global alert to all active servers.' });

            const confirmBtn = new ButtonBuilder()
                .setCustomId('confirmAnnounce')
                .setLabel('Confirm & Send')
                .setStyle(ButtonStyle.Success);

            const cancelBtn = new ButtonBuilder()
                .setCustomId('cancelAnnounce')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

            const response = await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true, // Only user can see this
                fetchReply: true
            });

            // Collector for buttons
            const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'confirmAnnounce') {
                    await i.deferUpdate();

                    // Send to Roblox Open Cloud
                    try {
                        const payload = {
                            message: JSON.stringify({
                                Type: "Urgent",
                                Title: title,
                                Message: message,
                                Duration: duration,
                                SoundID: soundId
                            })
                        };

                        await axios.post(
                            `https://apis.roblox.com/messaging-service/v1/universes/${UNIVERSE_ID}/topics/${TOPIC}`,
                            payload,
                            {
                                headers: {
                                    'x-api-key': ROBLOX_API_KEY,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        await i.editReply({ content: '✅ **Announcement Sent Successfully!**', embeds: [], components: [] });
                    } catch (error) {
                        console.error("Roblox API Error:", error.response ? error.response.data : error.message);
                        await i.editReply({ content: `❌ **Failed to send:** ${error.message}`, components: [] });
                    }

                } else if (i.customId === 'cancelAnnounce') {
                    await i.update({ content: '🚫 **Announcement Cancelled.**', embeds: [], components: [] });
                }
            });
        }
    }
});

client.login(TOKEN);

// --- WEB SERVER FOR 24/7 HOSTING ---
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Discord Bot is Online!');
});

app.listen(port, () => {
    console.log(`Web server running on port ${port}`);
});


// --- WEB SERVER FOR 24/7 HOSTING ---
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Discord Bot is Online!');
});

app.listen(port, () => {
    console.log(`Web server running on port ${port}`);
});

