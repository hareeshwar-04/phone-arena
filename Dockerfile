FROM mcr.microsoft.com/playwright/python:v1.42.0-jammy

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install the browsers
RUN playwright install chromium
RUN playwright install-deps

COPY scripts/scraper_api.py ./scripts/

# Expose the port
EXPOSE 8000

# Run the API
CMD ["uvicorn", "scripts.scraper_api:app", "--host", "0.0.0.0", "--port", "8000"]
