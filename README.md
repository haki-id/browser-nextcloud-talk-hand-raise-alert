# Nextcloud Talk Hand Raise Alert

A browser extension that alerts moderators when participants raise their hand during a Nextcloud Talk call. When someone raises their hand, you'll hear an audio alert and see a visual notification — so you never miss a raised hand again.

## Features

- 🔔 **Audio alert** when a new hand is raised
- 👁️ **Visual notification** showing who raised their hand
- 📋 **Live list** in the popup showing all raised hands, oldest first
- ⏱️ **Timer** showing how long each person has had their hand raised
- ⚙️ **Configurable** — toggle sound/visuals, adjust volume, enable repeat alerts

## Installation (Chrome / Chromium / Brave / Edge)

### Step 1 — Download the extension

1. On this page, click the green **Code** button
2. Select **Download ZIP**
3. Unzip the file somewhere permanent on your computer — for example your Documents folder
4. **Do not delete the folder after installing** — your browser loads the extension directly from it

### Step 2 — Load into your browser

1. Open your browser and go to: `chrome://extensions/`
2. Turn on **Developer mode** using the toggle in the top-right corner
3. Click **"Load unpacked"**
4. Navigate to and select the `chrome` folder inside the unzipped folder
5. The extension will appear with a green alert icon — pin it to your toolbar by clicking the 🧩 puzzle piece icon and pinning it

### Step 3 — Test it

1. Join a Nextcloud Talk call
2. Click somewhere on the page (required to unlock audio in Chrome)
3. Click the green **!** extension icon in your toolbar
4. Click **Test Alert** — you should hear a two-tone beep and see a green notification

## Usage

Once installed, the extension works automatically on any Nextcloud Talk call:

- When a participant raises their hand you'll hear an alert and see a green notification in the top-right corner of the screen
- Click the **green ! icon** in your toolbar to open the panel, which shows everyone with their hand raised and how long they've been waiting
- Hands are listed oldest first — so you always know who has been waiting longest
- Click the notification to dismiss it

## Settings

Click the extension icon in your toolbar to access settings:

| Setting | Description |
|---|---|
| Sound alerts | Toggle audio on/off |
| Visual notifications | Toggle on-screen popup on/off |
| Repeat alert every 8s | Keep alerting while hands remain raised |
| Volume | Adjust alert volume |
| Test Alert | Verify the extension is working |

## Troubleshooting

**No sound when a hand is raised**
Chrome requires a user interaction before playing audio. Make sure you click somewhere on the Nextcloud Talk page after joining the call.

**The extension isn't detecting raised hands**
Open the browser console (F12) and check for a message saying `[Talk Hand Alert] Content script loaded`. If you don't see it, try refreshing the page.

**The popup shows "Not on a Nextcloud Talk call"**
Make sure your active tab is a Nextcloud Talk page when you click the extension icon.

**Names show as "Unknown participant"**
This may happen if your version of Nextcloud Talk has a different interface structure. Please open an issue so we can fix it.

## Compatibility

| Browser | Supported |
|---|---|
| Chrome | ✅ |
| Chromium | ✅ |
| Brave | ✅ |
| Edge | ✅ |
| Safari | 🔜 Coming soon |
| Firefox | 🔜 Planned |

## How It Works

The extension monitors the Nextcloud Talk participant list for raised hand indicators. When a new raised hand is detected it plays an audio alert and shows a visual notification. The popup displays a live timestamped list of all raised hands, updating every few seconds.

No data is collected or transmitted. Everything runs locally in your browser.

## License

MIT License — free to use, modify, and distribute.
