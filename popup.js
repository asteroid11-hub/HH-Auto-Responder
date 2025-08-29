// Обработчик всплывающего окна расширения
class PopupHandler {
  constructor() {
    this.initialize();
  }

  async initialize() {
    await this.checkSettings();
    this.setupEventListeners();
  }

  async checkSettings() {
    try {
      const settings = await this.sendMessage('getSettings');
      const statusElement = document.getElementById('status');
      
      if (settings && settings.apiKey && settings.resume) {
        statusElement.textContent = '✅ Расширение настроено';
        statusElement.className = 'status configured';
      } else {
        statusElement.textContent = '⚙️ Требуется настройка';
        statusElement.className = 'status not-configured';
      }
    } catch (error) {
      console.error('Ошибка проверки настроек:', error);
      const statusElement = document.getElementById('status');
      statusElement.textContent = '❌ Ошибка загрузки настроек';
      statusElement.className = 'status not-configured';
    }
  }

  setupEventListeners() {
    // Кнопка открытия настроек
    document.getElementById('optionsButton').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
      window.close(); // Закрываем popup после открытия настроек
    });

    // Кнопка перехода на HH.ru
    document.getElementById('websiteButton').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://hh.ru' });
      window.close();
    });
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
}

// Инициализация при загрузке popup
document.addEventListener('DOMContentLoaded', () => {
  new PopupHandler();
});
