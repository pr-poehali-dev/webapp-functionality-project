export interface PatientProfile {
  scenario: 'consultation' | 'treatment' | 'emergency' | 'objections';
  complaint: string;
  mood: 'calm' | 'nervous' | 'angry' | 'scared';
  knowledge: 'low' | 'medium' | 'high';
  symptoms: string[];
  concerns: string[];
  objections?: string[];
}

export interface PatientResponse {
  message: string;
  mood: 'calm' | 'nervous' | 'angry' | 'scared';
  satisfaction: number;
}

export interface ConversationAnalysis {
  empathyScore: number;
  clarityScore: number;
  professionalismScore: number;
  overallScore: number;
  recommendations: string[];
  goodPoints: string[];
  missedOpportunities: string[];
}

interface LearningPattern {
  objection: string;
  successfulResponses: string[];
  unsuccessfulResponses: string[];
  effectiveKeywords: string[];
  lastUpdated: number;
}

class PatientLearningSystem {
  private static readonly STORAGE_KEY = 'patient_ai_learning_data';
  private patterns: Map<string, LearningPattern> = new Map();

  constructor() {
    this.loadPatterns();
  }

  private loadPatterns(): void {
    try {
      const stored = localStorage.getItem(PatientLearningSystem.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.patterns = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load learning patterns:', error);
    }
  }

  private savePatterns(): void {
    try {
      const data = Object.fromEntries(this.patterns);
      localStorage.setItem(PatientLearningSystem.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save learning patterns:', error);
    }
  }

  recordResponse(objection: string, adminResponse: string, wasSuccessful: boolean): void {
    const key = objection.toLowerCase().trim();
    
    if (!this.patterns.has(key)) {
      this.patterns.set(key, {
        objection,
        successfulResponses: [],
        unsuccessfulResponses: [],
        effectiveKeywords: [],
        lastUpdated: Date.now(),
      });
    }

    const pattern = this.patterns.get(key)!;
    
    if (wasSuccessful) {
      pattern.successfulResponses.push(adminResponse);
      if (pattern.successfulResponses.length > 10) {
        pattern.successfulResponses.shift();
      }
      
      this.extractAndUpdateKeywords(pattern, adminResponse);
    } else {
      pattern.unsuccessfulResponses.push(adminResponse);
      if (pattern.unsuccessfulResponses.length > 10) {
        pattern.unsuccessfulResponses.shift();
      }
    }

    pattern.lastUpdated = Date.now();
    this.savePatterns();
  }

  private extractAndUpdateKeywords(pattern: LearningPattern, response: string): void {
    const words = response.toLowerCase()
      .replace(/[^\wа-яё\s]/gi, '')
      .split(/\s+/)
      .filter(w => w.length > 3);

    const stopWords = new Set(['этот', 'тот', 'такой', 'есть', 'быть', 'мочь', 'очень', 'самый']);
    
    words.forEach(word => {
      if (!stopWords.has(word) && !pattern.effectiveKeywords.includes(word)) {
        pattern.effectiveKeywords.push(word);
      }
    });

    if (pattern.effectiveKeywords.length > 20) {
      pattern.effectiveKeywords = pattern.effectiveKeywords.slice(-20);
    }
  }

  getLearnedKeywords(objection: string): string[] {
    const key = objection.toLowerCase().trim();
    const pattern = this.patterns.get(key);
    return pattern?.effectiveKeywords || [];
  }

  getSimilarSuccessfulResponses(objection: string): string[] {
    const key = objection.toLowerCase().trim();
    const pattern = this.patterns.get(key);
    return pattern?.successfulResponses || [];
  }

  getStatistics() {
    const stats = {
      totalObjections: this.patterns.size,
      totalSuccessful: 0,
      totalUnsuccessful: 0,
      mostLearnedObjection: '',
      maxLearningCount: 0,
    };

    this.patterns.forEach((pattern, key) => {
      stats.totalSuccessful += pattern.successfulResponses.length;
      stats.totalUnsuccessful += pattern.unsuccessfulResponses.length;
      
      const learningCount = pattern.successfulResponses.length;
      if (learningCount > stats.maxLearningCount) {
        stats.maxLearningCount = learningCount;
        stats.mostLearnedObjection = key;
      }
    });

    return stats;
  }

  resetLearning(): void {
    this.patterns.clear();
    localStorage.removeItem(PatientLearningSystem.STORAGE_KEY);
  }
}

const learningSystem = new PatientLearningSystem();

export class PatientAI {
  private profile: PatientProfile;
  private conversationHistory: Array<{ role: 'admin' | 'patient'; content: string }> = [];
  private askedAboutSymptoms = false;
  private showedEmpathy = false;
  private explainedClearly = false;
  private askedAboutConcerns = false;
  private messageCount = 0;
  private lastObjection = '';
  private learningSystem = learningSystem;

  constructor(scenario: 'consultation' | 'treatment' | 'emergency' | 'objections') {
    this.profile = this.createProfile(scenario);
  }

  private createProfile(scenario: string): PatientProfile {
    const profiles: Record<string, PatientProfile> = {
      consultation: {
        scenario: 'consultation',
        complaint: 'У меня болит зуб уже неделю',
        mood: 'nervous',
        knowledge: 'low',
        symptoms: ['острая боль', 'чувствительность к холодному', 'ночные боли'],
        concerns: ['страх перед лечением', 'стоимость', 'сколько времени займет'],
      },
      treatment: {
        scenario: 'treatment',
        complaint: 'Мне сказали нужно удалять зуб мудрости',
        mood: 'scared',
        knowledge: 'medium',
        symptoms: ['воспаление десны', 'трудно открывать рот', 'отек'],
        concerns: ['больно ли будет', 'осложнения', 'восстановление'],
      },
      emergency: {
        scenario: 'emergency',
        complaint: 'У меня сильно кровоточит десна после удаления!',
        mood: 'scared',
        knowledge: 'low',
        symptoms: ['кровотечение', 'сильная боль', 'отек'],
        concerns: ['что делать срочно', 'это опасно', 'нужно ли приезжать'],
      },
      objections: {
        scenario: 'objections',
        complaint: 'Мне нужно поставить имплант, но это так дорого...',
        mood: 'nervous',
        knowledge: 'medium',
        symptoms: ['отсутствует зуб', 'дискомфорт при жевании'],
        concerns: ['высокая цена', 'не понимаю зачем', 'может обойтись'],
        objections: [
          'Это слишком дорого',
          'А нельзя дешевле?',
          'Зачем имплант, можно же без него',
          'Я подумаю... может позже',
          'У конкурентов дешевле'
        ],
      },
    };

    return profiles[scenario] || profiles.consultation;
  }

  generateResponse(adminMessage: string): PatientResponse {
    this.conversationHistory.push({ role: 'admin', content: adminMessage });
    this.messageCount++;

    const lowerMessage = adminMessage.toLowerCase();
    
    if (!this.isMessageMeaningful(adminMessage)) {
      const response = this.getConfusedByNonsenseResponse();
      this.conversationHistory.push({ role: 'patient', content: response });
      return {
        message: response,
        mood: 'confused' as any,
        satisfaction: 20,
      };
    }
    
    this.analyzeAdminMessage(lowerMessage);

    let response = '';
    let currentMood = this.profile.mood;
    let satisfaction = 50;
    let wasSuccessful = false;

    if (this.messageCount === 1) {
      response = this.getInitialResponse();
    } else if (this.profile.scenario === 'objections' && this.handlesObjection(lowerMessage)) {
      const effectiveness = this.calculateObjectionHandlingEffectiveness(lowerMessage);
      response = this.getObjectionHandlingResponse(lowerMessage, effectiveness);
      satisfaction = effectiveness;
      currentMood = effectiveness >= 70 ? 'calm' : 'nervous';
      wasSuccessful = effectiveness >= 70;
      
      if (this.lastObjection) {
        this.learningSystem.recordResponse(this.lastObjection, adminMessage, wasSuccessful);
      }
    } else if (this.profile.scenario === 'objections' && this.messageCount >= 2 && this.messageCount % 2 === 0) {
      response = this.getNextObjection();
      this.lastObjection = response;
      satisfaction = 50;
    } else if (this.containsEmpathy(lowerMessage)) {
      response = this.getEmpathyResponse();
      currentMood = this.profile.mood === 'scared' ? 'nervous' : 'calm';
      satisfaction = 70;
      this.showedEmpathy = true;
    } else if (this.asksAboutSymptoms(lowerMessage)) {
      response = this.getSymptomsResponse();
      satisfaction = 60;
      this.askedAboutSymptoms = true;
    } else if (this.explainsTreatment(lowerMessage)) {
      response = this.getTreatmentResponse(lowerMessage);
      satisfaction = this.explainedClearly ? 80 : 60;
    } else if (this.asksAboutConcerns(lowerMessage)) {
      response = this.getConcernsResponse();
      satisfaction = 75;
      this.askedAboutConcerns = true;
    } else if (this.isTooTechnical(lowerMessage)) {
      response = this.getConfusedResponse();
      satisfaction = 40;
      currentMood = 'nervous';
    } else {
      response = this.getGenericResponse();
      satisfaction = 50;
    }

    this.conversationHistory.push({ role: 'patient', content: response });

    return {
      message: response,
      mood: currentMood,
      satisfaction,
    };
  }

  private calculateObjectionHandlingEffectiveness(message: string): number {
    let score = 50;

    const learnedKeywords = this.lastObjection 
      ? this.learningSystem.getLearnedKeywords(this.lastObjection)
      : [];

    const objectionHandlingKeywords = [
      'понимаю', 'выгода', 'сэкономите', 'инвестиция', 'долгосрочно',
      'качество', 'гарантия', 'здоровье', 'важно', 'преимущества',
      'сравните', 'разница', 'результат', 'альтернатива', 'экономия',
      'ценность', 'польза', 'эффективность', 'надежность', 'безопасность',
      ...learnedKeywords
    ];

    const foundKeywords = objectionHandlingKeywords.filter(kw => message.includes(kw));
    score += foundKeywords.length * 10;

    if (message.includes('?')) {
      score += 5;
    }

    const wordCount = message.split(' ').length;
    if (wordCount >= 10 && wordCount <= 50) {
      score += 15;
    } else if (wordCount > 50) {
      score -= 5;
    }

    if (message.includes('качество') || message.includes('здоровье')) {
      score += 15;
    }

    if (message.includes('выгода') || message.includes('сэкономите') || message.includes('экономия')) {
      score += 15;
    }

    const similarSuccessful = this.lastObjection
      ? this.learningSystem.getSimilarSuccessfulResponses(this.lastObjection)
      : [];

    if (similarSuccessful.length > 0) {
      const similarity = this.calculateSimilarity(message, similarSuccessful);
      score += similarity * 10;
    }

    return Math.min(Math.max(score, 30), 100);
  }

  private calculateSimilarity(message: string, successfulResponses: string[]): number {
    const messageWords = new Set(
      message.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    );

    let maxSimilarity = 0;

    successfulResponses.forEach(successful => {
      const successWords = new Set(
        successful.toLowerCase().split(/\s+/).filter(w => w.length > 3)
      );

      const intersection = new Set(
        [...messageWords].filter(w => successWords.has(w))
      );

      const similarity = intersection.size / Math.max(messageWords.size, successWords.size);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    });

    return maxSimilarity;
  }

  private analyzeAdminMessage(message: string): void {
    const empathyKeywords = ['понимаю', 'переживаете', 'волнуетесь', 'беспокоитесь', 'помогу', 'поддержу'];
    const clarityKeywords = ['объясню', 'расскажу', 'простыми словами', 'это значит', 'поясню'];
    
    if (empathyKeywords.some(kw => message.includes(kw))) {
      this.showedEmpathy = true;
    }
    
    if (clarityKeywords.some(kw => message.includes(kw))) {
      this.explainedClearly = true;
    }
  }

  private getInitialResponse(): string {
    const responses: Record<string, string> = {
      consultation: 'Здравствуйте... У меня болит зуб уже неделю, особенно ночью. Я очень боюсь идти к стоматологу, но боль невыносимая.',
      treatment: 'Добрый день. Мне другой врач сказал, что нужно удалять зуб мудрости. Честно говоря, я в ужасе... Это правда так больно?',
      emergency: 'Алло! Помогите! У меня после удаления зуба сегодня утром не останавливается кровь! Я уже час прикладываю тампон, но все равно кровит. Что мне делать?!',
      objections: 'Здравствуйте. Мне нужно ставить имплант, но... честно говоря, я не понимаю, зачем такие траты. Может быть, можно как-то обойтись?',
    };
    return responses[this.profile.scenario];
  }

  private getEmpathyResponse(): string {
    const responses = [
      'Спасибо, что понимаете мое состояние. Мне правда страшно...',
      'Да, я действительно очень переживаю. Приятно, что вы это замечаете.',
      'Спасибо за поддержку, мне стало немного спокойнее.',
      'Очень важно, что вы меня понимаете. Это помогает.',
      'Да, вы правы, я волнуюсь. Хорошо, что мы можем об этом поговорить.',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getSymptomsResponse(): string {
    return `Да, у меня ${this.profile.symptoms.join(', ')}. Это серьезно?`;
  }

  private getTreatmentResponse(message: string): string {
    if (this.explainedClearly) {
      const responses = [
        'Спасибо, что объяснили так понятно. Я начинаю понимать ситуацию. А сколько времени займет лечение?',
        'Теперь мне стало яснее, спасибо. А какие гарантии успеха?',
        'Хорошо, что вы так доступно объяснили. Это успокаивает.',
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    return 'Хм... А можете объяснить попроще? Я не очень разбираюсь в медицинских терминах.';
  }

  private getConcernsResponse(): string {
    return `Меня больше всего беспокоит: ${this.profile.concerns[0]}. Вы можете помочь с этим?`;
  }

  private getConfusedResponse(): string {
    return 'Извините, я не совсем понимаю... Можете объяснить проще, без медицинских терминов?';
  }

  private getConfusedByNonsenseResponse(): string {
    const responses = [
      'Простите, я не понял... Вы что-то сказали?',
      'Извините, я не расслышал. Можете повторить?',
      'Что-что? Я не разобрал ваши слова...',
      'Эм... Вы можете сформулировать это по-другому?',
      'Я не совсем понял, что вы имеете в виду. Можете объяснить понятнее?',
      'Извините, но я не уловил смысл. Говорите, пожалуйста, понятнее.',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getGenericResponse(): string {
    const responses = [
      'Да, я вас слушаю. А что дальше?',
      'Хорошо... А что мне нужно делать?',
      'Понятно. А есть еще что-то важное?',
      'Ага... И как это поможет с моей проблемой?',
      'Я слушаю внимательно. Продолжайте, пожалуйста.',
      'Интересно... А можете рассказать подробнее?',
      'Хм, понятно. А что это значит для меня конкретно?',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private containsEmpathy(message: string): boolean {
    const keywords = ['понимаю', 'переживаете', 'волнуетесь', 'беспокоитесь', 'помогу', 'поддержу', 'не волнуйтесь'];
    return keywords.some(kw => message.includes(kw));
  }

  private asksAboutSymptoms(message: string): boolean {
    const keywords = ['симптомы', 'болит', 'беспокоит', 'чувствуете', 'ощущения', 'что именно'];
    return keywords.some(kw => message.includes(kw));
  }

  private explainsTreatment(message: string): boolean {
    const keywords = ['лечение', 'процедура', 'сделаем', 'будем', 'план', 'этапы'];
    return keywords.some(kw => message.includes(kw));
  }

  private asksAboutConcerns(message: string): boolean {
    const keywords = ['беспокоит', 'волнует', 'вопросы', 'переживания', 'опасения'];
    return keywords.some(kw => message.includes(kw));
  }

  private isTooTechnical(message: string): boolean {
    const technicalTerms = ['пульпит', 'периодонтит', 'апикальный', 'эндодонтический', 'резекция'];
    return technicalTerms.some(term => message.includes(term));
  }

  private isMessageMeaningful(message: string): boolean {
    const trimmed = message.trim();
    
    if (trimmed.length < 2) return false;
    
    const words = trimmed.split(/\s+/);
    if (words.length === 0) return false;
    
    const cyrillicPattern = /[а-яёА-ЯЁ]/;
    const latinPattern = /[a-zA-Z]/;
    const hasCyrillic = words.some(w => cyrillicPattern.test(w));
    const hasLatin = words.some(w => latinPattern.test(w));
    
    if (!hasCyrillic && !hasLatin) return false;
    
    const consonantVowelRatio = this.checkConsonantVowelBalance(trimmed);
    if (consonantVowelRatio < 0.2) return false;
    
    const nonsensePatterns = [
      /^([а-яa-z])\1{3,}/i,
      /^[аоуыэяёюиеaeiou]{5,}$/i,
      /^[бвгджзклмнпрстфхцчшщbcdfghjklmnpqrstvwxyz]{6,}$/i,
    ];
    
    if (nonsensePatterns.some(pattern => pattern.test(trimmed))) {
      return false;
    }
    
    const commonWords = [
      'я', 'вы', 'мы', 'он', 'она', 'это', 'что', 'как', 'где', 'когда',
      'да', 'нет', 'не', 'и', 'в', 'на', 'с', 'по', 'у', 'к',
      'здравствуйте', 'добрый', 'день', 'понимаю', 'помогу', 'хорошо',
      'спасибо', 'пожалуйста', 'можете', 'скажите', 'расскажите'
    ];
    
    const hasCommonWord = words.some(word => 
      commonWords.some(common => word.toLowerCase().includes(common))
    );
    
    if (hasCommonWord) return true;
    
    if (words.every(word => word.length >= 3 && this.hasReasonableStructure(word))) {
      return true;
    }
    
    return false;
  }

  private checkConsonantVowelBalance(text: string): number {
    const vowels = 'аоуыэяёюиеaeiou';
    const consonants = 'бвгджзклмнпрстфхцчшщbcdfghjklmnpqrstvwxyz';
    
    let vowelCount = 0;
    let consonantCount = 0;
    
    for (const char of text.toLowerCase()) {
      if (vowels.includes(char)) vowelCount++;
      if (consonants.includes(char)) consonantCount++;
    }
    
    const total = vowelCount + consonantCount;
    if (total === 0) return 0;
    
    return Math.min(vowelCount, consonantCount) / total;
  }

  private hasReasonableStructure(word: string): boolean {
    const lower = word.toLowerCase();
    
    if (lower.length < 2) return true;
    
    const hasVowel = /[аоуыэяёюиеaeiou]/.test(lower);
    const hasConsonant = /[бвгджзклмнпрстфхцчшщbcdfghjklmnpqrstvwxyz]/.test(lower);
    
    return hasVowel && hasConsonant;
  }

  private handlesObjection(message: string): boolean {
    const learnedKeywords = this.lastObjection 
      ? this.learningSystem.getLearnedKeywords(this.lastObjection)
      : [];

    const objectionHandlingKeywords = [
      'понимаю', 'выгода', 'сэкономите', 'инвестиция', 'долгосрочно',
      'качество', 'гарантия', 'здоровье', 'важно', 'преимущества',
      'сравните', 'разница', 'результат', 'альтернатива',
      ...learnedKeywords
    ];
    
    return objectionHandlingKeywords.some(kw => message.includes(kw)) && message.split(' ').length >= 5;
  }

  private getNextObjection(): string {
    if (!this.profile.objections || this.profile.objections.length === 0) {
      return this.getGenericResponse();
    }
    
    const objectionIndex = Math.min(
      Math.floor(this.messageCount / 2) - 1,
      this.profile.objections.length - 1
    );
    
    return this.profile.objections[objectionIndex];
  }

  private getObjectionHandlingResponse(message: string, effectiveness: number): string {
    if (effectiveness >= 85) {
      const strongResponses = [
        'Да, здоровье это главное. Вы меня убедили! Давайте договоримся о записи.',
        'Спасибо за подробное объяснение! Теперь все понятно. Когда можно начать?',
        'Вы правы, я не думал об этом с такой стороны. Это действительно инвестиция в здоровье!',
        'Отлично, что вы так объяснили. Я готов двигаться дальше.',
      ];
      return strongResponses[Math.floor(Math.random() * strongResponses.length)];
    }
    
    if (effectiveness >= 70) {
      const goodResponses = [
        'Да, я понимаю ваши аргументы. Звучит разумно.',
        'Хм... Интересная точка зрения. Я подумаю над этим серьезно.',
        'Спасибо за разъяснение! Теперь мне стало понятнее.',
        'Действительно, если посмотреть в долгосрочной перспективе, это выгоднее.',
      ];
      return goodResponses[Math.floor(Math.random() * goodResponses.length)];
    }

    if (effectiveness >= 50) {
      const neutralResponses = [
        'Ну... не знаю. Мне нужно еще подумать.',
        'Возможно, вы правы, но это все равно дорого...',
        'Да, я слышу вас, но у меня все еще есть сомнения.',
        'Понятно... но можно ли как-то по-другому?',
      ];
      return neutralResponses[Math.floor(Math.random() * neutralResponses.length)];
    }

    const weakResponses = [
      'Извините, но я все равно не понимаю, зачем платить столько.',
      'Нет, это слишком. Я лучше поищу другие варианты.',
      'Вы не объяснили конкретно, в чем выгода для меня.',
      'Мне кажется, вы просто хотите продать подороже...',
    ];
    return weakResponses[Math.floor(Math.random() * weakResponses.length)];
  }

  analyzeConversation(): ConversationAnalysis {
    const empathyScore = this.calculateEmpathyScore();
    const clarityScore = this.calculateClarityScore();
    const professionalismScore = this.calculateProfessionalismScore();
    const overallScore = Math.round((empathyScore + clarityScore + professionalismScore) / 3);

    const recommendations: string[] = [];
    const goodPoints: string[] = [];
    const missedOpportunities: string[] = [];

    if (empathyScore < 60) {
      recommendations.push('Проявляйте больше эмпатии - используйте фразы "Я понимаю ваши переживания", "Не волнуйтесь"');
      missedOpportunities.push('Не показали эмпатию к переживаниям пациента');
    } else {
      goodPoints.push('Проявили эмпатию и поддержку');
    }

    if (!this.askedAboutSymptoms && this.profile.scenario !== 'objections') {
      recommendations.push('Обязательно уточняйте все симптомы пациента для полной картины');
      missedOpportunities.push('Не уточнили все симптомы');
    } else if (this.askedAboutSymptoms) {
      goodPoints.push('Задали вопросы о симптомах');
    }

    if (clarityScore < 60) {
      recommendations.push('Избегайте медицинских терминов - объясняйте простым языком');
      missedOpportunities.push('Использовали сложные термины без объяснения');
    } else {
      goodPoints.push('Объясняли понятным языком');
    }

    if (!this.askedAboutConcerns) {
      recommendations.push('Спрашивайте о страхах и опасениях пациента');
      missedOpportunities.push('Не выяснили основные опасения пациента');
    } else {
      goodPoints.push('Выяснили опасения пациента');
    }

    if (this.messageCount < 3) {
      recommendations.push('Уделяйте больше времени общению с пациентом');
    }

    if (professionalismScore > 70) {
      goodPoints.push('Сохранили профессиональный тон');
    }

    if (this.profile.scenario === 'objections') {
      const stats = this.learningSystem.getStatistics();
      if (stats.totalSuccessful > 0) {
        goodPoints.push(`ИИ обучился на ${stats.totalSuccessful} успешных ответах`);
      }
    }

    return {
      empathyScore,
      clarityScore,
      professionalismScore,
      overallScore,
      recommendations,
      goodPoints,
      missedOpportunities,
    };
  }

  private calculateEmpathyScore(): number {
    let score = 30;
    
    if (this.showedEmpathy) score += 40;
    if (this.askedAboutConcerns) score += 30;
    
    return Math.min(score, 100);
  }

  private calculateClarityScore(): number {
    let score = 40;
    
    if (this.explainedClearly) score += 40;
    if (this.messageCount >= 3) score += 20;
    
    return Math.min(score, 100);
  }

  private calculateProfessionalismScore(): number {
    let score = 60;
    
    if (this.askedAboutSymptoms) score += 20;
    if (this.messageCount >= 4) score += 20;
    
    return Math.min(score, 100);
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  getLearningStatistics() {
    return this.learningSystem.getStatistics();
  }

  static resetLearning() {
    learningSystem.resetLearning();
  }
}

export default PatientAI;