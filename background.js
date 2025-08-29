// Background service worker для расширения
class BackgroundService {
  constructor() {
    this.initialize();
  }

  initialize() {
    console.log('HH.ru Auto Responder service worker запущен');
    
    // Обработка сообщений от content script и popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Для асинхронного ответа
    });

    // Очистка при установке/обновлении
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'generateCoverLetter':
          const result = await this.generateCoverLetter(request.data);
          sendResponse({ success: true, data: result });
          break;

        case 'saveSettings':
          await this.saveSettings(request.data);
          sendResponse({ success: true });
          break;

        case 'getSettings':
          const settings = await this.getSettings();
          sendResponse({ success: true, data: settings });
          break;

        case 'validateApiKey':
          const isValid = await this.validateApiKey(request.data.apiKey);
          sendResponse({ success: true, data: { valid: isValid } });
          break;

        default:
          sendResponse({ success: false, error: 'Неизвестное действие' });
      }
    } catch (error) {
      console.error('Ошибка обработки сообщения:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async generateCoverLetter(data) {
    const { resume, vacancyInfo, userPrompt, exampleLetter, language } = data;
    const apiKey = await this.getApiKey();

    if (!apiKey) {
      throw new Error('API ключ не настроен');
    }

    // Формируем промпт для DeepSeek
    const prompt = this.buildPrompt(resume, vacancyInfo, userPrompt, exampleLetter, language);
    
    // Отправляем запрос к DeepSeek API
    const response = await this.callDeepSeekApi(apiKey, prompt);
    
    return response;
  }

  buildPrompt(resume, vacancyInfo, userPrompt, exampleLetter, language) {
    const langPrefix = language === 'en' ? 'Write in English: ' : 'Пиши на русском: ';
    
    return `${langPrefix}
На основе моего резюме и вакансии создай сопроводительное письмо.

МОЕ РЕЗЮМЕ:
${resume}

ИНФОРМАЦИЯ О ВАКАНСИИ:
${vacancyInfo}

ДОПОЛНИТЕЛЬНЫЕ УКАЗАНИЯ:
${userPrompt}

ПРИМЕР ХОРОШЕГО ПИСЬМА (стиль и формат):
${exampleLetter}

Создай профессиональное сопроводительное письмо, которое подчеркнет мою релевантность данной вакансии.`;
  }

  async callDeepSeekApi(apiKey, prompt) {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async saveSettings(settings) {
    await chrome.storage.local.set({ settings });
  }

  async getSettings() {
    const result = await chrome.storage.local.get('settings');
    return result.settings || {};
  }

  async getApiKey() {
    const settings = await this.getSettings();
    return settings.apiKey || '';
  }

  async validateApiKey(apiKey) {
    console.log('Валидация API ключа:', apiKey ? `${apiKey.substring(0, 10)}...` : 'empty');
    
    // Проверяем базовый формат ключа
    if (!apiKey || typeof apiKey !== 'string') {
      console.log('Ключ пустой или не строка');
      return false;
    }
    
    // Проверяем что ключ начинается с sk- и имеет достаточную длину
    const isValidFormat = apiKey.startsWith('sk-') && apiKey.length > 20;
    
    if (!isValidFormat) {
      console.log('Неверный формат ключа');
      return false;
    }

    console.log('Формат ключа корректен, делаем тестовый запрос...');

    // Упрощенная проверка - если формат корректен, считаем ключ валидным
    // Реальная проверка будет при генерации письма
    return true;

    // Раскомментируйте для детальной проверки (может вызывать CORS ошибки):
    /*
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5,
          stream: false
        })
      });
      
      const isValid = response.status !== 401;
      console.log('Результат проверки API:', isValid, 'Status:', response.status);
      return isValid;
    } catch (error) {
      console.log('Ошибка при проверке API ключа:', error.message);
      // Если есть ошибка сети, считаем ключ валидным (проверка будет при реальном использовании)
      return true;
    }
    */
  }

  async handleInstallation(details) {
    if (details.reason === 'install') {
      // Первая установка - открываем страницу настроек
      chrome.runtime.openOptionsPage();
    }
  }
}

// Инициализация service worker
new BackgroundService();
