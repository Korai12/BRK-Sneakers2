FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only the application code needed for running (no seed scripts)
COPY app.py config.py models.py ./

# Expose the Flask port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV MONGO_URI=mongodb://mongo:27017/
ENV MONGO_DB=brk_sneakers

# Run the application
CMD ["python", "app.py"]