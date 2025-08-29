# HH.ru Auto Responder 🤖

Chrome расширение для автоматического заполнения сопроводительных писем на hh.ru с использованием искусственного интеллекта DeepSeek.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow?logo=googlechrome)](https://chrome.google.com/webstore)
[![DeepSeek AI](https://img.shields.io/badge/DeepSeek-AI-blue)](https://platform.deepseek.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Возможности

- **🤖 AI-генерация писем** - Автоматическое создание персонализированных сопроводительных писем
- **🎯 Учет вакансии** - Анализ конкретной вакансии для релевантного отклика  
- **💾 Локальное хранение** - Все данные хранятся только в вашем браузере
- **⚡ Быстрое заполнение** - Одна кнопка для генерации и заполнения письма
- **🌍 Мультиязычность** - Поддержка русского и английского языков
- **🔒 Безопасность** - API ключ и резюме не передаются третьим сторонам

## 🚀 Установка

### Установка из исходного кода

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/hh-auto-responder.git
```

2. Откройте Chrome и перейдите в `chrome://extensions/`

3. Включите "Режим разработчика" в правом верхнем углу

4. Нажмите "Загрузить распакованное расширение"

5. Выберите папку с файлами расширения

### Установка из Chrome Web Store

*Скоро будет доступно...*

## ⚙️ Настройка

После установки расширение автоматически откроет страницу настроек:

1. **🔑 DeepSeek API Key** - Получите ключ на [platform.deepseek.com](https://platform.deepseek.com)
2. **📝 Ваше резюме** - Вставьте текст вашего резюме (обязательно)
3. **🎨 Дополнительные указания** - Ваши предпочтения для писем
4. **📋 Пример письма** - Образец желаемого стиля и формата
5. **🌐 Язык** - Выберите русский или английский

## 🎯 Использование

1. Перейдите на [hh.ru](https://hh.ru) и найдите интересную вакансию
2. Нажмите "Откликнуться" на вакансии
3. Над полем сопроводительного письма появится кнопка **"🪄 Автозаполнение"**
4. Нажмите кнопку - AI проанализирует вакансию и сгенерирует письмо
5. Письмо автоматически заполнится, останется только отправить отклик

## 🏗️ Архитектура

```
src/
├── manifest.json          # Конфигурация расширения
├── background.js          # Фоновый service worker
├── content.js            # Скрипт для работы на hh.ru
├── options.html          # Страница настроек
├── options.js           # Логика настроек
├── popup.html           # Всплывающее окно
├── popup.js            # Логика popup
└── icons/               # Иконки расширения
```

## 🔧 Технологии

- **Chrome Extension Manifest V3** - Современный стандарт расширений
- **DeepSeek API** - AI для генерации текста
- **Vanilla JavaScript** - Чистый JS без фреймворков
- **Chrome Storage API** - Локальное хранилище данных
- **HTML5/CSS3** - Современный интерфейс

## 🤝 Разработка

### Требования
- Node.js (опционально для сборки)
- Chrome браузер
- DeepSeek API ключ

### Сборка
```bash
# Клонирование репозитория
git clone https://github.com/yourusername/hh-auto-responder.git
cd hh-auto-responder

# Установка зависимостей (если будут добавлены)
npm install

# Сборка расширения
npm run build
```

### Вклад в проект

1. Форкните репозиторий
2. Создайте feature branch: `git checkout -b feature/amazing-feature`
3. Закоммитьте изменения: `git commit -m 'Add amazing feature'`
4. Запушьте branch: `git push origin feature/amazing-feature`
5. Откройте Pull Request

## 🐛 Отчеты об ошибках

Нашли баг? [Создайте issue](https://github.com/yourusername/hh-auto-responder/issues) с подробным описанием:

1. Шаги для воспроизведения
2. Ожидаемое поведение
3. Фактическое поведение
4. Скриншоты (если применимо)
5. Версия Chrome и ОС

## 📝 Лицензия

Этот проект распространяется под лицензией MIT. Смотрите файл [LICENSE](LICENSE) для подробностей.

## 🙏 Благодарности

- [DeepSeek](https://platform.deepseek.com) за мощный AI API
- [HeadHunter](https://hh.ru) за платформу для поиска работы
- Сообществу Chrome Extensions за документацию и примеры

## 📞 Поддержка

Есть вопросы или предложения? 

- 📧 Email: your.email@example.com
- 💬 Issues: [GitHub Issues](https://github.com/yourusername/hh-auto-responder/issues)
- 🐦 Twitter: [@yourhandle](https://twitter.com/yourhandle)

---

⭐ Если вам нравится этот проект, поставьте звезду на GitHub!
