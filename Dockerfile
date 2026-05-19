FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY scraper_api.py .

# Expose the port
EXPOSE 7860

# Run the API
CMD ["uvicorn", "scraper_api:app", "--host", "0.0.0.0", "--port", "7860"]
