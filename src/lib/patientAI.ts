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
  private nonsenseMessageCount = 0;
  private consecutiveNonsense = 0;

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
          // Возражения по цене
          'Это слишком дорого для меня, где я возьму такие деньги?',
          'А нельзя сделать дешевле? Может какие-то материалы попроще?',
          'У меня сейчас нет таких денег, может в рассрочку?',
          'Я видел в другой клинике на 30% дешевле, почему у вас так дорого?',
          'За эти деньги я могу съездить в отпуск, а зуб и так как-нибудь...',
          
          // Возражения по необходимости
          'Зачем имплант? Можно же просто мост поставить, это дешевле',
          'А без зуба жить можно, его же сзади не видно',
          'Может съемный протез? Зачем такие сложности с имплантом?',
          'Я уже 2 года без этого зуба живу, и ничего, привык',
          'А обязательно ли ставить? Может само как-то заживет?',
          
          // Возражения по времени
          'Мне некогда сейчас этим заниматься, работа, дела...',
          'Я подумаю... может через полгода, сейчас не готов',
          'Это ж надо несколько раз приезжать? У меня времени нет',
          'А как долго приживается? Полгода ждать? Это слишком долго',
          'Может позже, когда будет время и деньги',
          
          // Возражения по страхам
          'А это не больно? Я очень боюсь боли...',
          'А если не приживется? Деньги потеряю и останусь без зуба',
          'Я слышал, что импланты могут отторгаться, это опасно',
          'А вдруг что-то пойдет не так? Кто будет отвечать?',
          'У моего знакомого имплант не прижился, он мучился потом',
          
          // Возражения-сомнения
          'А вы точно опытный специалист? Сколько имплантов поставили?',
          'Может мне лучше к другому врачу съездить, посоветоваться?',
          'А гарантия какая? Вдруг через год выпадет?',
          'Я не уверен, что мне это нужно. Дайте подумать',
          'А что если я сделаю, а мне не понравится результат?',
          
          // Возражения-отговорки
          'У меня аллергия на анестезию, мне нельзя',
          'У меня давление скачет, мне противопоказано',
          'Я курю, мне говорили что имплант не приживется',
          'У меня диабет, это же противопоказание?',
          'Я беременна/планирую, мне сейчас нельзя',
          
          // Сравнение с конкурентами
          'А почему у вас дороже, чем в соседней клинике?',
          'В той клинике мне сказали, что у них лучшее оборудование',
          'Там акция сейчас, имплант почти в 2 раза дешевле',
          'У конкурентов отзывы лучше, может мне к ним?',
          'А вы используете импланты какой фирмы? У других лучше',
          
          // Недоверие к методу
          'А импланты это вообще безопасно? Это же металл в челюсти',
          'Я читал, что от имплантов бывают осложнения',
          'А это надолго? Или через 5 лет опять менять надо?',
          'Мне кажется, это все маркетинг, чтобы больше денег взять',
          'А есть какие-то исследования, что это эффективно?',
          
          // Откладывание решения
          'Я сейчас не готов принять решение, мне надо подумать',
          'Дайте мне договор, я дома изучу и перезвоню',
          'Мне нужно с женой/мужем посоветоваться',
          'Сейчас не сезон для таких трат, может к осени',
          'Я вам потом перезвоню, когда решусь'
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
      this.nonsenseMessageCount++;
      this.consecutiveNonsense++;
      const response = this.getConfusedByNonsenseResponse(this.consecutiveNonsense);
      this.conversationHistory.push({ role: 'patient', content: response });
      
      const satisfactionPenalty = Math.min(this.consecutiveNonsense * 10, 30);
      
      return {
        message: response,
        mood: this.consecutiveNonsense >= 3 ? 'angry' : 'nervous',
        satisfaction: Math.max(10, 20 - satisfactionPenalty),
      };
    }
    
    this.consecutiveNonsense = 0;
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
      'Приятно иметь дело с таким внимательным специалистом.',
      'Вы первый врач, который действительно меня слушает. Спасибо.',
      'Это так важно - чувствовать поддержку. Я вам доверяю.',
      'Знаете, мне уже легче от того, что вы меня понимаете.',
      'Да, именно так я себя и чувствую. Спасибо, что замечаете.',
      'Ваше понимание очень мне помогает справиться со страхом.',
      'Я рад, что попал именно к вам. Вы внимательный врач.',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getSymptomsResponse(): string {
    const symptomsList = this.profile.symptoms.join(', ');
    const variations = [
      `Да, у меня ${symptomsList}. Это серьезно?`,
      `У меня такие симптомы: ${symptomsList}. Вас это не пугает?`,
      `Ну, основное это ${symptomsList}. Что это может быть?`,
      `Симптомы такие: ${symptomsList}. Как думаете, что со мной?`,
      `Меня беспокоит ${symptomsList}. Это лечится?`,
      `Вот что я чувствую: ${symptomsList}. Это нормально или плохо?`,
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  }

  private getTreatmentResponse(message: string): string {
    if (this.explainedClearly) {
      const responses = [
        'Спасибо, что объяснили так понятно. Я начинаю понимать ситуацию. А сколько времени займет лечение?',
        'Теперь мне стало яснее, спасибо. А какие гарантии успеха?',
        'Хорошо, что вы так доступно объяснили. Это успокаивает.',
        'Отлично, что вы объясняете простым языком. Теперь мне все понятно.',
        'Да, так намного понятнее! А это больно будет?',
        'Спасибо за подробное объяснение. Я готов начать лечение.',
        'Теперь я понимаю весь процесс. А сколько это стоить будет?',
        'Ясно. Вы так хорошо объяснили, что я даже перестал бояться.',
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    const confusedResponses = [
      'Хм... А можете объяснить попроще? Я не очень разбираюсь в медицинских терминах.',
      'Извините, но я не понял половину слов. Объясните понятнее, пожалуйста.',
      'Это все очень сложно звучит... Можете по-простому?',
      'Я запутался в ваших терминах. Давайте по-человечески объясните.',
      'Эээ... Я ничего не понял. Что это вообще значит?',
    ];
    return confusedResponses[Math.floor(Math.random() * confusedResponses.length)];
  }

  private getConcernsResponse(): string {
    const mainConcern = this.profile.concerns[0];
    const variations = [
      `Меня больше всего беспокоит: ${mainConcern}. Вы можете помочь с этим?`,
      `Самое главное для меня - это ${mainConcern}. Как вы с этим поможете?`,
      `Я особенно волнуюсь про ${mainConcern}. Расскажите об этом подробнее.`,
      `У меня есть опасение насчет того, что ${mainConcern}. Это обоснованно?`,
      `Вот что меня тревожит: ${mainConcern}. Можете успокоить?`,
      `Честно говоря, ${mainConcern} - вот что меня останавливает. Что скажете?`,
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  }

  private getConfusedResponse(): string {
    return 'Извините, я не совсем понимаю... Можете объяснить проще, без медицинских терминов?';
  }

  private getConfusedByNonsenseResponse(consecutiveCount: number): string {
    if (consecutiveCount === 1) {
      const firstTimeResponses = [
        'Простите, я не понял... Вы что-то сказали?',
        'Извините, я не расслышал. Можете повторить?',
        'Что-что? Я не разобрал ваши слова...',
        'Эм... Вы можете сформулировать это по-другому?',
        'Я не совсем понял, что вы имеете в виду. Можете объяснить понятнее?',
        'Извините, но я не уловил смысл. Говорите, пожалуйста, понятнее.',
      ];
      return firstTimeResponses[Math.floor(Math.random() * firstTimeResponses.length)];
    }
    
    if (consecutiveCount === 2) {
      const secondTimeResponses = [
        'Опять непонятно... Вы вообще по-русски говорите?',
        'Я правда не понимаю, что вы мне хотите сказать. Можете нормально объяснить?',
        'Слушайте, я ничего не понимаю из того, что вы говорите...',
        'Вы издеваетесь? Я не понимаю ни слова!',
        'Может вы неправильно набираете? Я совсем ничего не понял.',
      ];
      return secondTimeResponses[Math.floor(Math.random() * secondTimeResponses.length)];
    }
    
    if (consecutiveCount === 3) {
      const thirdTimeResponses = [
        'Все, я больше не могу! Вы третий раз пишете какую-то абракадабру!',
        'Хватит! Я устал пытаться понять ваш бред. Говорите нормально или я ухожу!',
        'Это уже не смешно. Три раза подряд несвязный набор букв. Вы серьезно?',
        'Я вообще-то пришел лечиться, а не играть в угадайку! Говорите по-человечески!',
      ];
      return thirdTimeResponses[Math.floor(Math.random() * thirdTimeResponses.length)];
    }
    
    const angryResponses = [
      'Знаете что? Я ухожу. С вами невозможно общаться.',
      'Я больше не буду тратить свое время. До свидания!',
      'Это издевательство какое-то! Я пошел в другую клинику!',
      'Все, я закончил этот разговор. Вы не умеете общаться с людьми!',
      'Мне это надоело. Найду нормального врача, который говорит понятно!',
    ];
    return angryResponses[Math.floor(Math.random() * angryResponses.length)];
  }

  private getGenericResponse(): string {
    const responsesByScenario: Record<string, string[]> = {
      consultation: [
        'Да, я вас слушаю. А что дальше?',
        'Хорошо... А что мне нужно делать?',
        'Понятно. А есть еще что-то важное?',
        'Я слушаю внимательно. Продолжайте, пожалуйста.',
        'Интересно... А можете рассказать подробнее?',
        'Хм, понятно. А что это значит для меня конкретно?',
        'А как долго это будет болеть?',
        'А это точно поможет?',
        'А сколько это все займет времени?',
        'Ясно... А какие могут быть осложнения?',
      ],
      treatment: [
        'Ага... И как это поможет с моей проблемой?',
        'А это обязательно нужно делать?',
        'А нельзя как-то попроще?',
        'Хорошо, а когда можно начать?',
        'А после этого что? Надо будет еще приходить?',
        'Понятно... А это сразу поможет или постепенно?',
        'А какие гарантии, что это поможет?',
        'Хм... А есть альтернативные варианты?',
        'А восстановление долгое будет?',
        'Ясно. А питание как-то ограничивать надо будет?',
      ],
      emergency: [
        'Хорошо, я попробую. А что если не поможет?',
        'А если станет хуже? Мне сразу к вам ехать?',
        'Понял... А как быстро это должно подействовать?',
        'Сколько это делать - раз в час? Или чаще?',
        'А можно принять обезболивающее? Какое лучше?',
        'А это точно не опасно? Может скорую вызвать?',
        'Хорошо, делаю. А если через час не пройдет?',
        'Понятно... А кровь должна сразу остановиться?',
        'А можно что-то поесть или лучше не надо?',
        'Ясно. А завтра обязательно к вам приехать?',
      ],
      objections: [
        'Ну... не знаю. Это все равно очень дорого.',
        'Хм... Звучит неплохо, но мне надо подумать.',
        'Может быть... Но я все равно не уверен.',
        'Понятно, что вы говорите, но у меня есть сомнения.',
        'Да, я слышу вас, но это не снимает мою проблему.',
        'Хорошо, но можно как-то еще дешевле?',
        'А если я пока не буду ставить, что будет?',
        'Понял ваши аргументы, но мне нужно время решить.',
        'Интересно... А можно сделать по-другому?',
        'Ясно. А у вас есть какие-то скидки или акции?',
      ],
    };

    const scenarioResponses = responsesByScenario[this.profile.scenario] || responsesByScenario.consultation;
    return scenarioResponses[Math.floor(Math.random() * scenarioResponses.length)];
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
    if (effectiveness >= 90) {
      const excellentResponses = [
        'Да, здоровье это главное. Вы меня полностью убедили! Давайте договоримся о записи прямо сейчас.',
        'Отлично объяснили! Теперь все понятно. Я готов начинать. Когда можно записаться?',
        'Вау! Вы правы на все 100%. Я не думал об этом с такой стороны. Это действительно инвестиция!',
        'Блестяще! Вы развеяли все мои сомнения. Я полностью согласен, давайте начнем.',
        'Спасибо огромное! Вы так подробно все объяснили, что я даже не знаю, о чем еще спросить. Записываемся!',
        'Идеально! Теперь я вижу всю картину целиком. Больше вопросов нет, поехали!',
      ];
      return excellentResponses[Math.floor(Math.random() * excellentResponses.length)];
    }
    
    if (effectiveness >= 80) {
      const strongResponses = [
        'Да, здоровье это главное. Вы меня убедили! Давайте обсудим детали.',
        'Спасибо за подробное объяснение! Теперь все понятно. Когда можно начать?',
        'Вы правы, я не думал об этом с такой стороны. Это действительно разумно!',
        'Отлично, что вы так объяснили. Я готов двигаться дальше.',
        'Хорошие аргументы! Вы меня почти убедили. Давайте договоримся.',
        'Да, теперь я вижу смысл. Вы действительно эксперт в своем деле!',
      ];
      return strongResponses[Math.floor(Math.random() * strongResponses.length)];
    }
    
    if (effectiveness >= 70) {
      const goodResponses = [
        'Да, я понимаю ваши аргументы. Звучит разумно.',
        'Хм... Интересная точка зрения. Я подумаю над этим серьезно.',
        'Спасибо за разъяснение! Теперь мне стало понятнее.',
        'Действительно, если посмотреть в долгосрочной перспективе, это выгоднее.',
        'Хорошо, вы меня почти убедили. Но мне нужно еще немного подумать.',
        'Понятно. Ваши доводы имеют смысл. Я склоняюсь к согласию.',
      ];
      return goodResponses[Math.floor(Math.random() * goodResponses.length)];
    }
    
    if (effectiveness >= 60) {
      const okayResponses = [
        'Ну... звучит неплохо. Но у меня все еще есть вопросы.',
        'Может быть, вы и правы. Но мне надо все взвесить.',
        'Я слышу ваши доводы, но не уверен окончательно.',
        'Понятно... Надо подумать серьезно над этим.',
        'Хм, возможно. Но это все равно непростое решение.',
      ];
      return okayResponses[Math.floor(Math.random() * okayResponses.length)];
    }

    if (effectiveness >= 50) {
      const neutralResponses = [
        'Ну... не знаю. Мне нужно еще подумать.',
        'Возможно, вы правы, но это все равно дорого...',
        'Да, я слышу вас, но у меня все еще есть сомнения.',
        'Понятно... но можно ли как-то по-другому?',
        'Хм... Я пока не готов принять решение.',
        'Мне нужно время обдумать все это.',
      ];
      return neutralResponses[Math.floor(Math.random() * neutralResponses.length)];
    }
    
    if (effectiveness >= 40) {
      const skepticalResponses = [
        'Извините, но я не очень понимаю, в чем выгода.',
        'Это все хорошо звучит, но на деле...',
        'Не убедительно. У меня все те же вопросы.',
        'Вы так и не ответили на мой главный вопрос.',
        'Сомневаюсь я во всем этом...',
      ];
      return skepticalResponses[Math.floor(Math.random() * skepticalResponses.length)];
    }

    const weakResponses = [
      'Извините, но я все равно не понимаю, зачем платить столько.',
      'Нет, это слишком. Я лучше поищу другие варианты.',
      'Вы не объяснили конкретно, в чем выгода для меня.',
      'Мне кажется, вы просто хотите продать подороже...',
      'Совсем не убедили. Я пойду в другую клинику.',
      'Нет, спасибо. Я лучше вообще без зуба буду жить.',
      'Это какой-то развод. Не буду я тратить такие деньги.',
      'Вы меня совершенно не слушаете! Я же говорю - дорого!',
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
    
    if (this.nonsenseMessageCount > 0) {
      recommendations.push('Пишите осмысленные сообщения - пациент не понимает бессмыслицу');
      missedOpportunities.push(`Отправили ${this.nonsenseMessageCount} бессмысленных сообщений`);
    }
    
    if (this.consecutiveNonsense >= 3) {
      recommendations.push('КРИТИЧНО: Пациент разозлился из-за многократной бессмыслицы в ваших сообщениях!');
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