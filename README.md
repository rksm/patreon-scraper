## Overview

This downloads patreon posts from creators into local html files. Note that you will need a Patreon account and you will only be able to download the content that you can normally see on the web site anyway. Consider this to be an archival tool.

It uses headless chrome via puppeteer and not the official Patreon API.

See https://robert.kra.hn/posts/2019-11-29_patreon-scraper/ for more details.


## Prerequisites & setup

This has only been tested on macOS. It might work on Linux. It'll rather not work on Windows.

You will need [node.js](https://nodejs.org/en/).

Clone this repository and install the dependencies:

```shell
git clone https://github.com/rksm/patreon-scraper
cd patreon-scraper
npm i
```


## Usage

### Step 1: log into Patreon

Run

```shell
npx ts-node src/open_browser.ts
```

and enter your Patreon credentials. Those will be stored.

### Step 2: Check if the credentials / cookies were stored

```shell
npx ts-node src/open_browser.ts --check-cookies
```

This should print cookie data that has the `"name"` `"session_id"`.

### Step 3: Figure out the `campaign id` if the creator you want to download 

Use the base URL of the creator, e.g. for "darknetdiaries" run
```shell
npx ts-node src/fetch_campaign_id https://www.patreon.com/darknetdiaries/
```

which outputs

```
Looking for campaign_id...
The campaign_id of https://www.patreon.com/darknetdiaries (Jack Rhysider) is 1682532
```

### Step 4: Download the raw data

For "darknetdiaries" run:

```shell
npx ts-node ./src/fetch_data.ts --campaign_id 1682532 --data_dir darknetdiaries_data --patreon_url https://www.patreon.com/darknetdiaries/ --with-comments
```

This creates a directory `darknetdiaries_data` and puts the raw posts as a json file in there.


### Step 5: Render the data (optional)

You can render the json data into a html page, for "darknetdiaries" run:

```shell
npx ts-node ./src/render_data.ts  --campaign_id 1682532 --data_dir darknetdiaries_data --patreon_url https://www.patreon.com/darknetdiaries/
```

