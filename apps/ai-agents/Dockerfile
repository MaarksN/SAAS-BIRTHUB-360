FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for psycopg2 and curl for healthcheck
RUN apt-get update && apt-get install -y gcc libpq-dev curl && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY apps/ai-agents/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY apps/ai-agents/ .

# Copy prisma schema to root for potential use
COPY packages/database/prisma/schema.prisma ./schema.prisma

# Expose port
EXPOSE 8000

# Run uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
