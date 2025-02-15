.PHONY: all build test check debug run help doc

CARGO = cargo

all: test build

build:
	# We use 'portable' feature to avoid SIGILL crashes
	${CARGO} build --release --features portable,bundle_openssl
	cp ../target/release/mithril-signer .

run: build
	./mithril-signer

debug:
	${CARGO} run -- -vvv

test:
	${CARGO} test

check:
	${CARGO} check --release --all-features --all-targets
	${CARGO} clippy --release --all-features --all-targets
	${CARGO} fmt --check

help:
	@${CARGO} run -- -h

doc:
	${CARGO} doc --no-deps --open

docker-build:
	cd ../ && docker build -t mithril/mithril-signer -f mithril-signer/Dockerfile .

docker-build-ci: build
	cd ../ && docker build -t mithril/mithril-signer -f mithril-signer/Dockerfile.ci --build-arg DOCKER_IMAGE_FROM .

docker-run:
	docker run --rm --name='mithril-signer' mithril/mithril-signer