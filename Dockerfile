# Use official Python 3.11 slim image
FROM python:3.11-slim

# Set working directory to backend folder
WORKDIR /app/backend

# Copy only requirements first for layer caching
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the entire backend folder into the container
COPY backend/ /app/backend/

# Expose port (Railway injects $PORT at runtime)
EXPOSE 8000

# Start uvicorn from the backend directory (so relative imports work)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
