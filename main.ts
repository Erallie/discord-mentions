import { App, Modal, Plugin, PluginSettingTab, Setting, moment } from 'obsidian';

// Remember to rename these classes and interfaces!

interface DiscordTimestampsSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: DiscordTimestampsSettings = {
    mySetting: 'default'
}

export default class DiscordTimestamps extends Plugin {
    settings: DiscordTimestampsSettings;
    async onload() {
        this.registerMarkdownPostProcessor((element, context) => {

            function replaceTimestamp(element: Element) {
                let text = element.textContent;
                if (text == null) {
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
                    }
                    if (timeParsed == "") {
                        timeParsed = time.format(format);
                    }
                    if (timeParsed !== "") {
                        text = text.replace(match[0], timeParsed);
                    }
                }
                element.textContent = text;
                return element;
            }

            const allElements = element.findAll("*");
            // const elementsArray = Array.from(allElements)
            for (let thisElement of allElements) {
                let text = thisElement.textContent;
                if (text == null) {
                    return;
                }
                const newElement = replaceTimestamp(thisElement);

                thisElement.replaceWith(newElement);
            }

            /* function replaceElement(tag: keyof HTMLElementTagNameMap) {
                const allElements = element.findAll("h2");
                const elementsArray = Array.from(allElements)
                for (let thisElement of elementsArray) {
                    let text = thisElement.textContent;
                    if (text == null) {
                        return;
                    }
                    const newElement = replaceTimestamp(thisElement);

                    thisElement.replaceWith(newElement);
                }
            }
            replaceElement('p');
            replaceElement('span');
            replaceElement('li');
            replaceElement('strong');
            replaceElement('em');
            replaceElement('code');
            replaceElement('h1');
            replaceElement('h2');
            replaceElement('h3');
            replaceElement('h4');
            replaceElement('h5');
            replaceElement('h6'); */
        });
        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new DiscordTimestampsSettingTab(this.app, this));
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

class DiscordTimestampsSettingTab extends PluginSettingTab {
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
}
