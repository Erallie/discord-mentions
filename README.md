# Discord Timestamps
This is a plugin for [Obsidian](https://obsidian.md/) that displays **Discord Timestamps** (eg. `<t:1734818400:D>`) in **reading mode** the way they would display in Discord.

As long as this plugin is **enabled**, it converts those timestamps throughout the entire note when viewing it in **reading mode**. You can optionally disable converting timestamps in codeblocks under **Settings → Discord Timestamps → Convert code blocks**.
## Appearance
Just like in Discord, the timestamp will have a **colored background** to it. If you **hover** over the timestamp (on desktop) or **select** the timestamp (on mobile), the full date and time will be displayed.
## Insert timestamp
There is also a **command** in the [Command palette](https://help.obsidian.md/Plugins/Command+palette) as well as in the editor context menu to **insert a timestamp** when you are currently editing a note.

After you select a date and time in the modal that opens, it **generates timestamps** for you to use. Then you just select one, and it **inserts it into your note** at your cursor’s location.
# Installation
## Obsidian Marketplace
To install this plugin via the Obsidian Marketplace, perform the following steps:
1. Navigate to the Discord Timestamps page by either selecting [this link](https://obsidian.md/plugins?id=discord-timestamps) or doing the following:
	1. Navigate to **Settings → Community plugins**
	2. Select **Turn on community plugins**.
	3. Select **Community plugins → Browse** and search for "Discord Timestamps".
2. Select **Install**.
3. To enable the plugin, select **Enable**.
## BRAT
To install this plugin using [BRAT](https://obsidian.md/plugins?id=obsidian42-brat), follow these steps:
1. Make sure the [BRAT](https://obsidian.md/plugins?id=obsidian42-brat) plugin is installed in your vault.
2. Go to **Settings → BRAT → Beta Plugin List → Add Beta Plugin**
3. Enter `https://github.com/Erallie/discord-timestamps` into the input field and select **Add Plugin**.
## Manual installation
To install this plugin manually, follow these steps:
1. Go to the [Releases](https://github.com/Erallie/discord-timestamps/releases) page and find the latest release.
2. Download `main.js`, `manifest.json`, and `styles.css`.
3. Go to your **Plugins folder** (`[vault root]/.obsidian/plugins`) and create a new subfolder called `discord-timestamps`.
4. Move the downloaded files to the new folder.