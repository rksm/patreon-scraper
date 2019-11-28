.PHONY: clean chrome noclip

CHROME_BIN=/usr/bin/chromium-browser

visit_noclip:
	ts-node open_browser.ts

check_noclip_session:
	ts-node open_browser.ts --check-cookies


# chrome:
# 	$(CHROME_BIN) \
# 	  --remote-debugging-port=9222 \
# 	  --no-first-run \
# 	  --user-data-dir=./user_data

INDEX_FILE := "$(shell date +%F)_index.html"

noclip_data/$(INDEX_FILE):
	./noclip_update.sh

noclip: noclip_data/$(INDEX_FILE)


# clean:
# 	rm -rf target .cpcache bin
