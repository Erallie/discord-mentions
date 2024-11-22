import { App, Modal, Plugin, PluginSettingTab, Setting, moment } from 'obsidian';

// Remember to rename these classes and interfaces!

interface DiscordMentionsSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: DiscordMentionsSettings = {
    mySetting: 'default'
}

export default class DiscordMentions extends Plugin {
    settings: DiscordMentionsSettings;
    async onload() {
        this.registerMarkdownPostProcessor((element, context) => {
            const paragraphs = element.findAll('p');

            for (let paragraph of paragraphs) {
                let text = paragraph.innerText.trim();
                const timestampRegex = /<t:(\d{10}):([dDtTfFR])>/g
                let match;
                while ((match = timestampRegex.exec(text)) !== null) {
                    let time = moment.utc(match[1], 'X', true);
                    let format;
                    let timeParsed = "";
                    switch (match[2]) {
                        case "d":
                            format = "L";
                            break;
                        case "D":
                            format = "LL";
                            break;
                        case "t":
                            format = "LT";
                            break;
                        case "T":
                            format = "LTS";
                            break;
                        case "f":
                            format = "LLL";
                            break;
                        case "F":
                            format = "LLLL";
                            break;
                        case "R":
                            timeParsed = time.fromNow();
                            break;
                    }
                    if (timeParsed !== "") {
                        timeParsed = time.format(format);
                    }
                    text.replace(match[0], timeParsed);
                }
                paragraph.textContent = text;
            }
        });
        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new DiscordMentionsSettingTab(this.app, this));
    }

    onunload() {

    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class DiscordMentionsSettingTab extends PluginSettingTab {
    plugin: DiscordMentions;

    constructor(app: App, plugin: DiscordMentions) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('UTC offset')
            .setDesc('It\'s a secret')
            .addText(text => text
                .setPlaceholder('Enter your secret')
                .setValue(this.plugin.settings.mySetting)
                .onChange(async (value) => {
                    this.plugin.settings.mySetting = value;
                    await this.plugin.saveSettings();
                }));
    }
}
