FROM python:3.14-slim
WORKDIR /app
COPY server.py .
COPY frontend ./frontend
VOLUME ["/app/uploads"]
EXPOSE 8471
CMD ["python3", "server.py"]
