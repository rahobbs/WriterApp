# WriterApp

A minimalist, distraction-free writing app that runs entirely in your browser.
Write over a calm background, pick a font, watch your word count, and save or
load your work as a plain `.txt` file. Nothing ever leaves your machine.

Your draft autosaves to the browser's local storage as you type, so a refresh
or crash won't lose your work. Preferences (font, size, background) persist
the same way. `Ctrl+S` (or `Cmd+S`) downloads the current text as a file.

No frameworks, no build step — just `index.html`, `style.css`, and
`editor.js`.

## Running it

Serve the directory with any static file server and open it in a browser:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000/
```

(Opening `index.html` directly via `file://` mostly works too, but some
browsers restrict the File API on `file://` pages, so a local server is
recommended.)

## History

This started as a 2012-era jQuery + Bootstrap project. The original version
is preserved in git history at the `original-2012` tag.
