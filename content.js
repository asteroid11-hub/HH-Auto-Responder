// Content script для работы на hh.ru
class HHContentScript {
  constructor() {
    this.initialize();
  }

  initialize() {
    console.log('HH.ru Auto Responder content script запущен');
    
    // Наблюдаем за изменениями DOM для обнаружения формы отклика
    this.observeDOMChanges();
    
    // Также проверяем сразу при загрузке
    this.checkForResponseForm();
  }

  observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          this.checkForResponseForm();
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  checkForResponseForm() {
    // Ищем поле сопроводительного письма на hh.ru
    // На hh.ru поле обычно имеет атрибут data-qa или классы
    const coverLetterSelectors = [
      'textarea[data-qa="vacancy-response-popup-form-letter-input"]',
      'textarea[data-qa*="letter"]',
      'textarea[name*="letter"]',
      '.bloko-textarea',
      'textarea.bloko-textarea'
    ];

    for (const selector of coverLetterSelectors) {
      const textareas = document.querySelectorAll(selector);
      for (const textarea of textareas) {
        if (this.isCoverLetterField(textarea)) {
          this.addAutoFillButton(textarea);
        }
      }
    }
  }

  isCoverLetterField(textarea) {
    // Проверяем, является ли это поле сопроводительным письмом
    const parent = textarea.closest('form, .modal, .popup');
    if (!parent) return false;

    const context = parent.textContent.toLowerCase();
    const isResponseForm = context.includes('отклик') || 
                          context.includes('response') ||
                          context.includes('сопровод') ||
                          context.includes('письм');

    return isResponseForm && textarea.offsetHeight > 50;
  }

  addAutoFillButton(textarea) {
    // Проверяем, не добавлена ли уже кнопка
    if (textarea.previousElementSibling?.classList?.contains('autofill-button-container')) {
      return;
    }

    const container = document.createElement('div');
    container.className = 'autofill-button-container';
    container.style.marginBottom = '10px';
    container.style.display = 'flex';
    container.style.justifyContent = 'flex-end';

    const button = document.createElement('button');
    button.textContent = '🪄 Автозаполнение';
    button.className = 'autofill-button';
    button.style.padding = '8px 16px';
    button.style.background = '#4285f4';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';
    
    button.addEventListener('click', () => this.handleAutoFill(textarea));

    container.appendChild(button);
    textarea.parentNode.insertBefore(container, textarea);
  }

  async handleAutoFill(textarea) {
    const button = textarea.previousElementSibling.querySelector('button');
    const originalText = button.textContent;
    
    button.textContent = '⏳ Генерируем...';
    button.disabled = true;
    button.style.background = '#ccc';

    try {
      // Получаем информацию о вакансии
      const vacancyInfo = this.extractVacancyInfo();
      
      // Получаем настройки
      const settings = await this.getSettings();
      
      if (!settings.apiKey) {
        throw new Error('Настройте API ключ в расширении');
      }

      if (!settings.resume) {
        throw new Error('Добавьте резюме в настройках');
      }

      // Генерируем сопроводительное письмо
      const coverLetter = await this.generateCoverLetter({
        resume: settings.resume,
        vacancyInfo,
        userPrompt: settings.userPrompt,
        exampleLetter: settings.exampleLetter,
        language: settings.language
      });

      // Заполняем поле
      textarea.value = coverLetter;
      
      // Триггерим событие изменения для валидации формы
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));

      this.showNotification('Письмо успешно сгенерировано!', 'success');

    } catch (error) {
      console.error('Ошибка автозаполнения:', error);
      this.showNotification(error.message, 'error');
    } finally {
      button.textContent = originalText;
      button.disabled = false;
      button.style.background = '#4285f4';
    }
  }

  extractVacancyInfo() {
    // Извлекаем информацию о вакансии со страницы
    let vacancyInfo = '';

    // Название вакансии
    const titleSelectors = [
      '[data-qa="vacancy-title"]',
      '.vacancy-title',
      'h1[data-qa*="title"]',
      '.bloko-header-1'
    ];
    
    const title = this.findText(titleSelectors);
    if (title) vacancyInfo += `Должность: ${title}\n`;

    // Компания
    const companySelectors = [
      '[data-qa="vacancy-company-name"]',
      '.vacancy-company-name',
      '[class*="company"]'
    ];
    
    const company = this.findText(companySelectors);
    if (company) vacancyInfo += `Компания: ${company}\n`;

    // Описание вакансии
    const descriptionSelectors = [
      '[data-qa="vacancy-description"]',
      '.vacancy-description',
      '.bloko-text'
    ];
    
    const description = this.findText(descriptionSelectors);
    if (description) vacancyInfo += `Описание:\n${description}\n`;

    // Требования
    const requirementsSelectors = [
      '[data-qa*="requirement"]',
      '[data-qa*="skill"]',
      '.vacancy-section'
    ];
    
    const requirements = this.findText(requirementsSelectors);
    if (requirements) vacancyInfo += `Требования:\n${requirements}\n`;

    return vacancyInfo || 'Информация о вакансии не найдена';
  }

  findText(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    return null;
  }

  async generateCoverLetter(data) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'generateCoverLetter',
        data
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response && response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response?.error || 'Ошибка генерации'));
        }
      });
    });
  }

  async getSettings() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'getSettings'
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response && response.success) {
          resolve(response.data || {});
        } else {
          reject(new Error(response?.error || 'Ошибка получения настроек'));
        }
      });
    });
  }

  showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '10000';
    notification.style.fontSize = '14px';
    notification.style.fontWeight = '500';

    if (type === 'success') {
      notification.style.background = '#4caf50';
      notification.style.color = 'white';
    } else if (type === 'error') {
      notification.style.background = '#f44336';
      notification.style.color = 'white';
    } else {
      notification.style.background = '#2196f3';
      notification.style.color = 'white';
    }

    document.body.appendChild(notification);

    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Запускаем при загрузке страницы
new HHContentScript();
