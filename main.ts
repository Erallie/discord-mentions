import { Plugin, moment } from 'obsidian';

// Remember to rename these classes and interfaces!

/* interface DiscordTimestampsSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: DiscordTimestampsSettings = {
    mySetting: 'default'
} */

export default class DiscordTimestamps extends Plugin {
    // settings: DiscordTimestampsSettings;
    async onload() {
        this.registerMarkdownPostProcessor((element, context) => {

            function replaceTimestamp(element: HTMLElement) {
                if (element.nodeType == element.TEXT_NODE) {
                    let text = element.textContent || "";
                    const originalText = text;
                    if (text == null || text == "") {
                        return element;
                    }
                    let match;
                    while ((match = /<t:(\d{10}):([dDtTfFR])>/g.exec(text)) !== null) {
                        let time = moment(match[1], 'X', true);
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
                            default:
                                continue;
                        }
                        if (timeParsed == "") {
                            timeParsed = time.format(format);
                        }
                        text = text.replace(match[0], timeParsed);
                    }
                    if (text !== originalText) {
                        element.textContent = text;
                    }
                }
                else if (element.nodeType == element.ELEMENT_NODE) {
                    let child = element.firstChild as HTMLElement;
                    while (child) {
                        const nextChild = child.nextSibling;
                        replaceTimestamp(child);
                        child = nextChild as HTMLElement;
                    }
                }
            }

            replaceTimestamp(element);

        });
        // This adds a settings tab so the user can configure various aspects of the plugin
        // this.addSettingTab(new DiscordTimestampsSettingTab(this.app, this));
    }

    onunload() {

    }

    /* async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    } */
}

/* class DiscordTimestampsSettingTab extends PluginSettingTab {
    plugin: DiscordTimestamps;

    constructor(app: App, plugin: DiscordTimestamps) {
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
} */
