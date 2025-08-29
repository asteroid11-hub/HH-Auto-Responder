// Обработчик страницы настроек
class OptionsPage {
  constructor() {
    this.initialize();
  }

  async initialize() {
    await this.loadSettings();
    this.setupEventListeners();
  }

  async loadSettings() {
    try {
      const settings = await this.sendMessage('getSettings');
      
      if (settings) {
        document.getElementById('apiKey').value = settings.apiKey || '';
        document.getElementById('resume').value = settings.resume || '';
        document.getElementById('userPrompt').value = settings.userPrompt || '';
        document.getElementById('exampleLetter').value = settings.exampleLetter || '';
        document.getElementById('language').value = settings.language || 'ru';
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      this.showStatus('Ошибка загрузки настроек', 'error');
    }
  }

  setupEventListeners() {
    const form = document.getElementById('settingsForm');
    form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Валидация API ключа при изменении
    const apiKeyInput = document.getElementById('apiKey');
    apiKeyInput.addEventListener('blur', () => this.validateApiKey());
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    const saveButton = document.getElementById('saveButton');
    saveButton.disabled = true;
    this.showStatus('Сохранение...', 'loading');

    try {
      // Валидация обязательных полей
      const apiKey = document.getElementById('apiKey').value.trim();
      const resume = document.getElementById('resume').value.trim();

      if (!apiKey) {
        throw new Error('API ключ обязателен');
      }

      if (!resume) {
        throw new Error('Резюме обязательно');
      }

      // Валидация API ключа
      const isValid = await this.validateApiKey(apiKey);
      if (!isValid) {
        throw new Error('Неверный API ключ');
      }

      // Подготовка данных для сохранения
      const settings = {
        apiKey,
        resume,
        userPrompt: document.getElementById('userPrompt').value.trim(),
        exampleLetter: document.getElementById('exampleLetter').value.trim(),
        language: document.getElementById('language').value
      };

      // Сохранение настроек
      await this.sendMessage('saveSettings', settings);
      
      this.showStatus('Настройки успешно сохранены!', 'success');
      
      // Автоматическое скрытие сообщения об успехе через 3 секунды
      setTimeout(() => {
        this.hideStatus();
      }, 3000);

    } catch (error) {
      console.error('Ошибка сохранения:', error);
      this.showStatus(error.message, 'error');
    } finally {
      saveButton.disabled = false;
    }
  }

  async validateApiKey(apiKey = null) {
    let keyToValidate;
    
    if (apiKey !== null) {
      keyToValidate = apiKey;
    } else {
      const apiKeyInput = document.getElementById('apiKey');
      keyToValidate = apiKeyInput ? apiKeyInput.value.trim() : '';
    }
    
    console.log('Передаваемый ключ для валидации:', keyToValidate ? `${keyToValidate.substring(0, 10)}...` : 'empty');
    
    if (!keyToValidate) {
      console.log('Ключ для валидации пустой');
      return false;
    }

    try {
      const response = await this.sendMessage('validateApiKey', { apiKey: keyToValidate });
      console.log('Ответ валидации:', response);
      return response.valid;
    } catch (error) {
      console.error('Ошибка валидации API ключа:', error);
      return false;
    }
  }

  sendMessage(action, data = null) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action, data }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response && response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response?.error || 'Неизвестная ошибка'));
        }
      });
    });
  }

  showStatus(message, type) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.style.display = 'block';
  }

  hideStatus() {
    const statusElement = document.getElementById('status');
    statusElement.style.display = 'none';
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new OptionsPage();
});
