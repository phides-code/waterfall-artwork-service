.PHONY: build
build:
	sam build

build-WaterfallArtworksFunction:
	npm install
	tsc
	cp -r dist/* $(ARTIFACTS_DIR)/
	# third-party dependencies need to be included in node_modules
	mkdir $(ARTIFACTS_DIR)/node_modules
	cp -r node_modules/canvas $(ARTIFACTS_DIR)/node_modules

.PHONY: init
init: build
	sam deploy --guided

.PHONY: deploy
deploy: build
	sam deploy

.PHONY: delete
delete:
	sam delete
