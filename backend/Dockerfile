# Multi-stage build for optimized image
FROM python:3.12-slim as builder
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final stage
FROM python:3.12-slim
WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install runtime dependencies (including postgresql-client for pg_isready)
RUN apt-get update && apt-get install -y \
    libpq5 \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code with proper ownership
COPY --chown=appuser:appuser . .

# Make entrypoint executable (as root, before switching user)
RUN chmod +x /app/docker-entrypoint.sh

# Update PATH for appuser
ENV PATH=/home/appuser/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]