#Dockerfile για το backend,το οποιο δημιουργεί ένα Docker image που περιέχει την Flask εφαρμογή με όλες τις εξαρτήσεις.
FROM python:3.10-slim

WORKDIR /app


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


COPY app.py config.py models.py ./
COPY seed_database.py ./
COPY start.sh ./
RUN chmod +x ./start.sh



EXPOSE 5000


ENV FLASK_APP=app.py
ENV MONGO_URI=mongodb://mongo:27017/
ENV MONGO_DB=brk_sneakers


#CMD ["python", "app.py"]
#CMD ["python", "seed_database.py"]
#CMD ["cmd.exe", "/c", "start.bat"]
CMD ["./start.sh"]