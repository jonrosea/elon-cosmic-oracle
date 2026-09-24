# Elon's Cosmic Oracle

A static carnival fortune booth with a Mars-neon paint job. You enter a name, a birthday, and a star sign. A crystal ball spins, a paper slip unfurls, and the same words are read aloud with the Web Speech API.

The boothkeeper is a stylized SVG illustration. There are no photographs.

## Run

From this directory:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`. `fortunes.json` is loaded with `fetch`, so opening `index.html` as a `file://` URL will not load the ledger.

## What you get

1. Name, birthday, and star sign. The sign fills in from the birthday and stays editable.
2. Submit spins the crystal ball, then a paper slip unfurls with Career, Heart, and Cosmos, a short quip, and a star-chart blurb.
3. The slip is spoken once when it finishes opening. **Hear Elon read it** speaks that same text again. The picker prefers a deeper male English voice when the browser has one, and lowers the pitch.
4. **Copy reading** puts that same text on the clipboard.
5. The page reflows for a narrow screen.

Same initials, birthday, and sign always draw the same fortunes. Initials are the first letter or digit of each word, uppercased. The key is:

```text
INITIALS|YYYY-MM-DD|Sign
```

Example: `Ada Lovelace`, `1815-12-10`, and `Sagittarius` hash as `AL|1815-12-10|Sagittarius`. Two different full names can share a reading when those three inputs match. The name is still printed on the slip.

The hash is FNV-1a (32-bit). A mulberry32 stream then picks, without replacement:

- 2 career lines
- 2 love lines (the Heart section)
- 1 space line, 1 wealth line, and 1 risk line (the Cosmos section)
- 1 humor line

`fortunes.json` holds those six categories. Star-chart blurbs live in `app.js` and are chosen only by sign. They are labeled as entertainment.

## Files

- `index.html` — booth, form, slip
- `styles.css` — neon fair styling and the unfurl
- `app.js` — zodiac, deterministic reading, speech, copy
- `fortunes.json` — the fortune ledger
- `README.md` — this note

## Disclaimer

Entertainment only. Nothing on the slip is medical, legal, financial, romantic, or scientific advice. The star chart is not astronomy. The drawing is not a photograph and not an endorsement.
