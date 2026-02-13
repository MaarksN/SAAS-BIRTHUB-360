.PHONY: setup dev test lint clean migrate seed

# Setup local environment
setup:
	@echo "Setting up development environment..."
	# Ensure .env exists
	cp -n apps/web/.env.example apps/web/.env || true
	cp -n apps/ai-agents/.env.example apps/ai-agents/.env || true
	# Start infrastructure
	docker-compose -f docker-compose.dev.yml up -d
	# Install JS dependencies
	npm install
	# Install Python dependencies
	pip install -r apps/ai-agents/requirements.txt
	# Database setup
	npx prisma generate --schema=libs/core/src/schema.prisma
	npx prisma migrate dev --schema=libs/core/src/schema.prisma
	npx prisma db seed --schema=libs/core/src/schema.prisma

# Run development servers
dev:
	npx turbo dev

# Run tests
test:
	npx turbo test
	pytest apps/ai-agents

# Run linter
lint:
	npx turbo lint
	flake8 apps/ai-agents

# Clean build artifacts
clean:
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf libs/*/node_modules
	rm -rf .next
	rm -rf apps/*/.next
	rm -rf dist
	rm -rf apps/*/dist
	find . -type d -name "__pycache__" -exec rm -rf {} +
