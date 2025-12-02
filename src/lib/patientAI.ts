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

export class PatientAI {
  private profile: PatientProfile;
  private conversationHistory: Array<{ role: 'admin' | 'patient'; content: string }> = [];
  private askedAboutSymptoms = false;
  private showedEmpathy = false;
  private explainedClearly = false;
  private askedAboutConcerns = false;
  private messageCount = 0;

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
    
    this.analyzeAdminMessage(lowerMessage);

    let response = '';
    let currentMood = this.profile.mood;
    let satisfaction = 50;

    if (this.messageCount === 1) {
      response = this.getInitialResponse();
    } else if (this.profile.scenario === 'objections' && this.handlesObjection(lowerMessage)) {
      response = this.getObjectionHandlingResponse(lowerMessage);
      satisfaction = 85;
      currentMood = 'calm';
    } else if (this.profile.scenario === 'objections' && this.messageCount >= 2 && this.messageCount % 2 === 0) {
      response = this.getNextObjection();
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
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getSymptomsResponse(): string {
    return `Да, у меня ${this.profile.symptoms.join(', ')}. Это серьезно?`;
  }

  private getTreatmentResponse(message: string): string {
    if (this.explainedClearly) {
      return 'Спасибо, что объяснили так понятно. Я начинаю понимать ситуацию. А сколько времени займет лечение?';
    }
    return 'Хм... А можете объяснить попроще? Я не очень разбираюсь в медицинских терминах.';
  }

  private getConcernsResponse(): string {
    return `Меня больше всего беспокоит: ${this.profile.concerns[0]}. Вы можете помочь с этим?`;
  }

  private getConfusedResponse(): string {
    return 'Извините, я не совсем понимаю... Можете объяснить проще, без медицинских терминов?';
  }

  private getGenericResponse(): string {
    const responses = [
      'Да, я вас слушаю. А что дальше?',
      'Хорошо... А что мне нужно делать?',
      'Понятно. А есть еще что-то важное?',
      'Ага... И как это поможет с моей проблемой?',
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

  private handlesObjection(message: string): boolean {
    const objectionHandlingKeywords = [
      'понимаю', 'выгода', 'сэкономите', 'инвестиция', 'долгосрочно',
      'качество', 'гарантия', 'здоровье', 'важно', 'преимущества',
      'сравните', 'разница', 'результат', 'альтернатива'
    ];
    return objectionHandlingKeywords.some(kw => message.includes(kw));
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

  private getObjectionHandlingResponse(message: string): string {
    const responses = [
      'Да, я понимаю ваши опасения. Спасибо, что объяснили так подробно.',
      'Хм... Интересная точка зрения. Я подумаю над этим.',
      'Спасибо за разъяснение! Теперь мне стало понятнее.',
      'Да, вы правы. Я не думал об этом с такой стороны.',
    ];
    
    if (message.includes('качество') || message.includes('здоровье')) {
      return 'Да, здоровье это главное. Вы меня убедили!';
    }
    
    if (message.includes('выгода') || message.includes('сэкономите')) {
      return 'Действительно, если посмотреть в долгосрочной перспективе, это выгоднее.';
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
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

    if (!this.askedAboutSymptoms) {
      recommendations.push('Обязательно уточняйте все симптомы пациента для полной картины');
      missedOpportunities.push('Не уточнили все симптомы');
    } else {
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
}

export default PatientAI;