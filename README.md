# WriterApp

A minimalist, distraction-free writing app that runs entirely in your browser.
Write over a calm background, pick a font, watch your word count, and save or
load your work as a plain `.txt` file. Nothing ever leaves your machine.

## Running it

Serve the directory with any static file server and open it in a browser:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000/
```

(Opening `index.html` directly via `file://` mostly works too, but some
browsers restrict the File API on `file://` pages, so a local server is
recommended.)
