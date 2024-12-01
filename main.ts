import { App, Plugin, Modal, Editor, EditorPosition, MarkdownView, moment, Notice, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface DiscordTimestampsSettings {
    codeblocks: boolean;
    mdCodeblocks: boolean;
}

const DEFAULT_SETTINGS: DiscordTimestampsSettings = {
    codeblocks: false,
    mdCodeblocks: true
}

export default class DiscordTimestamps extends Plugin {
    settings: DiscordTimestampsSettings;

    async onload() {
        await this.loadSettings();
        const plugin = this;

        function processTimestamp(match: RegExpExecArray) {
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
                    return null;
            }
            if (timeParsed == "") {
                timeParsed = time.format(format);
            }
            return {
                timeParsed: timeParsed,
                full: time.format("LLLL")
            };
        }

        function replaceTimestamp(element: HTMLElement) {
            if (element.localName == "code" && (plugin.settings.codeblocks == false || (element.hasClass('language-md') && plugin.settings.mdCodeblocks == true))) {
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
                while ((match = /<t:(\d{9,10}):([dDtTfFR])>/g.exec(text)) !== null) {
                    let timestamp = processTimestamp(match);

                    if (timestamp === null)
                        continue;

                    textSlices.push(text.slice(0, text.indexOf(match[0])))
                    text = text.slice(text.indexOf(match[0]) + match[0].length);
                    timestampSlices.push(timestamp.timeParsed);
                    timestampHover.push(timestamp.full);
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

        this.registerMarkdownPostProcessor((element, context) => {
            replaceTimestamp(element);
        });

        this.registerMarkdownPostProcessor((element, context) => {
            if (!plugin.settings.mdCodeblocks)
                return;

            let elements = element.findAll('code span.token.tag');

            for (let el of elements) {
                let text = el.textContent;
                if (!text)
                    continue;
                const match = /^<t:(\d{9,10}):([dDtTfFR])>$/.exec(text);
                if (!match)
                    continue;

                let timestamp = processTimestamp(match);

                if (timestamp === null)
                    continue;

                let newEl = new DocumentFragment

                let timestampEl = newEl.createEl('span', { text: timestamp.timeParsed, cls: 'discord-timestamps' });
                let timestampHover = timestamp.full;
                timestampEl.ariaLabel = timestampHover;
                timestampEl.ontouchend = (ev) => {
                    new Notice(timestampHover);
                }

                el.replaceWith(newEl);
            }

            let elements2 = element.findAll('code span.token.content');
            for (let el of elements2) {
                replaceTimestamp(el);
            }
        }, 1000)

        this.addCommand({
            id: 'insert-timestamp',
            name: 'Insert Discord timestamp',
            icon: 'lucide-alarm-clock-plus',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                new TimestampModal(this.app, editor, view, editor.getCursor()).open();
            }
        })

        this.registerEvent( //on editor menu
            this.app.workspace.on("editor-menu", (menu, editor, info) => {
                menu.addSeparator();

                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (view) {
                    menu.addItem(item => {
                        item
                            .setTitle('Insert Discord timestamp')
                            .setIcon('lucide-alarm-clock-plus')
                            .onClick(() => {
                                new TimestampModal(this.app, editor, view, editor.getCursor()).open();
                            })
                    });
                }

            })

        );

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

class TimestampModal extends Modal {
    editor: Editor;
    view: MarkdownView;
    cursor: EditorPosition;

    constructor(app: App, editor: Editor, view: MarkdownView, cursor: EditorPosition) {
        super(app);
        this.editor = editor;
        this.view = view;
        this.cursor = cursor;
    }

    onOpen() {
        const { contentEl, editor, view, cursor } = this;
        const modal = this;
        // contentEl.setText('Woah!');
        let inputDiv = contentEl.createDiv();
        inputDiv.addClass('timestamp-input-div')
        inputDiv.createEl('label', { text: 'Choose a time', cls: 'timestamp-label' });
        let input = inputDiv.createEl('input', {
            cls: 'timestamp-input',
            attr: {
                type: 'datetime-local'
            }
        })
        const now = moment();
        input.defaultValue = now.format("YYYY-MM-DD[T]kk:mm:ss");

        contentEl.createEl('h2', { text: 'Pick your format', cls: 'timestamp-button-heading' })

        const div = contentEl.createDiv();

        // div.addClass('hide');

        div.addClass('timestamp-button-container')

        /* let child = div.firstChild as HTMLElement;
        while (child) {
            const nextChild = child.nextSibling;
            child.addClass('timestamp-buttons');
            child = nextChild as HTMLElement;
        } */

        function setClickEvents(date: moment.Moment) {
            div.empty();
            //#region add buttons
            const button_d = div.createEl('button');
            button_d.id = "d";
            const button_D = div.createEl('button');
            button_D.id = "D";
            const button_t = div.createEl('button');
            button_t.id = "t";
            const button_T = div.createEl('button');
            button_T.id = "T";
            const button_f = div.createEl('button');
            button_f.id = "f";
            const button_F = div.createEl('button');
            button_F.id = "F";
            const button_R = div.createEl('button');
            button_R.id = "R";
            const button_unix = div.createEl('button');
            button_unix.id = "unix";
            //#endregion

            //#region set button content
            button_d.textContent = date.format('L');
            button_D.textContent = date.format('LL');
            button_t.textContent = date.format('LT');
            button_T.textContent = date.format('LTS');
            button_f.textContent = date.format('LLL');
            button_F.textContent = date.format('LLLL');
            button_R.textContent = date.fromNow();
            button_unix.textContent = date.format('X');
            //#endregion

            let child = div.firstChild as HTMLElement;
            while (child) {
                const nextChild = child.nextSibling;
                child.addClass('timestamp-buttons');
                child.onClickEvent((ev) => {
                    let insertedText: string;
                    // console.log('got here')
                    let button = ev.currentTarget as HTMLButtonElement;
                    // console.log(child);
                    if (button.id == "unix")//
                        insertedText = date.format('X');
                    else
                        insertedText = `<t:${date.format('X')}:${button.id}>`;
                    editor.replaceSelection(insertedText);
                    editor.setCursor(cursor.line, cursor.ch + insertedText.length);
                    modal.close();
                })
                child = nextChild as HTMLElement;
            }
        }

        setClickEvents(now);

        input.onchange = (ev: Event) => {
            // div.removeClass('hide');
            const value = (ev.target as HTMLInputElement).value;
            const date = moment(value, "YYYY-MM-DD[T]HH:mm")

            setClickEvents(date);
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
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

        const mdCode = new DocumentFragment;
        mdCode.textContent = 'Enable this to override markdown code blocks with this plugin\'s default class and appearance when converting timestamps.'
        mdCode.createEl('br');
        mdCode.createEl('span', { text: 'Changing this requires reopening the active note.', cls: 'setting-error' })
        new Setting(containerEl)
            .setName('Override markdown code blocks')
            .setDesc(mdCode)
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.mdCodeblocks)
                    .onChange((value) => {
                        this.plugin.settings.mdCodeblocks = value;
                        void this.plugin.saveSettings();
                        // await this.plugin.loadSettings();
                    })
            );
    }
}
