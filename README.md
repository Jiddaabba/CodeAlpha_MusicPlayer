# JiddaBeats 🎧
A responsive music-player website built with **HTML, CSS, and vanilla JavaScript**. No framework or build step is required.

## Features
- Dark and light themes (saved in local storage)
- Responsive sidebar with a mobile slide-out menu
- Demo audio tracks with play/pause, previous/next, seeking, volume and mute
- Shuffle and repeat off/all/one modes with active-state indicators
- Search by track title, artist, album, or genre
- Favorites saved in local storage
- Featured playlists and custom playlist creation
- Add current track to a playlist
- Play queue with track selection
- Recently played list
- Discover search using the iTunes Search API preview catalogue, plus quick genre searches
- Share current tracks using the device share sheet or a copy-link fallback
- Download button that only activates for tracks explicitly marked downloadable
- Import and play audio files from your device during the current browser session
- Keyboard shortcuts: `/` focuses search; `Space` toggles playback when focus is not in a form/control
- Reduced-motion preference support and accessible labels on key controls

## Run locally
1. Download and unzip `JiddaBeats.zip`.
2. Open `index.html` in a modern browser.
3. Connect to the internet for remote artwork and the demo audio files.

You can also publish the three files to GitHub Pages: upload `index.html`, `style.css`, and `script.js` to the repository root, then enable Pages from the repository settings.

## Audio and licensing
This prototype uses SoundHelix sample MP3 URLs for demonstration and Unsplash image URLs for artwork. These are external resources and require an internet connection. Before public/commercial distribution, replace demo tracks with audio you own or have permission to stream, and verify the license/terms for each audio and artwork asset. The example track names and artists are demo metadata.

## Customize the library
Edit the `TRACKS` array at the top of `script.js`. Each track needs:
- `id`: unique ID
- `title`, `artist`, `album`, `genre`
- `cover`: image URL
- `audio`: playable audio URL

For a fully offline version, place your licensed audio and image files in local folders and update `audio` and `cover` paths accordingly.

## Discovery, sharing, and downloads
- The Discover page searches the public iTunes Search API and plays the preview URL returned by the catalogue. These are previews, not a promise of full-track streaming. The search needs an internet connection and may be unavailable in some environments.
- Share uses the Web Share API when available, then falls back to copying a source link where clipboard permissions allow it.
- Download is deliberately disabled for demo and catalogue preview streams unless a track is explicitly marked `downloadable: true`. Local files imported by the user can be downloaded again during the current session; browser blob URLs do not survive a page refresh.
- Imported device files remain local to the current browser session. They are not uploaded to a server.

## Current prototype limits
- Favorites, theme, recently played, and custom playlists are stored in the current browser only.
- The queue and imported local files are session-only; there is no account sync or backend.
- The discovery catalogue is not an Audiomack integration and does not unlock copyrighted full tracks. Use a licensed music provider or your own authorised catalogue for production streaming.
- No login, lyrics service, artist-following backend, or server-side playlist sync is included.
