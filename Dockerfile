# Use an official, lightweight Python runtime as a parent image
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Set up the Hugging Face user
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copies everything (api folder + root artifacts) into the container
COPY --chown=user . $HOME/app

EXPOSE 7860

# CHANGED: Point Uvicorn to the api module (api.main:app)
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "7860"]