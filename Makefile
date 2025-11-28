.PHONY: build
build:
	sam build

build-WaterfallArtworksFunction:
	npm install
	tsc
	cp -r dist/* $(ARTIFACTS_DIR)/

.PHONY: init
init: build
	sam deploy --guided

.PHONY: deploy
deploy: build
	sam deploy --no-fail-on-empty-changeset

.PHONY: delete
delete:
	sam delete
