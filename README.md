![Gramax logo](./logo.svg)

# Gramax
Gramax — это бесплатный текстовый редактор со встроенным механизмом контроля и сравнения версий. Работает офлайн, не хранит данные в облаке, но даёт возможность поделиться ими в несколько кликов.

![Gramax interface](https://gram.ax/data/ru/gramax.png)

## Быстрый старт

### Разворачивание приложения для редактирования

Чтобы начать редактировать документацию, достаточно скачать приложение или открыть его в браузере. Ссылки доступны на [gram.ax](https://gram.ax).

### Разворачивание портала для читателей

Чтобы развернуть портал для читателей на своем домене, вам потребуется:
- Docker (версии 20.04 или выше).
- sh (если вы используете Linux или macOS).

#### На Linux или macOS

Откройте ваш терминал и выполните команду:

```bash
curl https://raw.githubusercontent.com/StanislavPetrovIcs/test-gramax-setup/main/setup.sh | bash; docker compose up
```

#### На Windows

Откройте powershell и выполните команду:

```powershell
Invoke-Expression (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/StanislavPetrovIcs/test-gramax-setup/main/setup.ps1" -UseBasicParsing).Content; docker compose up
```

### Запуск для разработки (Vite и Next.js)

Чтобы запустить Next.js, перейдите в папку `target/next/`. Для запуска Vite перейдите в папку `target/browser/`.

- Для запуска режима разработчика:

  ```bash
  npm run dev
  ```

- Для запуска продакшн-билда:

1. Сбилдите приложение командой:

    ```bash
    npm run build
    ```

2. Затем запустите приложение командой:

    ```bash
    npm run start
    ```

## Как использовать

Документация для пользователей расположена [тут](https://gram.ax/resources/docs).

## Участие в разработке

Мы рады приветствовать всех, кто хочет внести свой вклад в развитие Gramax. Ваша поддержка и усилия помогают сделать Gramax лучше для всех пользователей.

1. **Тестируйте**. Помогите нам найти и исправить ошибки. Регулярное тестирование новых версий помогает убедиться, что Gramax работает без сбоев.
    <!-- 2. **Документация**: Вносите свой вклад в документацию Gramax, чтобы сделать её более понятной и полезной для всех пользователей. -->

3. **Участвуйте в обсуждениях**. Ваши идеи и отзывы очень важны для нас. Поделитесь в [Telegram-канале](https://t.me/gramax_chat) своими мыслями, как улучшить Gramax.

4. **Создавайте пул-реквесты**. Если вы готовы внести свой вклад, создайте пул-реквест с вашими изменениями для рассмотрения.
   <!-- Нужно подумать будем ли мы принимать пул-реквесты от сторонних контрибьютеров -->


## Контакты

Если есть вопросы или вам нужна помощь, не стесняйтесь писать нам!
- Обсуждения, вопросы, поддержка - в [Telegram-канал](https://t.me/gramax_chat).
- Сотрудничество и улучшения - нашему [CPO](https://telegram.im/@krakenkaken).

Также следите за нами в блогах:
- [Twitter](https://twitter.com/gram_ax).
- [Habr](https://habr.com/ru/users/krakenkaken/publications/articles/).
- [VC.ru](https://vc.ru/u/2554759-gramax).

## Лицензия

Проект распространяется под [лицензией GPL-3.0](LICENSE).
