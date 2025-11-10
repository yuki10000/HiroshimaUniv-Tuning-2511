FROM golang:1.25

WORKDIR /usr/src/backend

COPY go.mod go.sum ./
RUN go mod download

# airのインストール
RUN go install github.com/air-verse/air@latest
# Set PATH to include the common Go bin location. Avoid command substitution in Dockerfile ENV.
ENV PATH=$PATH:/go/bin

COPY . .
RUN go build -a -o /app/server ./cmd

EXPOSE 8080
# Use CMD so docker-compose can override the command (e.g. to run `air`).
CMD ["/app/server"]