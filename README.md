# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally

To run this project on your local machine, follow these steps.

### Prerequisites

1.  **Node.js:** Ensure you have Node.js version 20 or later installed.

### Installation

Install the project dependencies by running the following command in your terminal:

```bash
npm install
```

### Running the Development Server

This project requires a single development server for the Next.js frontend. The AI logic runs within this same server process.

1.  **Start the Next.js App:** Open a terminal and run:

    ```bash
    npm run dev
    ```

    Your web application will be available at `http://localhost:9002`.

---

## Running with Docker

You can also run the application using Docker and Docker Compose. This is the recommended way to run the entire stack, including the AI services, once they are added.

1.  **Build and Run the Container:**
    Open a terminal in the project root and run:
    ```bash
    docker-compose up -d --build
    ```
    This command will build the Docker image for the application and start it in the background. Your web application will be available at `http://localhost:9002`.

2.  **To stop the application**, run:
    ```bash
    docker-compose down
    ```

---

## Запуск проекта на локальной машине

Чтобы запустить этот проект на вашей локальной машине, выполните следующие шаги.

### Необходимые условия

1.  **Node.js:** Убедитесь, что у вас установлена Node.js версии 20 или новее.

### Установка

Установите зависимости проекта, выполнив следующую команду в вашем терминале:

```bash
npm install
```

### Запуск сервера для разработки

Этот проект требует запуска одного сервера для фронтенда на Next.js. AI-логика выполняется в рамках этого же серверного процесса.

1.  **Запустите приложение Next.js:** Откройте терминал и выполните:

    ```bash
    npm run dev
    ```

    Ваше веб-приложение будет доступно по адресу `http://localhost:9002`.

---

## Запуск с помощью Docker

Вы также можете запустить приложение с помощью Docker и Docker Compose. Это рекомендуемый способ для запуска всего стека, включая AI-сервисы, после их добавления.

1.  **Сборка и запуск контейнера:**
    Откройте терминал в корневой папке проекта и выполните:
    ```bash
    docker-compose up -d --build
    ```
    Эта команда соберет Docker-образ для приложения и запустит его в фоновом режиме. Ваше веб-приложение будет доступно по адресу `http://localhost:9002`.

2.  **Чтобы остановить приложение**, выполните:
    ```bash
    docker-compose down
    ```
