import { EmbedBuilder, MessageFlags } from 'discord.js';
import { discordConfig } from '../../../../../config.js';
export class DaiPoll {
    constructor(title, author, channel, options, type, secret = 'n', duration) {
        this.title = title;
        this.type = type;
        this.timeStamp = Date.now();
        this.secret = secret === 'Y';
        this.channel = channel;
        this.author = author;
        this.duration = duration;
        this.end_time = this.timeStamp + duration * 1000;
        this.options = options.trim().split(',').map(o => o.trim());
        this.totalVotes = {
            totalVotes: 0,
            options: this.options.map((option) => ({
                name: option,
                votes: 0,
                users: [],
            })),
        };
        this.votersInfo = [];
        this.status = true;
        this.barLength = 13;
    }

    async updateRemainingTime(endTime) {
        const now = Date.now();
        const remainingTimeMs = endTime - now;
        if (remainingTimeMs <= 0) {
            return null;
        }
        const minutes = Math.floor(remainingTimeMs / 1000 / 60);
        const seconds = Math.floor((remainingTimeMs / 1000) % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    async embedPoll() {
        const defaultProgressBar = '⬛'.repeat(this.barLength);
        if (this.end_time !== undefined) {
            const remainingTime = await this.updateRemainingTime(this.end_time);
            this.remainingTime = remainingTime !== null ? remainingTime : undefined;
        }
        if (this.remainingTime === undefined) {
            this.remainingTime = '00:00';
        }
        if (this.remainingTime === null) {
            this.status = false;
        }
        const embed = new EmbedBuilder()
            .setDescription(`## 🗳️ ${this.title}\n` +
            `> **Tipo:** ${this.secret ? '🔒 Secreta' : '🔓 Pública'}\n` +
            `> **Estado:** ${this.status
                ? `<a:online:1288631919352877097> **Abierta** - **${this.remainingTime}**`
                : '<a:offline:1288631912180744205> **Votación finalizada**'}\n`)
            .setColor(discordConfig.COLOR || 0x0099ff)
            .setFooter({
                /* Comprueba si type= CD, XT o P, Si es CD, muestra: Delegación de Alumnos de Industriales - UVigo · Comisión Delegada,
                XT: Delegación de Alumnos de Industriales - UVigo · Xunta de Alumnado
                P: Delegación de Alumnos de Industriales - UVigo · Pública
                */
            text: 'Delegación de Alumnos de Industriales - UVigo · ' + (this.type === 'CD' ? 'Comisión Delegada' : this.type === 'XA' ? 'Xunta de Alumnado' : 'Pública'),
            iconURL: 'https://cdn.discordapp.com/emojis/1288628804276977735.webp?size=96&quality=lossless',
        })
            .setImage('https://i.imgur.com/8GkOfv1.png');

        if (this.secret && this.status) {
            this.options.forEach((option) => {
                embed.addFields({
                    name: `<:chat_ind:1288628721842130976> ${option}`,
                    value: '> **¿?** votos (**-%**)\n' + `> ${defaultProgressBar}`,
                    inline: false,
                });
            });
        } else {
            this.totalVotes.options.forEach((option) => {
                const percentage = this.totalVotes.totalVotes > 0
                    ? ((option.votes / this.totalVotes.totalVotes) * 100).toFixed(2)
                    : '0.00';
                const lengthBarFilled = Math.round(this.barLength * (Number(percentage) / 100));
                const bar = '🟦'.repeat(lengthBarFilled) + '⬛'.repeat(this.barLength - lengthBarFilled);
                embed.addFields({
                    name: `<:chat_ind:1288628721842130976> ${option.name}`,
                    value: `> **${option.votes}** votos (**${percentage}%**)\n> ${bar}`,
                    inline: false,
                });
            });
        }

        const listOfVoters = this.votersInfo.map((voter) => voter.userName);
        let votersValue;
        if (this.secret || !this.status) {
            votersValue = listOfVoters.length > 0
                ? '```' + listOfVoters.join(', ') + '```'
                : '```Nadie ha votado aún```';
        } else {
            votersValue = '```No ha terminado la votación```';
        }

        embed.addFields({
            name: `<:us:1288631396364976128> Votantes: ${this.totalVotes.totalVotes}`,
            value: votersValue,
            inline: true,
        });

        return embed;
    }

    async newVote(interaction, option) {
        if (!interaction.isCommand() && !interaction.isButton()) {
            return;
        }

        const userId = interaction.user?.id;
        const user = interaction.user;
        const member = interaction.member;
        const userName = member?.nickname || user.username;

        if (!userId || !user) {
            console.error('No se pudo obtener el usuario de la interacción.');
            return;
        }

        const hasVoted = this.votersInfo.some((voter) => voter.id === userId);
        if (hasVoted) {
            await interaction.followUp({
                content: '<:no:1288631410558767156> Ya has votado.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (!this.options.includes(option)) {
            await interaction.followUp({
                content: '<:no:1288631410558767156> Opción no válida.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        this.votersInfo.push({
            id: userId,
            user,
            userName,
            option,
        });

        this.totalVotes.options.forEach((opt) => {
            if (opt.name === option) {
                opt.votes += 1;
                opt.users.push(userName);
            }
        });

        this.totalVotes.totalVotes += 1;

        await interaction.followUp({
            content: `<:si:1288631406452412428> Has votado: **${option}**`,
            flags: MessageFlags.Ephemeral,
        });
    }
}
