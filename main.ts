import { App, Plugin, moment, Notice, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface DiscordTimestampsSettings {
    codeblocks: boolean;
}

const DEFAULT_SETTINGS: DiscordTimestampsSettings = {
    codeblocks: true
}

export default class DiscordTimestamps extends Plugin {
    settings: DiscordTimestampsSettings;

    async onload() {
        await this.loadSettings();
        const plugin = this;

        this.registerMarkdownPostProcessor((element, context) => {

            function replaceTimestamp(element: HTMLElement) {
                if (element.localName == "code" && plugin.settings.codeblocks == false) {
                    return;
                }
                else if (element.nodeType == element.TEXT_NODE) {
                    let text = element.textContent || "";
                    const originalText = text;
                    if (text == null || text == "") {
                        return element;
                    }
                    let match;
                    let textSlices: string[] = [];
                    let timestampSlices: string[] = [];
                    let timestampHover: string[] = [];
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
                        textSlices.push(text.slice(0, text.indexOf(match[0])))
                        text = text.slice(text.indexOf(match[0]) + match[0].length);
                        timestampSlices.push(timeParsed);
                        timestampHover.push(time.format("LLLL"));
                        // text = text.replace(match[0], timeParsed);
                        // let newElement = element;

                        // element.insertAdjacentHTML('beforeend', "testing")
                    }
                    if (text !== originalText) {
                        let newEl = new DocumentFragment;
                        for (let i = 0; i < textSlices.length; i++) {
                            if (i == 0) {
                                newEl.textContent = textSlices[i]
                            }
                            else {
                                newEl.appendText(textSlices[i]);
                            }
                            if (i < timestampSlices.length && i < timestampHover.length) {
                                let timestampEl = newEl.createEl('span', { text: timestampSlices[i], cls: 'discord-timestamps' });
                                timestampEl.ariaLabel = timestampHover[i];
                                timestampEl.ontouchend = (ev) => {
                                    new Notice(timestampHover[i]);
                                }
                            }
                            else if (timestampSlices.length !== timestampHover.length) {
                                console.error("The lengths of timestampSlices and timestampHover are NOT EQUAL!");
                            }
                        }
                        if (text !== "") {
                            newEl.appendText(text);
                        }

                        element.replaceWith(newEl);
                    }
                }
                else if (element.nodeType == element.ELEMENT_NODE) {
                    let child = element.firstChild as HTMLElement;
                    /* let children = Array.from(element.children);
                    for (let child of children) {
                        replaceTimestamp(child as HTMLElement)
                    } */
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

        const codeFrag = new DocumentFragment;
        codeFrag.textContent = 'Disable this to avoid converting timestamps within code blocks.'
        codeFrag.createEl('br');
        codeFrag.createEl('span', { text: 'Changing this requires reopening the active note.', cls: 'setting-error' })

        new Setting(containerEl)
            .setName('Convert code blocks')
            .setDesc(codeFrag)
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.codeblocks)
                    .onChange((value) => {
                        this.plugin.settings.codeblocks = value;
                        void this.plugin.saveSettings();
                        // await this.plugin.loadSettings();
                    })
            );
    }
}
