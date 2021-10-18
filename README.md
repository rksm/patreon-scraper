This downloads patreon posts into local html files.

It uses headless chrome via puppeteer and not the official Patreon API.

## Setup

```shell
$ git clone https://github.com/rksm/patreon-scraper
$ cd patreon-scraper
# npm install
```

## Usage

To have the login data, first run `make visit_patreon` and login manually. Close
the browser. Run `make check_session` to see if a session cookie can be found.
You can now scrape posts ang generate html files as e.g. in `update_noclip.sh`.
