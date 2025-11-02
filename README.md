# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally

To run this project on your local machine, follow these steps.

### Prerequisites

1.  **Node.js:** Ensure you have Node.js version 20 or later installed.
2.  **API Key:** You need a Gemini API key from Google AI Studio.
    *   Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Create a new API key.

### Configuration

1.  Create a new file named `.env` in the root of the project.
2.  Add your API key to the `.env` file like this:

    ```
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```

### Installation

Install the project dependencies by running the following command in your terminal:

```bash
npm install
```

### Running the Development Servers

This project requires two separate development servers to be running simultaneously: one for the Next.js frontend and one for the Genkit AI flows.

1.  **Start the Next.js App:** Open a terminal and run:

    ```bash
    npm run dev
    ```

    Your web application will be available at `http://localhost:9002`.

2.  **Start the Genkit Flows:** Open a *second* terminal and run:

    ```bash
    npm run genkit:dev
    ```

    This will start the Genkit development server, which your Next.js app will use to communicate with the AI models.

---

## Запуск проекта на локальной машине

Чтобы запустить этот проект на вашей локальной машине, выполните следующие шаги.

### Необходимые условия

1.  **Node.js:** Убедитесь, что у вас установлена Node.js версии 20 или новее.
2.  **API-ключ:** Вам понадобится API-ключ для Gemini из Google AI Studio.
    *   Перейдите в [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Создайте новый API-ключ.

### Конфигурация

1.  Создайте новый файл с именем `.env` в корневой папке проекта.
2.  Добавьте ваш API-ключ в файл `.env` следующим образом:

    ```
    GEMINI_API_KEY="ВАШ_API_КЛЮЧ"
    ```

### Установка

Установите зависимости проекта, выполнив следующую команду в вашем терминале:

```bash
npm install
```

### Запуск серверов для разработки

Этот проект требует одновременного запуска двух серверов: одного для фронтенда на Next.js и второго для AI-процессов Genkit.

1.  **Запустите приложение Next.js:** Откройте терминал и выполните:

    ```bash
    npm run dev
    ```

    Ваше веб-приложение будет доступно по адресу `http://localhost:9002`.

2.  **Запустите процессы Genkit:** Откройте *второй* терминал и выполните:

    ```bash
    npm run genkit:dev
    ```

    Это запустит сервер разработки Genkit, который ваше приложение Next.js будет использовать для взаимодействия с AI-моделями.
