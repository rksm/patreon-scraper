.PHONY: visit_patreon check_session noclip

visit_patreon:
	ts-node open_browser.ts

check_session:
	ts-node open_browser.ts --check-cookies

INDEX_FILE := "$(shell date +%F)_index.html"

# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

noclip_data/$(INDEX_FILE):
	./update_noclip.sh

noclip: noclip_data/$(INDEX_FILE)

# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

darkneddiaries_data/$(INDEX_FILE):
	./update_darknetdiaries.sh

darkneddiaries: darkneddiaries_data/$(INDEX_FILE)
