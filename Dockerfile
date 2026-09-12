FROM python:3.12-slim
RUN pip install --no-cache-dir pillow
WORKDIR /app
COPY server.py .
COPY frontend ./frontend
VOLUME ["/app/uploads"]
EXPOSE 8471
CMD ["python3", "server.py"]
