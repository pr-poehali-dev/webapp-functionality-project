export interface SimulatorScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  patientName: string;
  situation: string;
  initialMessage: string;
  correctBehaviors: string[];
  wrongBehaviors: string[];
  targetParameters: {
    empathy: number;
    professionalism: number;
    efficiency: number;
    salesSkill: number;
    conflictResolution: number;
  };
}

export interface DialogueChoice {
  id: number;
  text: string;
  type: 'good' | 'neutral' | 'bad';
  impact: {
    empathy?: number;
    professionalism?: number;
    efficiency?: number;
    salesSkill?: number;
    conflictResolution?: number;
  };
  patientResponse: string;
  explanation?: string;
}

export interface SimulatorState {
  scenario: SimulatorScenario;
  currentStep: number;
  parameters: {
    empathy: number;
    professionalism: number;
    efficiency: number;
    salesSkill: number;
    conflictResolution: number;
  };
  dialogue: Array<{
    speaker: 'admin' | 'patient';
    text: string;
    timestamp: number;
  }>;
  isCompleted: boolean;
  finalScore?: number;
}

export const SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  {
    id: 'first_call',
    title: 'Первый звонок пациента',
    description: 'Пациент звонит впервые, хочет записаться на консультацию',
    difficulty: 'easy',
    patientName: 'Мария Ивановна',
    situation: 'Женщина 45 лет звонит впервые, беспокоит зуб, но не знает к какому врачу нужно',
    initialMessage: 'Добрый день! У меня зуб болит... Подскажите, что мне делать?',
    correctBehaviors: [
      'Поздороваться и представиться',
      'Задать уточняющие вопросы о боли',
      'Проявить эмпатию',
      'Предложить запись к нужному специалисту',
      'Уточнить удобное время'
    ],
    wrongBehaviors: [
      'Сразу перевести на другого сотрудника',
      'Начать говорить о ценах без выяснения проблемы',
      'Быть безразличным к проблеме',
      'Давить на срочность без понимания ситуации'
    ],
    targetParameters: {
      empathy: 80,
      professionalism: 70,
      efficiency: 60,
      salesSkill: 40,
      conflictResolution: 50
    }
  },
  {
    id: 'price_objection',
    title: 'Возражение по цене',
    description: 'Пациент считает лечение слишком дорогим',
    difficulty: 'medium',
    patientName: 'Андрей Петрович',
    situation: 'Мужчина 38 лет, нужна имплантация, но цена его не устраивает',
    initialMessage: 'Вы серьёзно? 80 тысяч за один зуб?! Это же грабёж! У конкурентов на 20 тысяч дешевле!',
    correctBehaviors: [
      'Сохранять спокойствие',
      'Выяснить бюджет пациента',
      'Объяснить из чего складывается цена',
      'Предложить варианты (рассрочка, этапы)',
      'Показать ценность услуги'
    ],
    wrongBehaviors: [
      'Обижаться или защищаться',
      'Сразу давать скидку',
      'Критиковать конкурентов',
      'Говорить "если дорого - идите к другим"'
    ],
    targetParameters: {
      empathy: 60,
      professionalism: 85,
      efficiency: 70,
      salesSkill: 90,
      conflictResolution: 80
    }
  },
  {
    id: 'angry_patient',
    title: 'Конфликтный пациент',
    description: 'Пациент недоволен долгим ожиданием',
    difficulty: 'hard',
    patientName: 'Виктор Сергеевич',
    situation: 'Мужчина 52 года ждёт приёма уже 40 минут, очень раздражён',
    initialMessage: 'Я жду уже ЧАС! Что за безобразие?! У меня дела, я не могу тут весь день торчать! Вызовите администратора!',
    correctBehaviors: [
      'Искренне извиниться',
      'Выяснить причину задержки',
      'Предложить конкретное решение',
      'Не оправдываться, а действовать',
      'Предложить компенсацию'
    ],
    wrongBehaviors: [
      'Говорить "все так ждут"',
      'Винить врача при пациенте',
      'Игнорировать эмоции',
      'Отправить жаловаться выше'
    ],
    targetParameters: {
      empathy: 85,
      professionalism: 90,
      efficiency: 80,
      salesSkill: 50,
      conflictResolution: 95
    }
  },
  {
    id: 'upsell_cleaning',
    title: 'Допродажа услуг',
    description: 'Пациент пришёл на чистку, можно предложить отбеливание',
    difficulty: 'medium',
    patientName: 'Елена Викторовна',
    situation: 'Женщина 32 года, регулярная пациентка, интересуется красивой улыбкой',
    initialMessage: 'Спасибо! Чистка прошла отлично. Зубы такие гладкие стали! Правда, цвет всё равно не идеальный...',
    correctBehaviors: [
      'Похвалить за регулярность ухода',
      'Задать вопросы о желаемом результате',
      'Рассказать про отбеливание естественно',
      'Показать фото до/после',
      'Не давить, а заинтересовать'
    ],
    wrongBehaviors: [
      'Агрессивно продавать',
      'Говорить "у вас желтые зубы"',
      'Называть только цену без объяснений',
      'Игнорировать сигнал интереса'
    ],
    targetParameters: {
      empathy: 70,
      professionalism: 80,
      efficiency: 75,
      salesSkill: 90,
      conflictResolution: 50
    }
  },
  {
    id: 'scared_child',
    title: 'Испуганный ребёнок',
    description: 'Родитель с ребёнком, который очень боится стоматолога',
    difficulty: 'medium',
    patientName: 'Ольга Андреевна (мама Саши)',
    situation: 'Мама с сыном 7 лет, мальчик плачет и отказывается заходить в кабинет',
    initialMessage: 'Саша, ну перестань! Извините, он очень боится... В прошлый раз в другой клинике был кошмар. Может, не получится сегодня?',
    correctBehaviors: [
      'Успокоить и маму, и ребёнка',
      'Предложить познакомиться с врачом',
      'Рассказать про детский подход',
      'Не торопить события',
      'Создать комфорт'
    ],
    wrongBehaviors: [
      'Говорить "все дети так себя ведут"',
      'Настаивать на срочности лечения',
      'Игнорировать страх ребёнка',
      'Перекладывать ответственность на маму'
    ],
    targetParameters: {
      empathy: 95,
      professionalism: 75,
      efficiency: 60,
      salesSkill: 40,
      conflictResolution: 85
    }
  },
  {
    id: 'vip_patient',
    title: 'VIP-пациент',
    description: 'Требовательный пациент с высокими ожиданиями',
    difficulty: 'hard',
    patientName: 'Михаил Константинович',
    situation: 'Бизнесмен 48 лет, готов платить, но ожидает исключительного сервиса',
    initialMessage: 'Мне нужно срочно попасть к лучшему ортопеду. Завтра в 10 утра. Я готов доплатить за срочность. Это возможно?',
    correctBehaviors: [
      'Уважительный тон',
      'Быстро проверить возможность',
      'Предложить варианты',
      'Подчеркнуть индивидуальный подход',
      'Зафиксировать договорённости'
    ],
    wrongBehaviors: [
      'Сразу сказать "нет"',
      'Тянуть с ответом',
      'Пообещать невозможное',
      'Быть слишком фамильярным'
    ],
    targetParameters: {
      empathy: 70,
      professionalism: 95,
      efficiency: 90,
      salesSkill: 85,
      conflictResolution: 75
    }
  },
  {
    id: 'payment_issue',
    title: 'Проблема с оплатой',
    description: 'Пациент не может оплатить лечение прямо сейчас',
    difficulty: 'medium',
    patientName: 'Наталья Владимировна',
    situation: 'Женщина 41 год, закончила лечение, но забыла карту дома',
    initialMessage: 'Ой, я карту дома забыла! А наличных нет... Что делать? Я могу завтра привезти деньги?',
    correctBehaviors: [
      'Сохранять спокойствие',
      'Предложить альтернативы (СБП, перевод)',
      'Уточнить когда сможет оплатить',
      'Оформить документы правильно',
      'Сохранить хорошее отношение'
    ],
    wrongBehaviors: [
      'Обвинять в безответственности',
      'Паниковать',
      'Требовать оставить документы',
      'Создавать неловкую ситуацию'
    ],
    targetParameters: {
      empathy: 75,
      professionalism: 85,
      efficiency: 80,
      salesSkill: 60,
      conflictResolution: 70
    }
  }
];

export class AdminSimulator {
  private state: SimulatorState;
  private dialogueTree: Map<number, DialogueChoice[]> = new Map();

  constructor(scenarioId: string) {
    const scenario = SIMULATOR_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    this.state = {
      scenario,
      currentStep: 0,
      parameters: {
        empathy: 50,
        professionalism: 50,
        efficiency: 50,
        salesSkill: 50,
        conflictResolution: 50
      },
      dialogue: [{
        speaker: 'patient',
        text: scenario.initialMessage,
        timestamp: Date.now()
      }],
      isCompleted: false
    };

    this.buildDialogueTree(scenarioId);
  }

  private buildDialogueTree(scenarioId: string): void {
    const trees: Record<string, Map<number, DialogueChoice[]>> = {
      first_call: this.buildFirstCallTree(),
      price_objection: this.buildPriceObjectionTree(),
      angry_patient: this.buildAngryPatientTree(),
      upsell_cleaning: this.buildUpsellTree(),
      scared_child: this.buildScaredChildTree(),
      vip_patient: this.buildVipPatientTree(),
      payment_issue: this.buildPaymentIssueTree()
    };

    this.dialogueTree = trees[scenarioId] || new Map();
  }

  private buildFirstCallTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    // Шаг 0: Начало разговора
    tree.set(0, [
      {
        id: 1,
        text: 'Добрый день! Меня зовут Анна, я администратор клиники "Команда мечты". Расскажите, пожалуйста, что вас беспокоит?',
        type: 'good',
        impact: { empathy: +8, professionalism: +8 },
        patientResponse: 'Ой, спасибо! У меня вот верхний зуб справа болит, особенно когда холодное пью. Уже дня три так...',
        explanation: 'Отлично! Вы представились, проявили участие и задали открытый вопрос.'
      },
      {
        id: 2,
        text: 'Слушаю вас. К какому врачу хотите записаться?',
        type: 'neutral',
        impact: { professionalism: +3, efficiency: +3 },
        patientResponse: 'Ну... я не знаю, к какому... У меня просто зуб болит.',
        explanation: 'Профессионально, но суховато. Лучше сначала выяснить проблему.'
      },
      {
        id: 3,
        text: 'Да-да, слушаю. Что у вас там?',
        type: 'bad',
        impact: { empathy: -8, professionalism: -5 },
        patientResponse: 'Эм... У меня зуб болит... Вы меня вообще слушаете?',
        explanation: 'Слишком небрежно. Пациент почувствовал, что вы не заинтересованы.'
      },
      {
        id: 201,
        text: 'Здравствуйте! Клиника "Команда мечты", чем могу помочь?',
        type: 'neutral',
        impact: { professionalism: +5 },
        patientResponse: 'Здравствуйте! У меня зуб болит, записаться можно?',
        explanation: 'Нормально, но можно было теплее и с уточнением проблемы.'
      },
      {
        id: 202,
        text: 'Клиника "Команда мечты", добрый день! Я Анна, с удовольствием помогу вам записаться. Что именно беспокоит?',
        type: 'good',
        impact: { empathy: +7, professionalism: +7 },
        patientResponse: 'Спасибо! Зуб болит справа сверху, от холодного прям ноет...',
        explanation: 'Очень хорошо! Представились, дружелюбно, сразу к делу.'
      }
    ]);

    // Шаг 1: Уточнение симптомов
    tree.set(1, [
      {
        id: 4,
        text: 'Понимаю, это неприятно. Скажите, боль постоянная или только при контакте с холодным? Может, что-то ещё беспокоит?',
        type: 'good',
        impact: { empathy: +7, professionalism: +6 },
        patientResponse: 'В основном от холодного. И ещё иногда при жевании немного ноет. Пломба там старая стоит...',
        explanation: 'Отлично! Вы задаёте уточняющие вопросы — это помогает врачу.'
      },
      {
        id: 5,
        text: 'Хорошо, запишу вас к врачу. Когда удобно?',
        type: 'neutral',
        impact: { efficiency: +4 },
        patientResponse: 'Подождите, а к какому именно? И что мне делать до приёма, терпеть?',
        explanation: 'Слишком быстрый переход к записи без уточнения деталей.'
      },
      {
        id: 203,
        text: 'Три дня болит? А боль усиливается или так и держится? Опухоли нет?',
        type: 'good',
        impact: { empathy: +6, professionalism: +7 },
        patientResponse: 'Нет, вроде не опухло. Боль то сильнее, то меньше... Что это может быть?',
        explanation: 'Хорошие уточняющие вопросы, показываете заботу.'
      },
      {
        id: 204,
        text: 'Понятно. Вам к терапевту нужно. Когда можете прийти?',
        type: 'neutral',
        impact: { efficiency: +3, professionalism: +2 },
        patientResponse: 'А что мне делать до приёма? Как боль снять?',
        explanation: 'Слишком быстро перешли к записи, не дали рекомендаций.'
      }
    ]);

    // Шаг 2: Продолжение после хороших вопросов
    tree.set(2, [
      {
        id: 100,
        text: 'Ага, а какой врач мне нужен? Я в этом не разбираюсь совсем...',
        type: 'neutral',
        impact: {},
        patientResponse: 'Ага, а какой врач мне нужен? Я в этом не разбираюсь совсем...',
        explanation: ''
      }
    ]);

    // Шаг 4: Выбор врача и рекомендации
    tree.set(4, [
      {
        id: 6,
        text: 'Судя по симптомам, вам нужен стоматолог-терапевт. Возможно, под пломбой развился кариес. До приёма избегайте холодного и жевания на эту сторону. Когда вам удобно прийти?',
        type: 'good',
        impact: { empathy: +7, professionalism: +8, efficiency: +6 },
        patientResponse: 'О, спасибо за совет! А можно сегодня или завтра? А то я уже измучилась...',
        explanation: 'Превосходно! Вы объяснили, дали рекомендации и перешли к записи.'
      },
      {
        id: 7,
        text: 'Вам к терапевту. У нас ближайшее окно через 5 дней.',
        type: 'bad',
        impact: { empathy: -7, efficiency: -6 },
        patientResponse: 'Через 5 дней?! Но мне же больно! Неужели раньше нельзя?!',
        explanation: 'Вы не учли срочность. При боли нужно искать ближайшее время.'
      }
    ]);

    // Шаг 5: Плохой вариант - пациент расстроен
    tree.set(5, [
      {
        id: 101,
        text: 'А к терапевту когда можно попасть?',
        type: 'neutral',
        impact: {},
        patientResponse: 'А к терапевту когда можно попасть?',
        explanation: ''
      }
    ]);

    tree.set(101, [
      {
        id: 102,
        text: 'Понимаю вашу ситуацию. Сейчас проверю все варианты...',
        type: 'good',
        impact: { empathy: +5, efficiency: +5 },
        patientResponse: 'Ну пожалуйста, а то я правда не могу так ходить...',
        explanation: 'Хорошо, что вы показали понимание.'
      }
    ]);

    tree.set(102, [
      {
        id: 8,
        text: 'Есть окно сегодня в 18:00 или завтра утром в 9:30. Оба варианта у опытного терапевта. Что удобнее?',
        type: 'good',
        impact: { efficiency: +8, professionalism: +7 },
        patientResponse: 'Завтра в 9:30 идеально! А сколько это будет стоить примерно?',
        explanation: 'Отлично! Конкретные варианты и выбор для пациента.'
      }
    ]);

    // Шаг 6: Обсуждение цены
    tree.set(6, [
      {
        id: 8,
        text: 'Сейчас проверю расписание... Есть окно сегодня в 18:00 или завтра в 9:30. Что вам удобнее?',
        type: 'good',
        impact: { efficiency: +7, professionalism: +6 },
        patientResponse: 'Завтра в 9:30 отлично! А сколько это будет стоить примерно?',
        explanation: 'Отлично! Вы предложили конкретные варианты и дали выбор.'
      },
      {
        id: 9,
        text: 'Приходите завтра утром, постараемся принять',
        type: 'neutral',
        impact: { empathy: +3, efficiency: -4 },
        patientResponse: 'А во сколько конкретно? У меня работа, мне нужно точное время...',
        explanation: 'Слишком расплывчато. Пациенту нужна конкретика.'
      }
    ]);

    // Шаг 7: Плохой путь возвращается
    tree.set(7, [
      {
        id: 103,
        text: 'Сейчас ещё раз посмотрю, может освободится окно...',
        type: 'good',
        impact: { empathy: +6, efficiency: +5 },
        patientResponse: 'Буду очень благодарна!',
        explanation: 'Хорошо, что продолжаете искать варианты.'
      }
    ]);

    tree.set(103, [
      {
        id: 8,
        text: 'Отлично! Нашла окно на завтра в 9:30. Записать вас?',
        type: 'good',
        impact: { efficiency: +6, professionalism: +5 },
        patientResponse: 'Да, конечно! А сколько это будет стоить?',
        explanation: 'Вы нашли решение, молодец!'
      }
    ]);

    // Шаг 8: Объяснение цены
    tree.set(8, [
      {
        id: 10,
        text: 'Первичный осмотр и консультация — 1500 рублей. Врач осмотрит, сделает снимок если нужно, и озвучит план лечения с точными ценами. Вас устроит?',
        type: 'good',
        impact: { professionalism: +7, salesSkill: +7 },
        patientResponse: 'Да, хорошо, понятно. А снимок входит в эту цену?',
        explanation: 'Отлично! Вы честно назвали цену и объяснили, что входит.'
      },
      {
        id: 11,
        text: 'Зависит от лечения, может от 3 до 25 тысяч',
        type: 'bad',
        impact: { professionalism: -8, salesSkill: -10 },
        patientResponse: 'ЧТО?! 25 тысяч?! Я думала это тысячи 3-4 максимум... Мне нужно подумать...',
        explanation: 'Вы напугали пациента диапазоном без объяснений.'
      }
    ]);

    // Шаг 9: Нейтральный путь корректируется
    tree.set(9, [
      {
        id: 104,
        text: 'Мне нужно в 9:30, это возможно?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Мне нужно в 9:30, это возможно?',
        explanation: ''
      }
    ]);

    tree.set(104, [
      {
        id: 8,
        text: 'Да, на 9:30 завтра есть место. Записываю вас. Теперь про стоимость...',
        type: 'good',
        impact: { efficiency: +6, professionalism: +5 },
        patientResponse: 'Да, сколько это будет стоить?',
        explanation: 'Хорошо, уточнили время и переходите к цене.'
      }
    ]);

    // Шаг 10: Уточнение про снимок
    tree.set(10, [
      {
        id: 12,
        text: 'Снимок оплачивается отдельно — 500 рублей, если врач решит, что он необходим. Но возможно он и не понадобится. Записать вас на завтра в 9:30?',
        type: 'good',
        impact: { professionalism: +7, efficiency: +6 },
        patientResponse: 'Да, записывайте! Что с собой нужно взять?',
        explanation: 'Честно и понятно объяснили. Пациент доволен.'
      },
      {
        id: 13,
        text: 'Да, всё включено',
        type: 'bad',
        impact: { professionalism: -6, efficiency: -5 },
        patientResponse: 'Точно всё включено? А то потом доплачивать не хочу...',
        explanation: 'Не стоит обещать то, в чём не уверены. Это создаст проблемы.'
      }
    ]);

    // Шаг 11: Плохой путь - испуганный пациент
    tree.set(11, [
      {
        id: 105,
        text: 'Подождите! Я имела в виду максимум, если понадобится сложное лечение. А консультация всего 1500. Врач всё объяснит и вы ничего не будете делать без согласия!',
        type: 'good',
        impact: { empathy: +8, salesSkill: +8, conflictResolution: +7 },
        patientResponse: 'Ааа, ну это другое дело! Я просто испугалась... Ладно, записывайте на завтра',
        explanation: 'Отлично спасли ситуацию! Быстро объяснили и успокоили.'
      },
      {
        id: 106,
        text: 'Ну если дорого, можете в другие клиники посмотреть',
        type: 'bad',
        impact: { empathy: -10, salesSkill: -12, conflictResolution: -8 },
        patientResponse: 'Вот так? Ну ладно, посмотрю в других местах. Досвидания.',
        explanation: 'Катастрофа! Вы потеряли пациента.'
      }
    ]);

    // Шаг 12: Финальное оформление записи
    tree.set(12, [
      {
        id: 14,
        text: 'Паспорт и полис ОМС, если есть. Ещё запишите адрес: ул. Ленина, 15, 3 этаж. Приходите за 5 минут, заполните анкету. Вам на номер придёт SMS-напоминание. Что-то ещё уточнить?',
        type: 'good',
        impact: { professionalism: +8, efficiency: +7 },
        patientResponse: 'Нет, всё понятно! А парковка там есть?',
        explanation: 'Превосходно! Вы дали всю необходимую информацию чётко и структурировано.'
      },
      {
        id: 15,
        text: 'Паспорт возьмите. Адрес вышлю в SMS',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'А адрес какой? И во сколько точно прийти?',
        explanation: 'Слишком кратко. Пациенту нужна полная информация сразу.'
      }
    ]);

    // Шаг 13: Путь после неудачного ответа про снимок
    tree.set(13, [
      {
        id: 107,
        text: 'Простите, уточню у врача про снимок точно. Сейчас позвоню... Да, снимок отдельно 500р, если понадобится.',
        type: 'good',
        impact: { professionalism: +6, empathy: +5 },
        patientResponse: 'Хорошо, спасибо что уточнили. Записывайте тогда.',
        explanation: 'Хорошо, что исправили ситуацию и дали точную информацию.'
      }
    ]);

    tree.set(107, [
      {
        id: 14,
        text: 'Отлично! Завтра в 9:30. Что с собой взять?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Паспорт, наверное? А адрес какой?',
        explanation: ''
      }
    ]);

    // Шаг 14: Вопрос про парковку
    tree.set(14, [
      {
        id: 16,
        text: 'Да, есть своя парковка во дворе, бесплатная для пациентов. Въезд с улицы Гагарина. Жду вас завтра в 9:30! Выздоравливайте!',
        type: 'good',
        impact: { empathy: +7, professionalism: +8 },
        patientResponse: 'Супер, спасибо большое! До завтра!',
        explanation: 'Идеально! Ответили на все вопросы, создали приятное впечатление.'
      },
      {
        id: 17,
        text: 'Да, где-то рядом есть',
        type: 'neutral',
        impact: { professionalism: -3 },
        patientResponse: 'А точнее? Просто я на машине приеду...',
        explanation: 'Расплывчатый ответ. Нужно давать конкретную информацию.'
      }
    ]);

    // Шаг 15: Доп вопросы после краткого ответа
    tree.set(15, [
      {
        id: 108,
        text: 'Адрес: ул. Ленина 15, третий этаж. Приходите к 9:25, чтобы заполнить анкету. Хорошо?',
        type: 'good',
        impact: { professionalism: +6, efficiency: +5 },
        patientResponse: 'Да, понятно. А парковка есть?',
        explanation: 'Дали нужные детали.'
      }
    ]);

    tree.set(108, [
      {
        id: 16,
        text: 'Есть парковка во дворе, бесплатная. Въезд с ул. Гагарина. До встречи!',
        type: 'good',
        impact: { professionalism: +6 },
        patientResponse: 'Отлично, спасибо! До завтра!',
        explanation: 'Хорошо завершили разговор.'
      }
    ]);

    // Шаг 17: Уточнение про парковку
    tree.set(17, [
      {
        id: 109,
        text: 'Есть своя парковка во дворе дома, въезд с улицы Гагарина. Для пациентов бесплатно!',
        type: 'good',
        impact: { professionalism: +5 },
        patientResponse: 'Понятно, спасибо! Тогда до завтра!',
        explanation: 'Дали точную информацию.'
      }
    ]);

    // Шаг 105: Спасли после отпугивания ценой
    tree.set(105, [
      {
        id: 110,
        text: 'Хорошо, но что мне с собой взять?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Хорошо, но что мне с собой взять?',
        explanation: ''
      }
    ]);

    tree.set(110, [
      {
        id: 14,
        text: 'Паспорт и полис ОМС. Адрес: ул. Ленина 15, третий этаж. Приходите к 9:25. Ещё вопросы?',
        type: 'good',
        impact: { professionalism: +6 },
        patientResponse: 'А парковка есть?',
        explanation: 'Дали основную информацию.'
      }
    ]);

    // Шаг 201: Путь от простого приветствия
    tree.set(201, [
      {
        id: 205,
        text: 'Конечно! Расскажите, что именно беспокоит? Какие симптомы?',
        type: 'good',
        impact: { empathy: +6, professionalism: +6 },
        patientResponse: 'Зуб справа болит, от холодного особенно. Дня три уже...',
        explanation: 'Хорошо, стали уточнять симптомы.'
      },
      {
        id: 206,
        text: 'Да, к терапевту есть окна. Когда удобно?',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'А как срочно можно? Мне больно...',
        explanation: 'Пропустили уточнение симптомов.'
      }
    ]);

    tree.set(202, [
      {
        id: 4,
        text: 'Понимаю. Боль постоянная или от чего-то конкретного? Как давно началось?',
        type: 'good',
        impact: { empathy: +6, professionalism: +6 },
        patientResponse: 'От холодного в основном. Три дня назад началось...',
        explanation: 'Правильные уточняющие вопросы.'
      }
    ]);

    tree.set(203, [
      {
        id: 207,
        text: 'Скорее всего это кариес под пломбой или чувствительность. Но точно скажет врач после осмотра. До приёма можете принять обезболивающее и избегать холодного. Когда вам удобно прийти?',
        type: 'good',
        impact: { empathy: +7, professionalism: +7, efficiency: +6 },
        patientResponse: 'Спасибо! А сегодня или завтра можно?',
        explanation: 'Отлично! Дали предварительный ответ, рекомендации и перешли к записи.'
      },
      {
        id: 208,
        text: 'Это нужно смотреть врачу. Приходите на консультацию.',
        type: 'neutral',
        impact: { professionalism: +2 },
        patientResponse: 'Ясно... А когда можно прийти? Мне же больно...',
        explanation: 'Формально правильно, но холодновато.'
      }
    ]);

    tree.set(204, [
      {
        id: 209,
        text: 'До приёма можете принять обезболивающее - нурофен или кеторол. Избегайте холодного и жевания на эту сторону. У нас есть окно сегодня в 18:00 или завтра утром в 9:30. Что удобнее?',
        type: 'good',
        impact: { empathy: +7, professionalism: +7, efficiency: +6 },
        patientResponse: 'Спасибо за совет! Завтра утром лучше. А сколько будет стоить?',
        explanation: 'Отлично! Дали рекомендации и предложили варианты времени.'
      }
    ]);

    tree.set(205, [
      {
        id: 4,
        text: 'Понимаю, неприятно. Боль от холодного и при жевании - классические признаки. Вам нужен терапевт. Расскажу про время приёма?',
        type: 'good',
        impact: { empathy: +6, professionalism: +6 },
        patientResponse: 'Да, пожалуйста! Желательно поскорее...',
        explanation: 'Хорошо ведёте диалог.'
      }
    ]);

    tree.set(206, [
      {
        id: 210,
        text: 'Давайте уточню: боль сильная? Опухоль есть? Это поможет подобрать время.',
        type: 'good',
        impact: { empathy: +6, professionalism: +6 },
        patientResponse: 'Не очень сильная, но ноет. Опухоли нет.',
        explanation: 'Правильно вернулись к уточнению симптомов.'
      }
    ]);

    tree.set(207, [
      {
        id: 8,
        text: 'Сейчас проверю расписание... Есть окно сегодня в 18:00 или завтра в 9:30. Что удобнее?',
        type: 'good',
        impact: { efficiency: +6, professionalism: +6 },
        patientResponse: 'Завтра в 9:30 хорошо! Сколько стоит консультация?',
        explanation: 'Предложили конкретные варианты.'
      }
    ]);

    tree.set(208, [
      {
        id: 211,
        text: 'Понимаю, что больно. Есть сегодня в 18:00 или завтра утром. Выбирайте что удобно.',
        type: 'good',
        impact: { empathy: +5, efficiency: +5 },
        patientResponse: 'Завтра утром во сколько? И сколько это стоит?',
        explanation: 'Учли срочность, предложили варианты.'
      }
    ]);

    tree.set(209, [
      {
        id: 10,
        text: 'Консультация и осмотр - 1500 рублей. Врач осмотрит, при необходимости сделает снимок и составит план лечения. Устроит?',
        type: 'good',
        impact: { professionalism: +6, salesSkill: +6 },
        patientResponse: 'Да, нормально. А снимок в эту цену входит?',
        explanation: 'Чётко объяснили стоимость и что входит.'
      }
    ]);

    tree.set(210, [
      {
        id: 212,
        text: 'Хорошо, тогда не экстренный случай. У нас есть сегодня вечером в 18:00 или завтра в 9:30. Что удобнее?',
        type: 'good',
        impact: { professionalism: +6, efficiency: +6 },
        patientResponse: 'Завтра утром лучше. Сколько будет стоить приём?',
        explanation: 'Правильно оценили ситуацию и предложили время.'
      }
    ]);

    tree.set(211, [
      {
        id: 213,
        text: 'Завтра в 9:30. Консультация 1500 рублей. Записать?',
        type: 'neutral',
        impact: { efficiency: +4 },
        patientResponse: 'А что входит в эту консультацию?',
        explanation: 'Надо было сразу пояснить что входит в цену.'
      }
    ]);

    tree.set(212, [
      {
        id: 10,
        text: 'Первичный приём - 1500 рублей. Это осмотр, консультация, при необходимости снимок за доп. плату 500р. Врач всё объяснит и составит план. Записываю?',
        type: 'good',
        impact: { professionalism: +7, salesSkill: +6 },
        patientResponse: 'Да, записывайте! Что взять с собой?',
        explanation: 'Подробно и честно объяснили.'
      }
    ]);

    tree.set(213, [
      {
        id: 214,
        text: 'Осмотр, консультация врача, при необходимости снимок. Врач составит план лечения с ценами.',
        type: 'good',
        impact: { professionalism: +5 },
        patientResponse: 'Понятно. Записывайте тогда.',
        explanation: 'Объяснили, что входит.'
      }
    ]);

    tree.set(214, [
      {
        id: 14,
        text: 'Отлично! Паспорт и полис если есть. Адрес: ул. Ленина 15, 3 этаж. Завтра в 9:30. Приходите минут за 5 для оформления.',
        type: 'good',
        impact: { professionalism: +6 },
        patientResponse: 'Хорошо, спасибо! Парковка есть?',
        explanation: 'Дали всю нужную информацию.'
      }
    ]);

    return tree;
  }

  private buildPriceObjectionTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    // Шаг 0: Реакция на возмущение
    tree.set(0, [
      {
        id: 1,
        text: 'Андрей Петрович, я понимаю ваше удивление. Давайте я подробно расскажу, из чего складывается эта сумма?',
        type: 'good',
        impact: { empathy: +7, conflictResolution: +8, salesSkill: +6 },
        patientResponse: 'Ну давайте, интересно послушать, за что такие деньги...',
        explanation: 'Отлично! Вы сохранили спокойствие и предложили объяснить.'
      },
      {
        id: 2,
        text: 'Это включает имплант премиум-класса, работу хирурга, анестезию...',
        type: 'neutral',
        impact: { professionalism: +3 },
        patientResponse: 'Да-да, я всё это понимаю, но всё равно очень дорого!',
        explanation: 'Вы начали объяснять, но не учли эмоции пациента.'
      },
      {
        id: 3,
        text: 'Если вам дорого, то вы можете поискать клиники подешевле',
        type: 'bad',
        impact: { empathy: -12, salesSkill: -15, conflictResolution: -12 },
        patientResponse: 'Вот так вот? Понятно. Ну ладно, пойду в ту клинику тогда!',
        explanation: 'Катастрофа! Вы потеряли пациента.'
      },
      {
        id: 301,
        text: 'Андрей Петрович, полностью вас понимаю - сумма действительно серьёзная. Но давайте я покажу, из чего она складывается и почему это выгодное вложение.',
        type: 'good',
        impact: { empathy: +8, conflictResolution: +8, salesSkill: +7 },
        patientResponse: 'Хорошо, слушаю. Но пойм те, это же не шутка - 85 тысяч!',
        explanation: 'Отлично! Признали право на эмоцию и предложили конкретику.'
      },
      {
        id: 302,
        text: 'Да, у нас не самые низкие цены. Зато качество на высоте - швейцарские импланты, опытные врачи.',
        type: 'neutral',
        impact: { professionalism: +4, salesSkill: +2 },
        patientResponse: 'Качество - это хорошо, но 85 тысяч... Может быть варианты подешевле?',
        explanation: 'Начали правильно, но не дали достаточно аргументов.'
      }
    ]);

    // Шаг 1: Детальное объяснение цены
    tree.set(1, [
      {
        id: 4,
        text: 'В стоимость входит швейцарский имплант Nobel Biocare с пожизненной гарантией производителя, работа хирурга-имплантолога высшей категории с опытом 15 лет, все расходные материалы, 3D-планирование операции на современном томографе и год бесплатного наблюдения.',
        type: 'good',
        impact: { professionalism: +8, salesSkill: +10 },
        patientResponse: 'М-да, звучит серьёзно... А у конкурентов что, импланты хуже?',
        explanation: 'Отлично! Вы показали ценность через конкретику.'
      },
      {
        id: 5,
        text: 'Ну смотрите: имплант хороший, работа, материалы... В общем, всё включено',
        type: 'bad',
        impact: { professionalism: -7, salesSkill: -10 },
        patientResponse: 'Это я и сам понимаю. Вопрос — почему на 20 тысяч дороже, чем там?!',
        explanation: 'Слишком расплывчато. Не убедили.'
      }
    ]);

    // Шаг 2: Нейтральный путь возвращается
    tree.set(2, [
      {
        id: 100,
        text: 'Андрей Петрович, я понимаю вашу обеспокоенность. Могу я уточнить, с чем вы сравниваете?',
        type: 'good',
        impact: { empathy: +6, conflictResolution: +7 },
        patientResponse: 'Я же сказал — там же самое за 60 тысяч! В клинике на Садовой.',
        explanation: 'Правильно — сначала выясните, с чем сравнивают.'
      }
    ]);

    tree.set(100, [
      {
        id: 101,
        text: 'Понятно. Скажите, там вам какую систему имплантов предлагают?',
        type: 'good',
        impact: { professionalism: +6, salesSkill: +7 },
        patientResponse: 'Не помню точно... Что-то корейское, кажется. А это важно?',
        explanation: 'Отлично! Вы вышли на ключевое различие.'
      }
    ]);

    tree.set(101, [
      {
        id: 4,
        text: 'Да, очень важно! Корейские импланты — это бюджетный сегмент с гарантией 10 лет. Мы работаем с Nobel Biocare — премиум швейцарский бренд №1 в мире с пожизненной гарантией. Плюс наше оборудование и квалификация врачей.',
        type: 'good',
        impact: { professionalism: +8, salesSkill: +10 },
        patientResponse: 'Хм, то есть разница действительно есть... Но всё равно дорого для меня сейчас.',
        explanation: 'Превосходно! Вы обосновали разницу в цене.'
      }
    ]);

    // Шаг 4: Обсуждение после объяснения про импланты
    tree.set(4, [
      {
        id: 6,
        text: 'Понимаю. Скажите, какая сумма для вас была бы комфортной в месяц? Мы можем предложить рассрочку без процентов.',
        type: 'good',
        impact: { empathy: +8, salesSkill: +12 },
        patientResponse: 'Ну тысяч 5-6 в месяц я бы потянул. А на сколько рассрочка?',
        explanation: 'Отлично! Вы выяснили бюджет и предложили решение.'
      },
      {
        id: 7,
        text: 'Есть рассрочка, но условия надо уточнять',
        type: 'neutral',
        impact: { efficiency: -6 },
        patientResponse: 'То есть вы сами не знаете? Серьёзно?',
        explanation: 'Плохо. Вы должны знать условия рассрочки наизусть.'
      },
      {
        id: 8,
        text: 'Ну значит, вам лучше подойдёт бюджетный вариант в той клинике',
        type: 'bad',
        impact: { salesSkill: -15, empathy: -10 },
        patientResponse: 'Вот именно что подойдёт! Зачем я сюда вообще приехал...',
        explanation: 'Ужасно! Вы сами отправили пациента к конкурентам.'
      }
    ]);

    // Шаг 5: Плохой путь - пациент агрессивен
    tree.set(5, [
      {
        id: 102,
        text: 'Андрей Петрович, давайте я покажу вам прайс от той клиники и наш. Мы сравним что входит в стоимость?',
        type: 'good',
        impact: { professionalism: +7, conflictResolution: +8 },
        patientResponse: 'Ну давайте, раз уж я тут...',
        explanation: 'Хорошая попытка вернуть контроль над разговором.'
      }
    ]);

    tree.set(102, [
      {
        id: 103,
        text: 'Смотрите: у них в 60 тысяч НЕ входит 3D-планирование (8 тыс), формирователь десны (5 тыс), временная коронка (7 тыс), контрольные снимки (3 тыс). Итого там выйдет 83 тысячи минимум. У нас всё включено в 80.',
        type: 'good',
        impact: { salesSkill: +12, professionalism: +10 },
        patientResponse: 'А, так вот в чём подвох! Это да, меняет дело... Но мне сейчас всю сумму тяжело.',
        explanation: 'Блестяще! Вы раскрыли манипуляцию конкурентов.'
      }
    ]);

    tree.set(103, [
      {
        id: 6,
        text: 'Понимаю вас. Какая сумма в месяц была бы комфортной? У нас есть рассрочка до 18 месяцев.',
        type: 'good',
        impact: { empathy: +7, salesSkill: +9 },
        patientResponse: 'Тысяч 5-6 в месяц я потянул бы. Это реально?',
        explanation: 'Хорошо! Вы перешли к обсуждению вариантов.'
      }
    ]);

    // Шаг 6: Обсуждение рассрочки
    tree.set(6, [
      {
        id: 9,
        text: 'Да! На 18 месяцев это будет 4400 рублей в месяц без процентов, без первоначального взноса. Оформляется за 15 минут по паспорту. Устроит такой вариант?',
        type: 'good',
        impact: { salesSkill: +12, efficiency: +8, professionalism: +8 },
        patientResponse: 'О, 4400 — это вообще отлично! А какие документы нужны кроме паспорта?',
        explanation: 'Превосходно! Вы дали конкретику и сняли финансовое возражение.'
      },
      {
        id: 10,
        text: 'Рассрочка есть. От 12 до 24 месяцев, детали обсудите с менеджером',
        type: 'neutral',
        impact: { efficiency: -5 },
        patientResponse: 'А вы сами мне не можете сказать? Сколько это в месяц выйдет?',
        explanation: 'Вы теряете момент. Должны сами знать расчёты.'
      }
    ]);

    // Шаг 7: Плохой путь - не знает рассрочку
    tree.set(7, [
      {
        id: 104,
        text: 'Извините, сейчас уточню условия... На 12 месяцев — 6700р в месяц, на 18 — 4400р',
        type: 'good',
        impact: { professionalism: +5, salesSkill: +6 },
        patientResponse: '4400 мне подходит. Какие документы нужны?',
        explanation: 'Лучше поздно, чем никогда. Но нужно знать это сразу.'
      }
    ]);

    tree.set(104, [
      {
        id: 9,
        text: 'Только паспорт! Оформление за 15 минут, никаких справок. Решение одобрения сразу.',
        type: 'good',
        impact: { efficiency: +6, salesSkill: +7 },
        patientResponse: 'Удобно. А когда можно прийти на консультацию?',
        explanation: 'Хорошо! Движетесь к закрытию сделки.'
      }
    ]);

    // Шаг 9: Детали по рассрочке
    tree.set(9, [
      {
        id: 11,
        text: 'Только паспорт. Никаких справок о доходах, поручителей не нужно. Решение об одобрении получите сразу, за 5 минут. Хотите, я запишу вас на консультацию к хирургу, где он осмотрит и мы сразу оформим рассрочку?',
        type: 'good',
        impact: { salesSkill: +10, efficiency: +8, professionalism: +7 },
        patientResponse: 'Да, давайте! Когда можно прийти? Желательно ближе к вечеру.',
        explanation: 'Отлично! Вы закрываете продажу и ведёте к записи.'
      },
      {
        id: 12,
        text: 'Паспорт и всё. Приходите на консультацию',
        type: 'neutral',
        impact: { efficiency: +4 },
        patientResponse: 'Хорошо. А когда время есть?',
        explanation: 'Работает, но без энтузиазма.'
      }
    ]);

    // Шаг 10: Нейтральный путь - пациент спрашивает сам
    tree.set(10, [
      {
        id: 105,
        text: 'На 18 месяцев это будет 4440 рублей. Подойдёт?',
        type: 'good',
        impact: { salesSkill: +7 },
        patientResponse: 'Да, это нормально. Что дальше?',
        explanation: 'Дали расчёт, продвигаетесь дальше.'
      }
    ]);

    tree.set(105, [
      {
        id: 9,
        text: 'Нужен только паспорт, оформление за 15 минут. Записать вас на консультацию?',
        type: 'good',
        impact: { efficiency: +6, salesSkill: +7 },
        patientResponse: 'Да, давайте. Желательно вечером',
        explanation: 'Хорошо, ведёте к записи.'
      }
    ]);

    // Шаг 11: Запись на консультацию
    tree.set(11, [
      {
        id: 13,
        text: 'Отлично! Есть окно завтра в 18:30 или послезавтра в 19:00 у Игоря Петровича — нашего ведущего имплантолога. Он посмотрит, сделает план, и мы сразу оформим рассрочку, если вас всё устроит. Что выбираете?',
        type: 'good',
        impact: { efficiency: +8, professionalism: +7 },
        patientResponse: 'Завтра в 18:30 отлично. Записывайте!',
        explanation: 'Идеально! Даёте варианты, подчёркиваете экспертность врача.'
      },
      {
        id: 14,
        text: 'Завтра в 18:00 есть. Подойдёт?',
        type: 'neutral',
        impact: { efficiency: +4 },
        patientResponse: 'Да, подойдёт',
        explanation: 'Работает, но можно было эффектнее.'
      }
    ]);

    // Шаг 12: Альтернативный путь записи
    tree.set(12, [
      {
        id: 106,
        text: 'Завтра в 18:30 или послезавтра в 19:00 есть окна. Что удобнее?',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Завтра в 18:30',
        explanation: 'Даёте выбор, хорошо.'
      }
    ]);

    tree.set(106, [
      {
        id: 13,
        text: 'Записал вас на завтра 18:30 к Игорю Петровичу. Он лучший имплантолог клиники.',
        type: 'good',
        impact: { professionalism: +5 },
        patientResponse: 'Хорошо, что с собой взять?',
        explanation: 'Подчеркнули экспертность.'
      }
    ]);

    // Шаг 13: Финальные детали
    tree.set(13, [
      {
        id: 15,
        text: 'Возьмите паспорт, если есть — предыдущие снимки зубов. Адрес: ул. Ленина 15, кабинет 305. Приходите за 10 минут, заполните анкету. Консультация бесплатная. Отправлю вам SMS с напоминанием. Вопросы есть?',
        type: 'good',
        impact: { professionalism: +8, efficiency: +7 },
        patientResponse: 'Всё понятно. А парковка там есть?',
        explanation: 'Идеально! Вся нужная информация структурировано.'
      },
      {
        id: 16,
        text: 'Паспорт. Адрес вышлю в SMS',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'Хорошо. А снимки брать?',
        explanation: 'Слишком кратко.'
      }
    ]);

    // Шаг 14: Запись без выбора времени
    tree.set(14, [
      {
        id: 107,
        text: 'Записал! Что с собой взять?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Паспорт, наверное? Ещё что-то?',
        explanation: ''
      }
    ]);

    tree.set(107, [
      {
        id: 15,
        text: 'Паспорт обязательно. Если есть старые снимки зубов — тоже. Адрес: ул. Ленина 15, каб. 305.',
        type: 'good',
        impact: { professionalism: +5 },
        patientResponse: 'Понятно. Парковка есть?',
        explanation: 'Дали информацию.'
      }
    ]);

    // Шаг 15: Вопрос про парковку
    tree.set(15, [
      {
        id: 17,
        text: 'Да, своя парковка во дворе, бесплатная для пациентов. Въезд с улицы Гагарина, шлагбаум автоматический. До встречи завтра!',
        type: 'good',
        impact: { professionalism: +7 },
        patientResponse: 'Супер! Спасибо, что всё объяснили. До завтра!',
        explanation: 'Отлично завершили! Пациент доволен и придёт.'
      },
      {
        id: 18,
        text: 'Где-то рядом есть парковка',
        type: 'bad',
        impact: { professionalism: -5 },
        patientResponse: 'А точнее? Я же на машине...',
        explanation: 'Расплывчато. Нужна конкретика.'
      }
    ]);

    // Шаг 16: Вопрос про снимки
    tree.set(16, [
      {
        id: 108,
        text: 'Если есть старые снимки зубов — захватите, врачу будет полезно. Если нет — сделаем на месте.',
        type: 'good',
        impact: { professionalism: +5 },
        patientResponse: 'Хорошо, поищу. А парковка есть?',
        explanation: 'Дали полезную информацию.'
      }
    ]);

    tree.set(108, [
      {
        id: 15,
        text: 'Адрес: ул. Ленина 15, каб. 305. Парковка?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Да, есть парковка?',
        explanation: ''
      }
    ]);

    // Шаг 18: Уточнение про парковку
    tree.set(18, [
      {
        id: 109,
        text: 'Своя парковка во дворе, въезд с ул. Гагарина. Для пациентов бесплатно!',
        type: 'good',
        impact: { professionalism: +4 },
        patientResponse: 'Отлично, спасибо! Тогда до завтра!',
        explanation: 'Дали точную информацию.'
      }
    ]);

    return tree;
  }

  private buildAngryPatientTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    // Шаг 0: Первая реакция на крик
    tree.set(0, [
      {
        id: 1,
        text: 'Виктор Сергеевич, примите мои искренние извинения! Я прямо сейчас выясню, что произошло, и решу этот вопрос. Одну минуту!',
        type: 'good',
        impact: { empathy: +10, conflictResolution: +12, professionalism: +8 },
        patientResponse: 'Ну наконец-то хоть кто-то реагирует! Узнайте, что за безобразие там творится!',
        explanation: 'Отлично! Вы взяли ответственность и показали готовность действовать.'
      },
      {
        id: 2,
        text: 'Извините, врач с предыдущим пациентом задерживается. Такое бывает.',
        type: 'bad',
        impact: { empathy: -10, conflictResolution: -12 },
        patientResponse: 'ТАКОЕ БЫВАЕТ?! Вы серьёзно?! Моё время тоже чего-то стоит!',
        explanation: 'Это звучит как оправдание, а не решение проблемы.'
      },
      {
        id: 3,
        text: 'Не кричите, пожалуйста. Все пациенты ждут.',
        type: 'bad',
        impact: { empathy: -15, conflictResolution: -18, professionalism: -10 },
        patientResponse: 'Как вы со мной разговариваете?! Позовите руководителя, НЕМЕДЛЕННО!',
        patientResponse: 'Как вы со мной разговариваете?! Позовите руководителя, НЕМЕДЛЕННО!',
        explanation: 'Катастрофа! Вы обострили конфликт.'
      },
      {
        id: 700,
        text: 'Виктор Сергеевич, я полностью вас понимаю! 40 минут ожидания - это действительно много. Сейчас моментально узнаю точную ситуацию и предложу решение!',
        type: 'good',
        impact: { empathy: +11, conflictResolution: +11, professionalism: +8 },
        patientResponse: 'Вот так правильно! Давайте быстрее!',
        explanation: 'Отлично! Признали право на эмоцию и показали срочность.'
      },
      {
        id: 701,
        text: 'Сейчас уточню у врача, сколько еще осталось ждать.',
        type: 'neutral',
        impact: { efficiency: +4, professionalism: +3 },
        patientResponse: 'Уточните! А то я уже устал ждать!',
        explanation: 'Нормально, но слишком формально для разгневанного пациента.'
      }
    ]);

    // Шаг 1: После хорошего начала - выяснение причины
    tree.set(1, [
      {
        id: 4,
        text: '*через минуту* Виктор Сергеевич, я выяснила — у врача возникла сложная ситуация с предыдущим пациентом. Процедура затянулась на 25 минут. Он сможет принять вас через 15 минут.',
        type: 'good',
        impact: { professionalism: +8, empathy: +7 },
        patientResponse: 'Через 15 минут?! То есть я ещё почти час тут просижу?! Это просто неуважение!',
        explanation: 'Вы дали конкретную информацию, но пациент всё ещё зол.'
      },
      {
        id: 5,
        text: '*через минуту* Сейчас освободится, ещё чуть-чуть подождите',
        type: 'bad',
        impact: { efficiency: -8, conflictResolution: -10 },
        patientResponse: 'Вы мне уже 40 минут говорите "чуть-чуть"! Конкретное время дайте!',
        explanation: 'Размыто. Пациенту нужна определённость.'
      }
    ]);

    // Шаг 2: Плохой старт - оправдания
    tree.set(2, [
      {
        id: 100,
        text: 'Виктор Сергеевич, я вас понимаю! Давайте я сейчас узнаю точно, сколько ещё ждать.',
        type: 'good',
        impact: { empathy: +8, conflictResolution: +9 },
        patientResponse: 'Вот это правильно! Наконец-то!',
        explanation: 'Хорошая попытка исправить ситуацию.'
      },
      {
        id: 101,
        text: 'Но вы же понимаете, врач не может прервать лечение...',
        type: 'bad',
        impact: { conflictResolution: -10, empathy: -8 },
        patientResponse: 'Я ничего не понимаю! Вы должны были мне сказать заранее! Позовите администратора!',
        explanation: 'Ещё больше оправданий — хуже делаете.'
      }
    ]);

    // Шаг 3: Требование руководителя
    tree.set(3, [
      {
        id: 102,
        text: 'Простите, пожалуйста! Я и есть старший администратор. Давайте я прямо сейчас разберусь в ситуации и найду решение!',
        type: 'good',
        impact: { professionalism: +9, conflictResolution: +10, empathy: +8 },
        patientResponse: 'Ну смотрите! Быстро разбирайтесь, у меня времени нет!',
        explanation: 'Хорошо! Взяли ответственность на себя.'
      },
      {
        id: 103,
        text: 'Руководителя сейчас нет на месте',
        type: 'bad',
        impact: { conflictResolution: -12, professionalism: -10 },
        patientResponse: 'То есть мне даже не с кем поговорить?! Всё, я ухожу и напишу жалобу!',
        explanation: 'Ужасно. Вы теряете пациента.'
      }
    ]);

    // Шаг 4: После объяснения ситуации - предложение компенсации
    tree.set(4, [
      {
        id: 6,
        text: 'Виктор Сергеевич, я очень извиняюсь за ситуацию. Чтобы компенсировать ваше ожидание, мы сделаем бесплатную профессиональную гигиену полости рта на следующем визите — это 3500 рублей. Плюс я могу предложить пройти сейчас без очереди, если освободится другой врач. Согласны подождать 15 минут?',
        type: 'good',
        impact: { conflictResolution: +12, empathy: +10, professionalism: +9 },
        patientResponse: 'М-да... Ну ладно, если другой врач освободится — согласен. И про чистку бесплатную запишите.',
        explanation: 'Превосходно! Дали компенсацию и альтернативу.'
      },
      {
        id: 7,
        text: 'Понимаю ваше недовольство. Можем перенести запись на другой день?',
        type: 'neutral',
        impact: { efficiency: -5 },
        patientResponse: 'На другой день?! Я уже тут сижу час! Мне сегодня нужно!',
        explanation: 'Неудачное предложение для разгневанного пациента.'
      }
    ]);

    // Шаг 5: Плохой путь - требование конкретики
    tree.set(5, [
      {
        id: 104,
        text: 'Точно через 12 минут освободится. Обещаю, не больше!',
        type: 'good',
        impact: { professionalism: +7, conflictResolution: +8 },
        patientResponse: 'Ну смотрите! Если снова обманете — ухожу немедленно!',
        explanation: 'Дали конкретику, но рискованно обещать точное время.'
      }
    ]);

    tree.set(104, [
      {
        id: 105,
        text: 'А пока подождёте, могу предложить кофе, чай? Wi-Fi есть, если нужно поработать.',
        type: 'good',
        impact: { empathy: +7, professionalism: +6 },
        patientResponse: 'Кофе бы... Но чтобы через 12 минут, как обещали!',
        explanation: 'Создаёте комфорт, немного сглаживаете ситуацию.'
      }
    ]);

    tree.set(105, [
      {
        id: 6,
        text: 'Конечно! Принесу эспрессо. А за ожидание мы сделаем бонус — бесплатную чистку на следующий раз.',
        type: 'good',
        impact: { empathy: +8, conflictResolution: +7 },
        patientResponse: 'Ладно, приемлемо. Запишите про чистку, чтобы не забыли.',
        explanation: 'Хорошо! Предложили компенсацию.'
      }
    ]);

    // Шаг 6: Дальнейшее развитие после компенсации
    tree.set(6, [
      {
        id: 8,
        text: 'Уже записал в вашу карту — бесплатная гигиена. Сейчас принесу кофе и узнаю про других врачей. Буквально 2 минуты!',
        type: 'good',
        impact: { efficiency: +8, professionalism: +7 },
        patientResponse: 'Хорошо, жду.',
        explanation: 'Действуете быстро и конкретно.'
      },
      {
        id: 9,
        text: 'Хорошо, обязательно запишу. Подождите пока.',
        type: 'neutral',
        impact: { efficiency: -4 },
        patientResponse: 'А кофе когда?',
        explanation: 'Медленно действуете.'
      }
    ]);

    // Шаг 7: Предложение переноса отклонено
    tree.set(7, [
      {
        id: 106,
        text: 'Понял! Тогда давайте я узнаю, может кто из врачей освободится раньше. Минутку!',
        type: 'good',
        impact: { efficiency: +7, conflictResolution: +7 },
        patientResponse: 'Ну быстрее уже!',
        explanation: 'Правильная реакция — ищете альтернативу.'
      }
    ]);

    tree.set(106, [
      {
        id: 107,
        text: '*через минуту* Отличная новость! Доктор Смирнова освободилась, может принять вас прямо сейчас! Она тоже высшей категории, отличный специалист.',
        type: 'good',
        impact: { efficiency: +10, professionalism: +9 },
        patientResponse: 'Наконец-то! Веди те меня к ней!',
        explanation: 'Превосходно! Нашли решение быстро.'
      }
    ]);

    tree.set(107, [
      {
        id: 8,
        text: 'Отлично! Она в кабинете 12. А за ожидание — бонусом бесплатная чистка на следующий визит. Записал вам.',
        type: 'good',
        impact: { empathy: +8, professionalism: +7 },
        patientResponse: 'Хорошо, спасибо. В следующий раз чтобы такого не было!',
        explanation: 'Хорошо завершили — дали бонус и показали, что цените пациента.'
      }
    ]);

    // Шаг 8: Возвращение после действий
    tree.set(8, [
      {
        id: 10,
        text: '*возвращаетесь* Виктор Сергеевич, отличная новость! Доктор Смирнова освободилась и готова принять вас прямо сейчас! Она тоже опытный ортопед высшей категории. Можем пройти?',
        type: 'good',
        impact: { efficiency: +9, professionalism: +8 },
        patientResponse: 'Ну наконец-то что-то конкретное! Да, идёмте!',
        explanation: 'Отлично! Вы решили проблему быстро.'
      },
      {
        id: 11,
        text: '*возвращаетесь* Извините, другие врачи заняты. Ваш врач примет через 10 минут точно.',
        type: 'neutral',
        impact: { efficiency: -3 },
        patientResponse: 'Опять ждать?! Ладно уж, но это предел!',
        explanation: 'Не нашли альтернативу, но хоть дали точное время.'
      }
    ]);

    // Шаг 9: Медленная подача кофе
    tree.set(9, [
      {
        id: 108,
        text: 'Сейчас принесу! А пока узнаю про других врачей.',
        type: 'good',
        impact: { efficiency: +5 },
        patientResponse: 'Давайте быстрее.',
        explanation: 'Исправляете ситуацию.'
      }
    ]);

    tree.set(108, [
      {
        id: 10,
        text: '*принесли кофе* Вот ваш кофе. И хорошая новость — доктор Смирнова освободилась!',
        type: 'good',
        impact: { empathy: +6, efficiency: +7 },
        patientResponse: 'Наконец-то! Идёмте к ней.',
        explanation: 'Решили проблему.'
      }
    ]);

    // Шаг 10: Проводим к новому врачу
    tree.set(10, [
      {
        id: 12,
        text: 'Проводу вас к кабинету. И ещё раз извинитеза ожидание — это действительно редкая ситуация. За неудобства мы дарим вам бонусом профгигиену на следующий визит. Договорились?',
        type: 'good',
        impact: { empathy: +9, professionalism: +8, conflictResolution: +8 },
        patientResponse: 'Ладно, уговорили. Главное, чтобы больше таких задержек не было!',
        explanation: 'Идеально! Вы полностью разрешили конфликт.'
      },
      {
        id: 13,
        text: 'Кабинет 12, по коридору направо',
        type: 'neutral',
        impact: { professionalism: -3 },
        patientResponse: 'То есть мне самому идти? После того как я тут час просидел?',
        explanation: 'Неправильно. Нужно проводить лично.'
      }
    ]);

    // Шаг 11: Вариант без альтернативы
    tree.set(11, [
      {
        id: 109,
        text: 'Виктор Сергеевич, я очень извиняюсь. Давайте я пока принесу вам кофе, и мы дадим скидку 15% на сегодняшнее лечение за ожидание?',
        type: 'good',
        impact: { empathy: +7, conflictResolution: +8 },
        patientResponse: 'Хм, 15% — это хоть что-то... Ладно, приносите кофе.',
        explanation: 'Неплохо, предложили компенсацию.'
      }
    ]);

    tree.set(109, [
      {
        id: 110,
        text: '*приносите кофе* Вот ваш кофе. И скидку 15% я уже внесла в систему. Врач примет вас через 5-7 минут.',
        type: 'good',
        impact: { professionalism: +7, efficiency: +6 },
        patientResponse: 'Хорошо, спасибо за кофе. Жду.',
        explanation: 'Сгладили ситуацию.'
      }
    ]);

    tree.set(110, [
      {
        id: 12,
        text: '*через 7 минут* Виктор Сергеевич, врач готов вас принять! Проходите, кабинет 8.',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Ну наконец-то! В следующий раз планируйте время нормально!',
        explanation: 'Ситуация разрешена, хоть и не идеально.'
      }
    ]);

    // Шаг 12: Финал
    tree.set(12, [
      {
        id: 14,
        text: 'Обязательно учтём ваш комментарий! Спасибо за терпение. Хорошего приёма!',
        type: 'good',
        impact: { professionalism: +7, empathy: +6 },
        patientResponse: 'Спасибо. Надеюсь, больше таких ситуаций не будет.',
        explanation: 'Отлично завершили! Пациент успокоился и готов продолжить лечение.'
      },
      {
        id: 15,
        text: 'Хорошо, проходите',
        type: 'neutral',
        impact: {},
        patientResponse: '*уходит недовольный*',
        explanation: 'Слишком сухо. Нужно было завершить на позитивной ноте.'
      }
    ]);

    // Шаг 13: Плохая ситуация - пациент обиделся
    tree.set(13, [
      {
        id: 111,
        text: 'Простите, я провожу вас лично! Кабинет совсем рядом. Проходите, пожалуйста.',
        type: 'good',
        impact: { professionalism: +6, empathy: +5 },
        patientResponse: 'Ну вот так-то лучше.',
        explanation: 'Исправили ошибку.'
      }
    ]);

    tree.set(111, [
      {
        id: 12,
        text: 'Вот кабинет 12. За ожидание дарим бесплатную чистку на следующий раз. Хорошего лечения!',
        type: 'good',
        impact: { empathy: +6, professionalism: +5 },
        patientResponse: 'Хорошо, спасибо.',
        explanation: 'Неплохо завершили.'
      }
    ]);

    // Шаг 100: Попытка исправить плохой старт
    tree.set(100, [
      {
        id: 4,
        text: '*узнаёте информацию* Виктор Сергеевич, ещё 15 минут максимум. У врача сложная процедура.',
        type: 'good',
        impact: { professionalism: +6 },
        patientResponse: 'Так бы сразу и сказали! А не "такое бывает"! Ладно, жду.',
        explanation: 'Спасли ситуацию конкретикой.'
      }
    ]);

    // Шаг 101: Ещё больше оправданий
    tree.set(101, [
      {
        id: 112,
        text: 'Хорошо, я позову старшего администратора',
        type: 'neutral',
        impact: { conflictResolution: -5 },
        patientResponse: 'Быстрее зовите!',
        explanation: 'Переложили проблему на другого.'
      }
    ]);

    tree.set(112, [
      {
        id: 102,
        text: '*приходит администратор* Здравствуйте! Я старший администратор Марина. Что случилось?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Я тут уже час жду! Это вообще нормально?!',
        explanation: ''
      }
    ]);

    // Шаг 700: Отличная эмпатия
    tree.set(700, [
      {
        id: 4,
        text: '*узнаёте* Виктор Сергеевич, сложная ситуация: у врача осложнение с предыдущим пациентом. Ещё 15 минут. Но у меня есть предложение: могу записать вас к другому врачу прямо сейчас, либо провести в VIP-зону с кофе на время ожидания. Что выберете?',
        type: 'good',
        impact: { empathy: +8, conflictResolution: +9, efficiency: +7 },
        patientResponse: 'Вот это подход! VIP-зону покажите, подожду там.',
        explanation: 'Превосходно! Дали выбор и показали заботу.'
      },
      {
        id: 702,
        text: '*узнаёте* Ещё 15 минут ждать. Врач задерживается.',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: '15 минут?! А компенсацию какую-то дадите за ожидание?',
        explanation: 'Сухо. Не предложили альтернатив.'
      }
    ]);

    // Шаг 701: Нейтральный подход
    tree.set(701, [
      {
        id: 4,
        text: '*уточнили* Врач примет через 15 минут. Извините за ожидание.',
        type: 'neutral',
        impact: { professionalism: +4 },
        patientResponse: 'Ладно, жду. Но это в последний раз!',
        explanation: 'Дали информацию, но без компенсации за неудобство.'
      },
      {
        id: 703,
        text: '*уточнили* Врач освободится через 15 минут. Могу предложить кофе или чай на время ожидания?',
        type: 'good',
        impact: { empathy: +6, professionalism: +6, conflictResolution: +5 },
        patientResponse: 'Ну хоть что-то! Кофе, пожалуйста.',
        explanation: 'Хорошо! Добавили заботу и компенсацию.'
      }
    ]);

    // Шаг 702: Спрашивают про компенсацию
    tree.set(702, [
      {
        id: 704,
        text: 'Конечно! Давайте я проведу вас в VIP-зону, там комфортнее. И следующая профилактическая чистка у нас в подарок за ваше терпение.',
        type: 'good',
        impact: { empathy: +8, conflictResolution: +8, salesSkill: +6 },
        patientResponse: 'Вот это правильно! Ладно, принято. Проводите.',
        explanation: 'Отлично! Компенсировали неудобство конкретным бонусом.'
      },
      {
        id: 705,
        text: 'Ну... могу скидку 10% сделать на сегодняшнюю процедуру.',
        type: 'neutral',
        impact: { salesSkill: +4, conflictResolution: +4 },
        patientResponse: 'Ладно, хоть что-то. Жду.',
        explanation: 'Нормально, но можно было предложить что-то более значимое.'
      }
    ]);

    // Шаг 703: Предложили кофе
    tree.set(703, [
      {
        id: 8,
        text: 'Сейчас принесу! И ещё - за ожидание дарим скидку 15% на сегодняшнюю процедуру. Это наименьшее, что мы можем сделать.',
        type: 'good',
        impact: { empathy: +7, professionalism: +6, salesSkill: +5 },
        patientResponse: 'Спасибо, ценю. Буду ждать.',
        explanation: 'Отлично! Показали ценность клиента.'
      }
    ]);

    // Шаг 704: Предложили VIP и бонус
    tree.set(704, [
      {
        id: 8,
        text: 'Проходите! Вот VIP-зона. Устраивайтесь, врач придёт за вами лично через 15 минут. Ещё раз извините!',
        type: 'good',
        impact: { empathy: +7, professionalism: +7 },
        patientResponse: 'Хорошо. Спасибо за понимание.',
        explanation: 'Отлично! Превратили конфликт в лояльность.'
      }
    ]);

    // Шаг 705: Дали небольшую скидку
    tree.set(705, [
      {
        id: 8,
        text: 'Спасибо за понимание! Врач скоро будет. Приятного лечения!',
        type: 'good',
        impact: { professionalism: +5 },
        patientResponse: 'Ладно, до свидания.',
        explanation: 'Завершили, но без особого энтузиазма со стороны клиента.'
      }
    ]);

    // Шаг 102: Руководитель берёт ситуацию
    tree.set(102, [
      {
        id: 4,
        text: 'Виктор Сергеевич, примите извинения. Сейчас я всё выясню и найдём решение.',
        type: 'good',
        impact: { empathy: +7, conflictResolution: +8 },
        patientResponse: 'Вот и выясняйте быстрее!',
        explanation: 'Взяли ответственность.'
      }
    ]);

    return tree;
  }

  private buildUpsellTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    tree.set(0, [
      {
        id: 1,
        text: 'Рада, что вам понравилось! Знаете, я заметила, что у вас очень красивая улыбка. Вы когда-нибудь думали об отбеливании?',
        type: 'good',
        impact: { salesSkill: +8, empathy: +6 },
        patientResponse: 'Да вот думала... А у вас какие варианты есть?',
        explanation: 'Отлично! Вы подхватили сигнал интереса естественно.'
      },
      {
        id: 2,
        text: 'Да, цвет эмали с возрастом темнеет. Это нормально.',
        type: 'bad',
        impact: { salesSkill: -12, empathy: -8 },
        patientResponse: 'Ну да, понятно... Спасибо. До свидания.',
        explanation: 'Упустили возможность! Пациент подал сигнал интереса.'
      },
      {
        id: 800,
        text: 'Отличный результат, правда? А вы знаете, что профессиональное отбеливание может сделать улыбку ещё белее - на 7-10 тонов! Многие наши пациенты очень довольны. Интересно?',
        type: 'good',
        impact: { salesSkill: +9, empathy: +6, professionalism: +5 },
        patientResponse: 'Звучит интересно! А это безопасно?',
        explanation: 'Отлично! Зацепили через конкретику и результат.'
      },
      {
        id: 801,
        text: 'Спасибо за отзыв! У нас еще есть отбеливание, если интересно.',
        type: 'neutral',
        impact: { salesSkill: +4 },
        patientResponse: 'А, ну расскажите...',
        explanation: 'Слишком пассивно. Нужно больше энтузиазма.'
      },
      {
        id: 802,
        text: 'Рада, что понравилось! Кстати, вы говорили что зубки потемнели - хотите вернуть белизну? У нас сейчас акция на отбеливание!',
        type: 'good',
        impact: { salesSkill: +8, efficiency: +6, empathy: +5 },
        patientResponse: 'О, акция? Расскажите подробнее!',
        patientResponse: 'О, акция? Расскажите подробнее!',
        explanation: 'Отлично! Напомнили о проблеме и создали срочность через акцию.'
      }
    ]);

    tree.set(1, [
      {
        id: 3,
        text: 'У нас есть профессиональное отбеливание Amazing White — даёт эффект на 7-10 тонов за 1 час. И домашнее отбеливание каппами — более мягкий вариант. Посмотрите фото результатов!',
        type: 'good',
        impact: { salesSkill: +10, professionalism: +8 },
        patientResponse: 'Ого, реально белее! А какая разница между ними? И по цене?',
        explanation: 'Отлично! Даёте выбор и показываете результаты.'
      },
      {
        id: 4,
        text: 'Ну можем отбелить зубы. Тысяч 10 стоит.',
        type: 'neutral',
        impact: { salesSkill: +3 },
        patientResponse: 'Дороговато... Я подумаю',
        explanation: 'Слишком сухо. Не продали ценность.'
      }
    ]);

    tree.set(3, [
      {
        id: 5,
        text: 'Amazing White — это кабинетное, один визит, результат сразу, 7900р по акции до конца месяца. Домашнее — каппы носите 2 недели, эффект мягче, зато 4500р. Какой вариант интереснее?',
        type: 'good',
        impact: { salesSkill: +12, professionalism: +9 },
        patientResponse: 'А по акции только до конца месяца? Хм... А безопасно это?',
        explanation: 'Превосходно! Объяснили разницу, цены, создали срочность.'
      },
      {
        id: 6,
        text: 'Кабинетное дороже, домашнее дешевле',
        type: 'bad',
        impact: { salesSkill: -8 },
        patientResponse: 'Это я поняла. Сколько конкретно?',
        explanation: 'Неконкретно. Нужны цифры и объяснения.'
      }
    ]);

    tree.set(4, [
      {
        id: 100,
        text: 'Простите, покажу вам прайс с фотографиями. Вот смотрите...',
        type: 'good',
        impact: { salesSkill: +7 },
        patientResponse: 'О, красиво получается! Сколько это стоит?',
        explanation: 'Исправили ситуацию, показав результаты.'
      }
    ]);

    tree.set(100, [
      {
        id: 5,
        text: 'Профессиональное кабинетное сейчас по акции 7900 вместо 12000. Процедура час, эффект сразу.',
        type: 'good',
        impact: { salesSkill: +9 },
        patientResponse: 'А это безопасно для эмали?',
        explanation: 'Хорошо, дали конкретику.'
      }
    ]);

    tree.set(5, [
      {
        id: 7,
        text: 'Абсолютно! Используем гель последнего поколения без перекиси водорода. Он даже укрепляет эмаль. Перед процедурой врач обязательно проверит состояние зубов. Если есть чувствительность — подберём щадящий протокол.',
        type: 'good',
        impact: { empathy: +8, professionalism: +10, salesSkill: +9 },
        patientResponse: 'Звучит хорошо! А за час реально всё сделают?',
        explanation: 'Отлично! Закрыли возражение по безопасности.'
      },
      {
        id: 8,
        text: 'Да, безопасно. Врач посмотрит',
        type: 'neutral',
        impact: { professionalism: +4 },
        patientResponse: 'Ну хорошо... А сколько по времени?',
        explanation: 'Слишком кратко. Нужно больше убедить.'
      }
    ]);

    tree.set(6, [
      {
        id: 101,
        text: 'Профессиональное кабинетное — 7900р по акции. Домашнее — 4500р.',
        type: 'good',
        impact: { salesSkill: +6 },
        patientResponse: 'А разница какая между ними?',
        explanation: 'Дали цифры.'
      }
    ]);

    tree.set(101, [
      {
        id: 5,
        text: 'Кабинетное — быстрый результат за час, эффект ярче. Домашнее — постепенное, 2 недели, мягче. Какой вариант больше подходит?',
        type: 'good',
        impact: { salesSkill: +8 },
        patientResponse: 'Кабинетное интереснее. А это безопасно?',
        explanation: 'Объяснили разницу.'
      }
    ]);

    tree.set(7, [
      {
        id: 9,
        text: 'Да! Весь процесс занимает 45-60 минут. Наносим гель, активируем LED-лампой три цикла по 15 минут. Можно музыку слушать или видео смотреть. Результат видите сразу после процедуры!',
        type: 'good',
        impact: { salesSkill: +10, professionalism: +8 },
        patientResponse: 'Вау, быстро! А эффект надолго?',
        explanation: 'Отлично! Дали детали процесса.'
      },
      {
        id: 10,
        text: 'Да, за час всё делается',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'Хм... А на сколько хватает?',
        explanation: 'Минимум информации.'
      }
    ]);

    tree.set(8, [
      {
        id: 102,
        text: 'Процедура занимает около часа',
        type: 'neutral',
        impact: {},
        patientResponse: 'Понятно. А эффект долго держится?',
        explanation: ''
      }
    ]);

    tree.set(102, [
      {
        id: 9,
        text: 'Эффект держится от 1 до 2 лет при правильном уходе. Расскажу подробнее?',
        type: 'good',
        impact: { professionalism: +6 },
        patientResponse: 'Да, интересно!',
        explanation: 'Дали важную информацию.'
      }
    ]);

    tree.set(9, [
      {
        id: 11,
        text: 'Эффект держится 1-2 года! Зависит от ухода: если избегать красящих продуктов первую неделю и регулярно чистить зубы — результат максимальный. Можем добавить домашний набор для поддержания за 2000р. Записать вас на отбеливание?',
        type: 'good',
        impact: { salesSkill: +12, efficiency: +10 },
        patientResponse: 'Домашний набор это что?',
        explanation: 'Превосходно! Сделали апселл и ведёте к записи.'
      },
      {
        id: 12,
        text: 'Год-два держится. Хотите записаться?',
        type: 'neutral',
        impact: { salesSkill: +5 },
        patientResponse: 'А когда можно?',
        explanation: 'Быстро, но без деталей.'
      }
    ]);

    tree.set(10, [
      {
        id: 103,
        text: 'От 1 до 2 лет при правильном уходе',
        type: 'neutral',
        impact: {},
        patientResponse: 'Неплохо... А когда можно сделать?',
        explanation: ''
      }
    ]);

    tree.set(103, [
      {
        id: 13,
        text: 'У нас есть место в субботу в 11:00 или во вторник в 16:00. Что удобнее?',
        type: 'good',
        impact: { efficiency: +7 },
        patientResponse: 'Суббота подойдёт!',
        explanation: 'Хорошо, даёте варианты.'
      }
    ]);

    tree.set(11, [
      {
        id: 13,
        text: 'Это гель и каппы для домашнего применения — можно освежать белизну раз в 3-4 месяца. Но это опционально. Что скажете — записать на отбеливание? Есть места в субботу и во вторник.',
        type: 'good',
        impact: { salesSkill: +9, efficiency: +8 },
        patientResponse: 'Суббота подойдёт! Без набора пока, потом посмотрю.',
        explanation: 'Отлично! Объяснили, не давили, продвинули к записи.'
      },
      {
        id: 14,
        text: 'Домашнее поддерживающее. Нужен?',
        type: 'bad',
        impact: { salesSkill: -6 },
        patientResponse: 'Не понятно что это... Не знаю...',
        explanation: 'Слишком кратко, не объяснили ценность.'
      }
    ]);

    tree.set(12, [
      {
        id: 104,
        text: 'Есть окна в субботу утром или во вторник вечером',
        type: 'neutral',
        impact: {},
        patientResponse: 'Суббота лучше',
        explanation: ''
      }
    ]);

    tree.set(104, [
      {
        id: 13,
        text: 'Отлично! Записываю на субботу в 11:00. Это займёт час.',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Хорошо. Что с собой нужно?',
        explanation: 'Оформляете запись.'
      }
    ]);

    tree.set(13, [
      {
        id: 15,
        text: 'Замечательно! Записала вас на субботу в 11:00. Ничего с собой не нужно, только хорошее настроение! За 2 часа до процедуры не ешьте красящие продукты. После отбеливания покажем памятку по уходу. Всё ясно?',
        type: 'good',
        impact: { professionalism: +9, efficiency: +8 },
        patientResponse: 'Да, всё понятно! Спасибо большое!',
        explanation: 'Идеально! Дали все инструкции и завершили продажу.'
      },
      {
        id: 16,
        text: 'Записала. Приходите',
        type: 'bad',
        impact: { professionalism: -5 },
        patientResponse: 'А что с собой взять? Как готовиться?',
        explanation: 'Слишком сухо. Нужна инструкция.'
      }
    ]);

    tree.set(14, [
      {
        id: 105,
        text: 'Хорошо, без набора. Записываю на субботу?',
        type: 'neutral',
        impact: {},
        patientResponse: 'Да, давайте',
        explanation: ''
      }
    ]);

    tree.set(105, [
      {
        id: 15,
        text: 'Готово! Суббота 11:00. За 2 часа до процедуры не ешьте красящее. Всё остальное расскажут на месте!',
        type: 'good',
        impact: { professionalism: +6 },
        patientResponse: 'Отлично, спасибо!',
        explanation: 'Хорошо завершили.'
      }
    ]);

    // Шаг 800: Акцент на результат
    tree.set(800, [
      {
        id: 803,
        text: 'Абсолютно! Мы используем систему Amazing White - это одна из самых безопасных технологий. Гель на основе перекиси водорода низкой концентрации, не повреждает эмаль. У нас сотни довольных пациентов! Могу показать отзывы.',
        type: 'good',
        impact: { salesSkill: +8, professionalism: +7 },
        patientResponse: 'Хорошо, убедили! А сколько это стоит и как долго?',
        explanation: 'Отлично! Закрыли возражение конкретикой и доказательствами.'
      },
      {
        id: 804,
        text: 'Да, безопасно. Мы давно это делаем.',
        type: 'neutral',
        impact: { salesSkill: +3 },
        patientResponse: 'А поподробнее можно? Все-таки эмаль...',
        explanation: 'Слишком кратко. Не убедили полностью.'
      }
    ]);

    // Шаг 801: Пассивное предложение
    tree.set(801, [
      {
        id: 805,
        text: 'У нас профессиональное кабинетное отбеливание - результат за час, эффект на 7-10 тонов. Стоит 7900 по акции. Могу показать фото до и после?',
        type: 'good',
        impact: { salesSkill: +7, professionalism: +6 },
        patientResponse: 'Да, покажите! Интересно посмотреть.',
        explanation: 'Исправились! Добавили конкретики и наглядности.'
      },
      {
        id: 806,
        text: 'Ну это отбеливание зубов, делает их белее.',
        type: 'bad',
        impact: { salesSkill: -6, professionalism: -4 },
        patientResponse: 'Это я и сама знаю... Ладно, спасибо.',
        explanation: 'Слишком очевидное утверждение, не продали ценность.'
      }
    ]);

    // Шаг 802: Акция + проблема
    tree.set(802, [
      {
        id: 3,
        text: 'Да! Профессиональное отбеливание Amazing White - обычно 12000, сейчас 7900 до конца месяца! Это кабинетная процедура, час времени, результат сразу на 7-10 тонов белее.',
        type: 'good',
        impact: { salesSkill: +8, efficiency: +7 },
        patientResponse: 'Ого, реально хорошая скидка! А безопасно это?',
        explanation: 'Отлично! Создали ценность через акцию и конкретику.'
      },
      {
        id: 807,
        text: 'Акция на отбеливание, скидка 30%. Хотите?',
        type: 'neutral',
        impact: { salesSkill: +4 },
        patientResponse: 'А что конкретно входит? Сколько стоит?',
        explanation: 'Слишком кратко, нужны детали сразу.'
      }
    ]);

    // Шаг 803: Убедили в безопасности
    tree.set(803, [
      {
        id: 5,
        text: 'Процедура занимает 1 час, результат видно сразу. По акции 7900 вместо 12000, но только до конца месяца! Есть места в субботу и во вторник. Записать?',
        type: 'good',
        impact: { salesSkill: +8, efficiency: +7 },
        patientResponse: 'Суббота подойдет! Записывайте!',
        explanation: 'Превосходно! Дали всю информацию и создали срочность.'
      }
    ]);

    // Шаг 804: Не убедили полностью
    tree.set(804, [
      {
        id: 808,
        text: 'Конечно! Amazing White - это гель с низкой концентрацией перекиси, активируется LED-лампой. Безопасен для эмали, одобрен стоматологами. У нас делают даже с чувствительными зубами. Более 500 пациентов за год - все довольны!',
        type: 'good',
        impact: { salesSkill: +7, professionalism: +7, empathy: +5 },
        patientResponse: 'Вот это подробно! Убедили. Сколько стоит?',
        explanation: 'Отлично! Дали исчерпывающую информацию.'
      }
    ]);

    // Шаг 805: Показали фото
    tree.set(805, [
      {
        id: 5,
        text: 'Вот смотрите - это наши реальные пациенты. Видите разницу? По акции 7900р вместо 12000. Процедура час, делаем в субботу или вторник.',
        type: 'good',
        impact: { salesSkill: +8, professionalism: +6 },
        patientResponse: 'Да, впечатляет! А безопасно для эмали?',
        explanation: 'Хорошо! Визуал помог убедить.'
      }
    ]);

    // Шаг 806: Провалили продажу
    tree.set(806, [
      {
        id: 809,
        text: 'Подождите! Давайте я покажу результаты наших пациентов. Это действительно впечатляет!',
        type: 'good',
        impact: { salesSkill: +5, conflictResolution: +4 },
        patientResponse: 'Ну хорошо, покажите...',
        explanation: 'Пытаетесь вернуть интерес.'
      }
    ]);

    // Шаг 807: Слишком кратко про акцию
    tree.set(807, [
      {
        id: 810,
        text: 'Amazing White - профессиональное кабинетное отбеливание. Час процедура, эффект 7-10 тонов. Цена со скидкой 7900 вместо 12000. Только до конца месяца!',
        type: 'good',
        impact: { salesSkill: +7, professionalism: +6 },
        patientResponse: 'А это безопасно? И надолго ли эффект?',
        explanation: 'Хорошо! Дали детали.'
      }
    ]);

    // Шаг 808: Убедили подробно
    tree.set(808, [
      {
        id: 5,
        text: 'По акции 7900р, обычно 12000. Один час, результат сразу. Записать на субботу?',
        type: 'good',
        impact: { efficiency: +6, salesSkill: +6 },
        patientResponse: 'Да, давайте!',
        explanation: 'Переходите к записи.'
      }
    ]);

    // Шаг 809: Вернули через фото
    tree.set(809, [
      {
        id: 5,
        text: 'Смотрите - вот результаты. Разница очевидна! 7900р по акции, час времени. Интересно?',
        type: 'good',
        impact: { salesSkill: +6 },
        patientResponse: 'Да, неплохо выглядит. А как записаться?',
        explanation: 'Вернули интерес!'
      }
    ]);

    // Шаг 810: Объяснили детали акции
    tree.set(810, [
      {
        id: 811,
        text: 'Абсолютно безопасно - технология щадящая, одобрена стоматологами. Эффект держится 1-2 года при правильном уходе. Даем памятку после процедуры. Записать?',
        type: 'good',
        impact: { salesSkill: +7, professionalism: +6, empathy: +5 },
        patientResponse: 'Убедили! Когда можно прийти?',
        explanation: 'Отлично! Закрыли все возражения.'
      }
    ]);

    // Шаг 811: Закрыли возражения
    tree.set(811, [
      {
        id: 12,
        text: 'Есть суббота 11:00 или вторник 16:00. Что удобнее?',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Суббота подойдет!',
        explanation: 'Даете выбор.'
      }
    ]);

    tree.set(16, [
      {
        id: 106,
        text: 'Ничего особенного не нужно. За 2 часа до процедуры не ешьте ничего красящего — кофе, вино, свёклу. После дадим памятку.',
        type: 'good',
        impact: { professionalism: +5 },
        patientResponse: 'Понятно, спасибо!',
        explanation: 'Исправили, дали инструкцию.'
      }
    ]);

    return tree;
  }

  private buildScaredChildTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    // Шаг 0: Первый контакт с испуганным ребенком
    tree.set(0, [
      {
        id: 1,
        text: 'Ольга Андреевна, всё хорошо! Саша, привет! Я вижу, ты немного волнуешься. Знаешь, у нас тут совсем не страшно — даже мультики показываем! Хочешь сначала посмотреть, как тут красиво?',
        type: 'good',
        impact: { empathy: +8, professionalism: +6 },
        patientResponse: 'Саша перестал плакать и выглядывает из-за мамы. Мама: "О, спасибо! Саша, слышишь, мультики будут!"',
        explanation: 'Отлично! Вы переключили внимание ребёнка и сняли напряжение.'
      },
      {
        id: 2,
        text: 'Не переживайте, наш врач умеет работать с детьми. Сейчас вызову его.',
        type: 'neutral',
        impact: { professionalism: +2 },
        patientResponse: 'НЕЕЕЕТ! Я не хочу к врачу! Мама, пойдём домой!',
        explanation: 'Вы действуете правильно, но слишком быстро переходите к делу.'
      },
      {
        id: 3,
        text: 'Ну что такое, это же не больно! Все дети лечат зубы.',
        type: 'bad',
        impact: { empathy: -10, professionalism: -8 },
        patientResponse: 'Саша плачет ещё громче. Мама: "Вы только хуже делаете! Мы уходим!"',
        explanation: 'Так нельзя! Вы обесценили страх ребёнка и потеряли доверие.'
      },
      {
        id: 401,
        text: 'Здравствуйте! Саша, привет! Ого, какой ты большой уже! Как дела?',
        type: 'neutral',
        impact: { empathy: +3, professionalism: +3 },
        patientResponse: 'Саша плачет тише, но прячется за маму. Мама: "Извините, он боится...',
        explanation: 'Нормально, но нужно больше эмпатии к страху ребенка.'
      }
    ]);

    tree.set(1, [
      {
        id: 4,
        text: 'Саша, смотри, у нас есть волшебное кресло! Оно может подниматься и опускаться — как в ракете! Хочешь попробовать на нём покататься? А врач просто посмотрит зубки, как мама дома. Можно даже не лечить сегодня, просто познакомимся!',
        type: 'good',
        impact: { empathy: +8, professionalism: +7 },
        patientResponse: 'Саша заинтересованно смотрит. Мама: "Саша, правда, только посмотрит! Давай попробуем?"',
        explanation: 'Превосходно! Вы превратили страх в интерес и сняли давление.'
      },
      {
        id: 5,
        text: 'У врача есть специальные детские инструменты, совсем маленькие',
        type: 'bad',
        impact: { empathy: -5 },
        patientResponse: 'Инструменты?! НЕЕЕЕТ! (плачет)',
        explanation: 'Слово "инструменты" напугало ещё больше.'
      },
      {
        id: 402,
        text: 'А давай сначала в игровую зону зайдем? Там игрушки классные! Можно потрогать, поиграть. А потом уже к доктору, если захочешь.',
        type: 'good',
        impact: { empathy: +7, efficiency: +5 },
        patientResponse: 'Саша: "Игрушки?.." Мама: "Саша, давай посмотрим игрушки сначала?"',
        explanation: 'Отлично! Создаёте безопасное пространство.'
      }
    ]);

    tree.set(2, [
      {
        id: 403,
        text: 'Ой, простите! Саша, я понимаю, ты волнуешься. Давай так: сначала просто посидим, посмотрим мультики. Ничего делать не будем, честно!',
        type: 'good',
        impact: { empathy: +7, conflictResolution: +6 },
        patientResponse: 'Саша плачет тише. Мама: "Саша, давай попробуем? Просто посидим..."',
        explanation: 'Хорошо исправились! Признали ошибку и предложили мягкий вариант.'
      },
      {
        id: 404,
        text: 'Ну ладно, тогда приходите в другой раз, когда будет готов.',
        type: 'bad',
        impact: { empathy: -8, efficiency: -6 },
        patientResponse: 'Мама: "Спасибо..." (разочарованно уходят)',
        explanation: 'Вы сдались слишком быстро. Нужно было попытаться исправить ситуацию.'
      }
    ]);

    tree.set(3, [
      {
        id: 405,
        text: 'Ой, извините! Я не то хотела сказать! Саша, подожди! У нас тут есть подарки - машинки, раскраски! Хочешь посмотреть?',
        type: 'good',
        impact: { empathy: +6, conflictResolution: +7 },
        patientResponse: 'Саша останавливается, оглядывается. Мама: "Саша, давай посмотрим подарки?"',
        explanation: 'Успели спасти ситуацию! Быстро нашли что предложить.'
      }
    ]);

    tree.set(4, [
      {
        id: 6,
        text: 'А ещё у нас за смелость дарят подарки! Саша, ты любишь машинки или раскраски? Заходи, покажу!',
        type: 'good',
        impact: { empathy: +7, efficiency: +6 },
        patientResponse: 'Саша: "Машинки..." Мама: "Спасибо вам огромное! Саша, пойдём посмотрим!"',
        explanation: 'Блестяще! Вы создали позитивную мотивацию.'
      },
      {
        id: 406,
        text: 'Отлично! Пойдемте, я вас провожу. Саша, а ты динозавров любишь? У врача есть игрушки-динозавры!',
        type: 'good',
        impact: { empathy: +6, professionalism: +5 },
        patientResponse: 'Саша кивает. Мама: "О да, он динозавров обожает!"',
        explanation: 'Хорошо! Персонализировали подход.'
      },
      {
        id: 407,
        text: 'Хорошо, тогда пойдемте к врачу.',
        type: 'neutral',
        impact: { efficiency: +2 },
        patientResponse: 'Саша снова напрягается. Мама: "Саша, ну что же ты..."',
        explanation: 'Слишком быстро. Нужно было еще поработать с эмоциями.'
      }
    ]);

    tree.set(5, [
      {
        id: 408,
        text: 'Ой, извини! Я имела ввиду, что у доктора есть волшебная водичка и зеркальце. Им просто посмотрят зубки - совсем не страшно! Как мама дома смотрит.',
        type: 'good',
        impact: { empathy: +6, conflictResolution: +6 },
        patientResponse: 'Саша плачет тише. "А больно не будет?.."',
        explanation: 'Исправились! Перефразировали страшное на понятное.'
      }
    ]);

    tree.set(6, [
      {
        id: 7,
        text: 'Тогда пойдем! Саша, у меня есть коробка с машинками - можешь выбрать! А врач Сергей Петрович очень добрый, он сам папа, у него сын тоже Саша!',
        type: 'good',
        impact: { empathy: +7, professionalism: +6, efficiency: +5 },
        patientResponse: 'Саша берет маму за руку и идет с вами. Мама шепчет: "Спасибо вам большое!"',
        explanation: 'Идеально! Персонализировали врача и создали доверие.'
      },
      {
        id: 409,
        text: 'Отлично! Пойдемте в кабинет, там все покажу.',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'Саша медленно идет, держась за маму.',
        explanation: 'Нормально, но можно было добавить деталей о враче.'
      }
    ]);

    tree.set(401, [
      {
        id: 410,
        text: 'Я понимаю, Саша волнуется. Это нормально! Саша, знаешь, у нас тут волшебный кабинет - там мультики показывают! Хочешь сначала просто посмотреть?',
        type: 'good',
        impact: { empathy: +7, professionalism: +5 },
        patientResponse: 'Саша выглядывает из-за мамы. Мама: "Мультики? Саша, слышишь?"',
        explanation: 'Хорошо! Проявили эмпатию и предложили комфортный вариант.'
      },
      {
        id: 411,
        text: 'Не переживайте, врач быстро все сделает. Пойдемте.',
        type: 'bad',
        impact: { empathy: -6, professionalism: -4 },
        patientResponse: 'Саша: "НЕЕЕЕТ!" Мама: "Может не стоит сегодня..."',
        explanation: 'Вы не учли эмоции ребенка и матери.'
      }
    ]);

    tree.set(402, [
      {
        id: 412,
        text: 'У нас там машинки, конструктор, раскраски! Саша, ты что больше любишь? Можно поиграть сколько хочешь, а потом решим про зубки.',
        type: 'good',
        impact: { empathy: +7, efficiency: +5 },
        patientResponse: 'Саша: "Конструктор..." Мама: "Саша, пойдем посмотрим!"',
        explanation: 'Отлично! Даете выбор и снимаете давление.'
      }
    ]);

    tree.set(403, [
      {
        id: 413,
        text: 'Саша, смотри, какие мультики у нас есть: Маша и Медведь, Тачки, Щенячий патруль! Какой хочешь посмотреть?',
        type: 'good',
        impact: { empathy: +6, professionalism: +5 },
        patientResponse: 'Саша: "Тачки..." Мама улыбается.',
        explanation: 'Хорошо! Персонализировали выбор под ребенка.'
      }
    ]);

    tree.set(405, [
      {
        id: 414,
        text: 'Вот, смотри! Это пожарная машина, а это полицейская! Какая больше нравится? Можешь взять с собой в кабинет - поиграть пока врач смотрит.',
        type: 'good',
        impact: { empathy: +7, conflictResolution: +6 },
        patientResponse: 'Саша перестает плакать, тянется к машинке. Мама облегченно вздыхает.',
        explanation: 'Превосходно! Переключили внимание и создали комфорт.'
      }
    ]);

    tree.set(406, [
      {
        id: 7,
        text: 'Да! У доктора целая коллекция! Тираннозавр, трицератопс... Пойдем покажу? Мама может быть рядом все время.',
        type: 'good',
        impact: { empathy: +7, professionalism: +6 },
        patientResponse: 'Саша: "Тираннозавр!" Мама: "Ну что, Саша, пойдем посмотрим?"',
        explanation: 'Отлично! Используете интересы ребенка.'
      }
    ]);

    tree.set(407, [
      {
        id: 415,
        text: 'Саша, подожди! А давай сначала посмотрим, какие игрушки есть в кабинете? Там динозавры и машинки!',
        type: 'good',
        impact: { empathy: +6, conflictResolution: +5 },
        patientResponse: 'Саша останавливается. "Динозавры?.."',
        explanation: 'Исправились! Вернули внимание через игрушки.'
      }
    ]);

    tree.set(408, [
      {
        id: 416,
        text: 'Совсем не больно, правда! А знаешь что? Доктор даст тебе специальные очки - как у супергероя! Хочешь примерить?',
        type: 'good',
        impact: { empathy: +6, professionalism: +5 },
        patientResponse: 'Саша: "Очки как у супергероя?..." Мама кивает одобрительно.',
        explanation: 'Отлично! Превратили медицинское в игровое.'
      }
    ]);

    tree.set(409, [
      {
        id: 7,
        text: 'Саша, а ты знаешь, что наше кресло умеет подниматься и опускаться? Как американские горки! Хочешь попробовать?',
        type: 'good',
        impact: { empathy: +6, efficiency: +5 },
        patientResponse: 'Саша заинтересованно смотрит. "Правда?.."',
        explanation: 'Хорошо! Добавили игровой элемент.'
      }
    ]);

    tree.set(410, [
      {
        id: 4,
        text: 'Да! Прямо на потолке! Можно выбрать любой. А еще кресло волшебное - поднимается и опускается. Пойдем покажу?',
        type: 'good',
        impact: { empathy: +6, professionalism: +5 },
        patientResponse: 'Саша кивает. Мама: "Ну вот, видишь, Саша! Пойдем посмотрим!"',
        explanation: 'Отлично! Продолжаете создавать интерес.'
      }
    ]);

    tree.set(411, [
      {
        id: 405,
        text: 'Извините! Я не правильно сказала. Саша, правда, у нас тут не страшно! Хочешь посмотреть игрушки сначала?',
        type: 'good',
        impact: { empathy: +5, conflictResolution: +5 },
        patientResponse: 'Мама: "Саша, ну давай попробуем..." Саша плачет тише.',
        explanation: 'Пытаетесь исправить ошибку.'
      }
    ]);

    tree.set(412, [
      {
        id: 417,
        text: 'Пойдем! Там целая комната игрушек! А потом, если захочешь, зайдем к доктору - он тебе подарок даст за смелость!',
        type: 'good',
        impact: { empathy: +7, efficiency: +6 },
        patientResponse: 'Саша берет маму за руку. Мама: "Спасибо вам! Пойдем, Саша!"',
        explanation: 'Отлично! Создали мотивацию и комфортный переход.'
      }
    ]);

    tree.set(413, [
      {
        id: 418,
        text: 'Тачки - отличный выбор! Пойдем в кабинет, там включим на большом экране! И машинку можешь взять с собой.',
        type: 'good',
        impact: { empathy: +6, efficiency: +6 },
        patientResponse: 'Саша идет с вами. Мама: "Саша такой молодец!"',
        explanation: 'Отлично! Создали комфортный переход.'
      }
    ]);

    tree.set(414, [
      {
        id: 419,
        text: 'Выбирай любую! И знаешь что? Врач тоже любит машинки! Можешь показать ему свою.',
        type: 'good',
        impact: { empathy: +6, professionalism: +5 },
        patientResponse: 'Саша берет пожарную машину. Мама: "Спасибо! Пойдем, Саша!"',
        explanation: 'Хорошо! Создали связь с врачом через игрушку.'
      }
    ]);

    tree.set(415, [
      {
        id: 7,
        text: 'Пойдем! Там много всего интересного. Мама может зайти с тобой, конечно!',
        type: 'good',
        impact: { empathy: +6, efficiency: +5 },
        patientResponse: 'Саша держит маму за руку и идет с вами.',
        explanation: 'Хорошо! Подчеркнули что мама рядом.'
      }
    ]);

    tree.set(416, [
      {
        id: 7,
        text: 'Да! Желтые, как у Молнии Маквина! Пойдем, примеришь? Доктор даст.',
        type: 'good',
        impact: { empathy: +7, efficiency: +6 },
        patientResponse: 'Саша: "Хочу!" Мама улыбается.',
        explanation: 'Отлично! Связали с любимым персонажем.'
      }
    ]);

    tree.set(417, [
      {
        id: 7,
        text: 'Вот мы и пришли! Саша, выбирай любые игрушки! А вот и доктор Сергей Петрович идет - он тоже любит Тачки!',
        type: 'good',
        impact: { empathy: +7, professionalism: +7, efficiency: +6 },
        patientResponse: 'Саша играет с конструктором. Мама шепчет: "Спасибо огромное! Вы волшебница!"',
        explanation: 'Превосходно! Создали доверие и комфорт для всей семьи.'
      }
    ]);

    tree.set(418, [
      {
        id: 7,
        text: 'Вот, смотри! Включаю Тачки! А это доктор Сергей Петрович. Он поможет твоим зубкам быть крепкими, как у Молнии Маквина!',
        type: 'good',
        impact: { empathy: +7, professionalism: +6 },
        patientResponse: 'Саша смотрит мультик. Доктор: "Привет, Саша! Классные Тачки, да?" Саша кивает.',
        explanation: 'Блестяще! Плавно передали врачу, ребенок спокоен.'
      }
    ]);

    tree.set(419, [
      {
        id: 7,
        text: 'Пойдем! Доктор уже ждет - он очень хочет посмотреть твою машинку!',
        type: 'good',
        impact: { empathy: +6, efficiency: +6 },
        patientResponse: 'Саша держит машинку и идет в кабинет. Мама: "Саша, ты такой смелый!"',
        explanation: 'Отлично! Ребенок мотивирован показать игрушку.'
      }
    ]);

    tree.set(7, [
      {
        id: 8,
        text: 'Саша, ты молодец! Вот твоя машинка/подарок! Мама, всё прошло отлично! До встречи!',
        type: 'good',
        impact: { empathy: +8, professionalism: +7 },
        patientResponse: 'Саша улыбается с подарком. Мама: "Спасибо вам огромное! Саша, скажи спасибо!" Саша: "Спасибо!"',
        explanation: 'Идеально! Вы превратили страх в позитивный опыт!'
      }
    ]);

    return tree;
  }

  private buildVipPatientTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    // Шаг 0: VIP-клиент требует срочный прием
    tree.set(0, [
      {
        id: 1,
        text: 'Михаил Константинович, добрый день! Сейчас проверю возможность приёма на завтра. Один момент, буквально 30 секунд.',
        type: 'good',
        impact: { professionalism: +8, efficiency: +7 },
        patientResponse: 'Хорошо, жду.',
        explanation: 'Отлично! Вы проявили уважение и сразу начали действовать.'
      },
      {
        id: 2,
        text: 'У нас очередь на две недели вперёд, но могу попробовать найти окно...',
        type: 'bad',
        impact: { efficiency: -6, professionalism: -5 },
        patientResponse: 'То есть, даже за доплату нельзя? Странно. Я думал, у вас сервис на уровне.',
        explanation: 'Вы сразу начали с негатива. Сначала проверьте возможности!'
      },
      {
        id: 501,
        text: 'Михаил Константинович! Понял, срочно. Сейчас посмотрю все варианты - и у главного врача, и в VIP-блоке. Минутку!',
        type: 'good',
        impact: { professionalism: +7, efficiency: +8, empathy: +6 },
        patientResponse: 'Отлично, спасибо. Желательно к лучшему специалисту.',
        explanation: 'Отлично! Показали готовность помочь и понимание важности.'
      },
      {
        id: 502,
        text: 'Сейчас проверю расписание...',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'Долго проверять будете? У меня мало времени.',
        explanation: 'Слишком формально для VIP-клиента. Нужно больше внимания.'
      }
    ]);

    // Шаг 1: Проверили, готовы сообщить
    tree.set(1, [
      {
        id: 3,
        text: 'Михаил Константинович, отличные новости! Наш главный ортопед, Смирнов Игорь Петрович, кандидат медицинских наук, сможет принять вас завтра в 10:30. Это будет расширенная консультация с 3D-диагностикой. Вас устроит?',
        type: 'good',
        impact: { professionalism: +8, efficiency: +7, salesSkill: +6 },
        patientResponse: 'Прекрасно! Именно то, что нужно. Записывайте.',
        explanation: 'Превосходно! Вы подчеркнули статус врача и показали ценность.'
      },
      {
        id: 4,
        text: 'Да, могу записать на завтра. У нас свободно в 10:00.',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'А к кому конкретно? Кто лучший специалист?',
        explanation: 'Сухо. Для VIP-клиента нужно больше внимания и деталей.'
      },
      {
        id: 503,
        text: 'Освободилось место у Смирнова И.П. завтра в 10:30 или у Петровой Е.А. в 14:00. Оба топовые специалисты, более 15 лет опыта. Какое время удобнее?',
        type: 'good',
        impact: { professionalism: +7, efficiency: +7, salesSkill: +5 },
        patientResponse: 'Расскажите подробнее про Смирнова. Что за врач?',
        explanation: 'Хорошо! Даете выбор и подчеркиваете квалификацию.'
      }
    ]);

    // Шаг 2: Плохой путь - надо исправиться
    tree.set(2, [
      {
        id: 504,
        text: 'Михаил Константинович, простите! Я проверю прямо сейчас все возможности. Сейчас свяжусь с главным врачом - для вас обязательно найдем время!',
        type: 'good',
        impact: { professionalism: +7, efficiency: +6, conflictResolution: +6 },
        patientResponse: 'Ну хорошо, жду. Но быстрее, пожалуйста.',
        explanation: 'Хорошо исправились! Показали готовность решить вопрос.'
      },
      {
        id: 505,
        text: 'Ну вот так получается... Может через неделю?',
        type: 'bad',
        impact: { professionalism: -7, efficiency: -6, empathy: -5 },
        patientResponse: 'Через неделю?! Нет, спасибо. Обращусь в другую клинику.',
        explanation: 'Катастрофа! Потеряли VIP-клиента из-за безразличия.'
      }
    ]);

    // Шаг 3: Успешно нашли врача
    tree.set(3, [
      {
        id: 5,
        text: 'Отлично! Запишите, пожалуйста: клиника на Тверской, 15, 3 этаж. Ваш личный менеджер Анна встретит вас в холле. Пришлю все детали на WhatsApp. Что-то ещё подготовить к визиту?',
        type: 'good',
        impact: { professionalism: +7, efficiency: +6, empathy: +5 },
        patientResponse: 'Великолепно! Очень профессионально. Жду сообщение.',
        explanation: 'Блестяще! Вы обеспечили VIP-сервис и внимание к деталям.'
      },
      {
        id: 506,
        text: 'Записала. Завтра в 10:30. Адрес пришлю в SMS.',
        type: 'neutral',
        impact: { efficiency: +4 },
        patientResponse: 'А где находится клиника? И парковка есть?',
        explanation: 'Слишком кратко для VIP. Надо было сразу дать всю информацию.'
      },
      {
        id: 507,
        text: 'Замечательно! Михаил Константинович, оформляю запись. Вам пришлю на WhatsApp полную информацию: адрес с картой, номер парковочного места, контакт личного менеджера. За час до приема он позвонит и уточнит, все ли в порядке. Может, кофе или чай приготовить?',
        type: 'good',
        impact: { professionalism: +8, empathy: +7, salesSkill: +6 },
        patientResponse: 'Вот это сервис! Эспрессо, пожалуйста. Спасибо!',
        explanation: 'Превосходно! Максимальный уровень заботы о клиенте.'
      }
    ]);

    // Шаг 4: Нейтральный путь - просят подробности
    tree.set(4, [
      {
        id: 508,
        text: 'Смирнов Игорь Петрович - наш главный ортопед, кандидат медицинских наук, 18 лет опыта. Специализируется на сложных случаях и эстетической стоматологии. Более 2000 успешных имплантаций. Именно его я бы рекомендовала для вашего случая.',
        type: 'good',
        impact: { professionalism: +7, salesSkill: +7 },
        patientResponse: 'Звучит убедительно. Записывайте к нему.',
        explanation: 'Отлично! Подробно рассказали о квалификации.'
      },
      {
        id: 509,
        text: 'Это наш ведущий специалист. Очень опытный.',
        type: 'neutral',
        impact: { professionalism: +2 },
        patientResponse: 'А поконкретнее? Какой стаж, образование?',
        explanation: 'Слишком общо. VIP-клиент хочет детали.'
      }
    ]);

    // Шаг 5: Идеальный финал
    tree.set(5, [
      {
        id: 6,
        text: 'Прекрасно! Михаил Константинович, еще раз подтверждаю: завтра 10:30, главный ортопед Смирнов И.П., расширенная консультация с 3D-диагностикой. Вам на WhatsApp в течение 5 минут придет вся информация. Увидимся завтра!',
        type: 'good',
        impact: { professionalism: +7, efficiency: +6 },
        patientResponse: 'Отлично, все понятно. Спасибо за оперативность!',
        explanation: 'Идеально! Подтвердили все детали и создали уверенность.'
      },
      {
        id: 510,
        text: 'Хорошо, тогда до завтра!',
        type: 'neutral',
        impact: { efficiency: +2 },
        patientResponse: 'Подождите, а точный адрес? И во сколько подъехать?',
        explanation: 'Забыли дать полную информацию.'
      }
    ]);

    // Шаг 501: Показали понимание срочности
    tree.set(501, [
      {
        id: 3,
        text: 'Отлично! Есть время у главного ортопеда Смирнова И.П. завтра в 10:30. Кандидат наук, 18 лет опыта, более 2000 имплантаций. Это будет VIP-консультация с 3D-диагностикой. Подходит?',
        type: 'good',
        impact: { professionalism: +8, salesSkill: +7, efficiency: +7 },
        patientResponse: 'Да, идеально! Записывайте.',
        explanation: 'Превосходно! Быстро нашли и подчеркнули статус.'
      },
      {
        id: 511,
        text: 'Нашел! Завтра в 10:30 можем принять. К ортопеду.',
        type: 'neutral',
        impact: { efficiency: +4 },
        patientResponse: 'К какому именно ортопеду? Расскажите о нем.',
        explanation: 'Надо было сразу дать полную информацию о враче.'
      }
    ]);

    // Шаг 502: Формальный ответ
    tree.set(502, [
      {
        id: 512,
        text: 'Извините за задержку! Михаил Константинович, нашел отличный вариант: главный ортопед Смирнов И.П., завтра 10:30, VIP-кабинет. Подходит?',
        type: 'good',
        impact: { professionalism: +6, efficiency: +6, conflictResolution: +5 },
        patientResponse: 'Да, хорошо. Оформляйте.',
        explanation: 'Исправились, быстро предоставили информацию.'
      }
    ]);

    // Шаг 503: Дали выбор врачей
    tree.set(503, [
      {
        id: 513,
        text: 'Смирнов И.П. - наш главный ортопед, кандидат наук, специализируется на имплантации и протезировании. 18 лет опыта, более 2000 операций. Его консультация будет максимально подробной с 3D-планированием. Это лучший выбор для сложных случаев.',
        type: 'good',
        impact: { professionalism: +7, salesSkill: +7 },
        patientResponse: 'Убедительно. К нему и запишите.',
        explanation: 'Отлично! Дали исчерпывающую информацию о враче.'
      },
      {
        id: 514,
        text: 'Смирнов - главный врач, очень квалифицированный.',
        type: 'neutral',
        impact: { professionalism: +3 },
        patientResponse: 'Это я понял. А конкретнее - стаж, специализация?',
        explanation: 'Слишком поверхностно для VIP-клиента.'
      }
    ]);

    // Шаг 504: Спасли плохую ситуацию
    tree.set(504, [
      {
        id: 3,
        text: 'Отлично! Договорился с главным ортопедом - Смирнов И.П. примет вас завтра в 10:30. Это будет персональная консультация в VIP-кабинете с полной диагностикой. Именно тот уровень сервиса, который вы ожидаете!',
        type: 'good',
        impact: { professionalism: +7, efficiency: +7, conflictResolution: +6 },
        patientResponse: 'Вот так лучше! Записывайте.',
        explanation: 'Молодец! Спасли ситуацию и подняли уровень сервиса.'
      }
    ]);

    // Шаг 506: Краткий ответ - клиент хочет подробностей
    tree.set(506, [
      {
        id: 515,
        text: 'Конечно! Клиника находится на Тверской, 15, третий этаж. У нас есть подземная парковка со своим въездом - вам выделено место №15. Ваш личный менеджер Анна встретит вас у лифта. Пришлю все это в WhatsApp с картой проезда.',
        type: 'good',
        impact: { professionalism: +7, efficiency: +6 },
        patientResponse: 'Отлично, так намного лучше! Спасибо.',
        explanation: 'Хорошо! Дали всю нужную информацию с деталями.'
      },
      {
        id: 516,
        text: 'На Тверской. Парковка во дворе.',
        type: 'bad',
        impact: { professionalism: -5, efficiency: -4 },
        patientResponse: 'Это все? А точный адрес, номер дома?',
        explanation: 'Слишком кратко и непрофессионально для VIP.'
      }
    ]);

    // Шаг 507: Максимальный сервис
    tree.set(507, [
      {
        id: 6,
        text: 'Превосходно! Все готово. Напоминаю: завтра 10:30, Смирнов И.П., VIP-консультация. В WhatsApp получите всю информацию + прямой номер менеджера на случай любых вопросов. До встречи, Михаил Константинович!',
        type: 'good',
        impact: { professionalism: +8, empathy: +7 },
        patientResponse: 'Идеально! Вот это я понимаю - настоящий сервис! Спасибо!',
        explanation: 'Превосходно! Показали высший уровень клиентского сервиса.'
      }
    ]);

    // Шаг 508: Подробности о враче
    tree.set(508, [
      {
        id: 3,
        text: 'Отлично! Тогда завтра в 10:30 к Смирнову И.П. Оформляю запись.',
        type: 'good',
        impact: { efficiency: +6, professionalism: +6 },
        patientResponse: 'Хорошо. Адрес и детали пришлите.',
        explanation: 'Хорошо, переходите к оформлению.'
      }
    ]);

    // Шаг 509: Слишком общая информация
    tree.set(509, [
      {
        id: 517,
        text: 'Конечно! Смирнов И.П. - кандидат медицинских наук, главный ортопед клиники. Стаж 18 лет, специализация - имплантология и ортопедическая стоматология. Более 2000 успешных имплантаций, регулярно выступает на международных конференциях.',
        type: 'good',
        impact: { professionalism: +7, salesSkill: +6 },
        patientResponse: 'Впечатляет! Записывайте к нему.',
        explanation: 'Отлично! Предоставили исчерпывающую информацию.'
      }
    ]);

    // Шаг 510: Забыли детали
    tree.set(510, [
      {
        id: 518,
        text: 'Простите! Клиника на Тверской, 15, этаж 3. Приезжайте к 10:25, менеджер Анна встретит в холле. Парковка подземная, место №15 зарезервировано за вами. Все детали уже отправил в WhatsApp.',
        type: 'good',
        impact: { professionalism: +6, efficiency: +5 },
        patientResponse: 'Хорошо, получил сообщение. До завтра!',
        explanation: 'Исправились, дали полную информацию.'
      }
    ]);

    // Шаг 511: Нет подробностей о враче
    tree.set(511, [
      {
        id: 508,
        text: 'Смирнов Игорь Петрович - главный ортопед нашей клиники. Кандидат медицинских наук, 18 лет опыта, специализация - имплантология. Более 2000 успешных операций. Рекомендую именно его - лучший специалист в этой области.',
        type: 'good',
        impact: { professionalism: +7, salesSkill: +6 },
        patientResponse: 'Звучит солидно. Записывайте.',
        explanation: 'Хорошо! Дали подробную информацию.'
      }
    ]);

    // Шаг 512: Быстро исправились
    tree.set(512, [
      {
        id: 5,
        text: 'Отлично! Оформляю запись. Сейчас отправлю вам всю информацию: адрес, схему проезда, парковку, контакт менеджера.',
        type: 'good',
        impact: { professionalism: +6, efficiency: +6 },
        patientResponse: 'Хорошо. Жду сообщение.',
        explanation: 'Хорошо, переходите к финализации.'
      }
    ]);

    // Шаг 513: Отличная презентация врача
    tree.set(513, [
      {
        id: 5,
        text: 'Превосходно! Записываю вас к Смирнову И.П. на завтра, 10:30. Сейчас отправлю полную информацию в WhatsApp.',
        type: 'good',
        impact: { efficiency: +6, professionalism: +6 },
        patientResponse: 'Отлично, жду.',
        explanation: 'Хорошо, оформляете запись.'
      }
    ]);

    // Шаг 514: Слишком поверхностно
    tree.set(514, [
      {
        id: 517,
        text: 'Детально: стаж 18 лет, кандидат наук, специализация - имплантология и сложное протезирование, более 2000 операций, постоянный участник международных конференций. Один из лучших специалистов города.',
        type: 'good',
        impact: { professionalism: +6, salesSkill: +6 },
        patientResponse: 'Теперь понятно. Хорошо, к нему.',
        explanation: 'Исправились, дали нужную информацию.'
      }
    ]);

    // Шаг 515: Полная информация о локации
    tree.set(515, [
      {
        id: 6,
        text: 'Отлично! Еще раз: завтра 10:30, Смирнов И.П., Тверская 15, этаж 3, парковка место №15. В WhatsApp все уже отправлено. До встречи!',
        type: 'good',
        impact: { professionalism: +7, efficiency: +6 },
        patientResponse: 'Все получил! Спасибо за сервис, до завтра!',
        explanation: 'Идеально! Подтвердили все и завершили на высокой ноте.'
      }
    ]);

    // Шаг 516: Плохой ответ про локацию
    tree.set(516, [
      {
        id: 519,
        text: 'Простите! Полный адрес: улица Тверская, дом 15, третий этаж. Подземная парковка, въезд со двора, место №15 забронировано. Ваш менеджер Анна встретит у лифта. Отправляю карту в WhatsApp.',
        type: 'good',
        impact: { professionalism: +6, conflictResolution: +5 },
        patientResponse: 'Хорошо, теперь все понятно. Спасибо.',
        explanation: 'Исправились и дали полную информацию.'
      }
    ]);

    // Шаг 517: Полная презентация
    tree.set(517, [
      {
        id: 3,
        text: 'Отлично! Записываю на завтра 10:30 к Смирнову И.П.',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Хорошо. Адрес пришлите.',
        explanation: 'Переходите к оформлению.'
      }
    ]);

    // Шаг 518: Исправили забытые детали
    tree.set(518, [
      {
        id: 6,
        text: 'Еще раз все детали: завтра 10:30, Смирнов И.П., VIP-консультация. Все в WhatsApp. Если вопросы - звоните, всегда на связи!',
        type: 'good',
        impact: { professionalism: +6 },
        patientResponse: 'Отлично, все ясно. До встречи!',
        explanation: 'Хорошо завершили.'
      }
    ]);

    // Шаг 519: Спасли плохую ситуацию с адресом
    tree.set(519, [
      {
        id: 6,
        text: 'Все готово! Жду вас завтра. Если будут любые вопросы - сразу звоните!',
        type: 'good',
        impact: { professionalism: +5 },
        patientResponse: 'Хорошо, спасибо.',
        explanation: 'Завершили, но можно было теплее.'
      }
    ]);

    // Шаг 6: Идеальный финал
    tree.set(6, [
      {
        id: 7,
        text: 'Михаил Константинович, было приятно помочь! Увидимся завтра. Хорошего дня!',
        type: 'good',
        impact: { empathy: +7, professionalism: +7 },
        patientResponse: 'Спасибо, отличный сервис! До встречи!',
        explanation: 'Превосходно! Создали отличное впечатление о клинике.'
      }
    ]);

    return tree;
  }

  private buildPaymentIssueTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    // Шаг 0: Пациент не может оплатить терминалом
    tree.set(0, [
      {
        id: 1,
        text: 'Наталья Владимировна, не переживайте! У нас есть СБП, можно по номеру телефона перевести. Или на карту клиники. Какой способ удобнее?',
        type: 'good',
        impact: { empathy: +7, efficiency: +7, professionalism: +6 },
        patientResponse: 'О, спасибо! СБП отлично подойдёт, у меня на телефоне всё есть!',
        explanation: 'Отлично! Вы сразу предложили решение и сняли стресс.'
      },
      {
        id: 2,
        text: 'Можете завтра привезти, мы вас знаем.',
        type: 'neutral',
        impact: { empathy: +2 },
        patientResponse: 'А документ какой-то нужен, что я должна?',
        explanation: 'Это рискованно и непрофессионально. Нужно оформить официально.'
      },
      {
        id: 3,
        text: 'Как же так? Надо было заранее проверить! Без оплаты не можем отпустить.',
        type: 'bad',
        impact: { empathy: -10, professionalism: -8, conflictResolution: -8 },
        patientResponse: 'Что?! Я что, должник какой-то?! Я постоянный клиент! Хамство!',
        explanation: 'Катастрофа! Вы обвинили пациента и создали конфликт.'
      },
      {
        id: 601,
        text: 'Ничего страшного! Сейчас решим. У вас есть карта с собой? Могу продиктовать реквизиты для перевода.',
        type: 'good',
        impact: { empathy: +6, efficiency: +6, professionalism: +5 },
        patientResponse: 'Да, карта есть! Только как переводить?',
        explanation: 'Хорошо! Успокоили и начали решать проблему.'
      },
      {
        id: 602,
        text: 'Хм, терминал не работает... Сейчас посмотрю что можно сделать.',
        type: 'neutral',
        impact: { efficiency: +2 },
        patientResponse: 'Ну и как мне тогда платить? У меня времени нет ждать!',
        explanation: 'Слишком неуверенно. Нужно сразу предлагать решения.'
      }
    ]);

    // Шаг 1: СБП выбран
    tree.set(1, [
      {
        id: 4,
        text: 'Сейчас скажу реквизиты. Переведёте, и я сразу выбью чек. Буквально минута! *диктует номер телефона для СБП*',
        type: 'good',
        impact: { efficiency: +7, professionalism: +6 },
        patientResponse: 'Перевела! Вот, смотрите, операция прошла.',
        explanation: 'Отлично! Быстро и профессионально решили вопрос.'
      },
      {
        id: 603,
        text: 'Отлично! Номер для СБП: +7-999-123-45-67. Получатель - Клиника Жемчужина. Сумма 3500 рублей.',
        type: 'good',
        impact: { efficiency: +6, professionalism: +6 },
        patientResponse: 'Сейчас переведу... Отправила! Вот скриншот.',
        explanation: 'Хорошо! Четко дали все данные.'
      },
      {
        id: 604,
        text: 'СБП - это через телефон. Сейчас скажу номер...',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'Подождите, а как это работает? Я первый раз...',
        explanation: 'Надо было объяснить процесс перед тем как давать номер.'
      }
    ]);

    // Шаг 2: Предложили завтра
    tree.set(2, [
      {
        id: 605,
        text: 'Нет, никакого документа! Просто привезете деньги. Но если хотите прямо сейчас - могу продиктовать реквизиты для перевода, это удобнее будет.',
        type: 'good',
        impact: { empathy: +6, efficiency: +6, professionalism: +5 },
        patientResponse: 'Да, давайте прямо сейчас! Через СБП могу?',
        explanation: 'Хорошо! Убрали беспокойство и предложили лучший вариант.'
      },
      {
        id: 606,
        text: 'Да, расписку сделаем что вы должны 3500 рублей.',
        type: 'bad',
        impact: { empathy: -6, professionalism: -5 },
        patientResponse: 'Расписку?! Как будто я не собираюсь платить! Неприятно как-то...',
        explanation: 'Слово "должны" и "расписка" звучат негативно для клиента.'
      }
    ]);

    // Шаг 3: Конфликт - надо спасать
    tree.set(3, [
      {
        id: 607,
        text: 'Наталья Владимировна, простите пожалуйста! Я не то имела в виду! Конечно, мы вам доверяем. Давайте просто решим вопрос с оплатой прямо сейчас - есть СБП, перевод на карту. Какой способ удобен?',
        type: 'good',
        impact: { empathy: +7, conflictResolution: +7, professionalism: +6 },
        patientResponse: 'Ладно... СБП давайте. Но вы меня очень расстроили!',
        explanation: 'Хорошо! Быстро извинились и вернули к решению проблемы.'
      },
      {
        id: 608,
        text: 'Ну извините, но правила есть правила...',
        type: 'bad',
        impact: { empathy: -8, conflictResolution: -7, professionalism: -6 },
        patientResponse: 'Знаете что? Я больше к вам не приду! Безобразие!',
        explanation: 'Катастрофа! Потеряли клиента окончательно.'
      }
    ]);

    // Шаг 4: Перевод прошел
    tree.set(4, [
      {
        id: 5,
        text: 'Получили, спасибо! Вот ваш чек. Наталья Владимировна, с кем не бывает! Главное, что всё решилось. Выздоравливайте!',
        type: 'good',
        impact: { empathy: +7, professionalism: +6 },
        patientResponse: 'Спасибо вам большое! Как хорошо, что всё так быстро! Вы молодец!',
        explanation: 'Превосходно! Вы превратили неловкую ситуацию в позитивный опыт.'
      },
      {
        id: 609,
        text: 'Получено. Вот чек. До свидания.',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'Спасибо... (уходит немного смущенная)',
        explanation: 'Слишком сухо. Надо было поддержать клиента.'
      },
      {
        id: 610,
        text: 'Отлично! Получили 3500р. Вот электронный чек. Наталья Владимировна, спасибо за понимание! Такое иногда бывает, главное что решили быстро. Хорошего дня!',
        type: 'good',
        impact: { empathy: +7, professionalism: +7 },
        patientResponse: 'Спасибо вам! Вы очень помогли, молодцы!',
        explanation: 'Отлично! Превратили проблему в позитив.'
      }
    ]);

    // Шаг 601: Есть карта, спрашиваем как переводить
    tree.set(601, [
      {
        id: 611,
        text: 'Есть три варианта: СБП по номеру телефона - самый быстрый, перевод по номеру карты, или я могу выслать QR-код для оплаты. Что удобнее?',
        type: 'good',
        impact: { empathy: +6, efficiency: +7, professionalism: +6 },
        patientResponse: 'СБП знаю как! Давайте номер телефона.',
        explanation: 'Отлично! Дали выбор и объяснили варианты.'
      },
      {
        id: 612,
        text: 'Ну через телефон можно, или на карту...',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'А что лучше? Я в этом не разбираюсь особо...',
        explanation: 'Слишком неуверенно. Надо четко рекомендовать.'
      }
    ]);

    // Шаг 602: Неуверенный ответ
    tree.set(602, [
      {
        id: 613,
        text: 'Наталья Владимировна, сейчас быстро решим! У нас есть СБП - переводите по номеру телефона за минуту. Или на карту можем. Какой вариант удобнее?',
        type: 'good',
        impact: { empathy: +6, efficiency: +6, conflictResolution: +5 },
        patientResponse: 'Ой, хорошо! СБП могу, это быстро.',
        explanation: 'Исправились! Стали уверенными и предложили решения.'
      },
      {
        id: 614,
        text: 'Попробую починить терминал...',
        type: 'bad',
        impact: { efficiency: -5, professionalism: -4 },
        patientResponse: 'Сколько это займет?! У меня дела!',
        explanation: 'Плохое решение. Надо сразу искать альтернативу.'
      }
    ]);

    // Шаг 603: Дали реквизиты СБП
    tree.set(603, [
      {
        id: 4,
        text: 'Отлично! Проверяю... Да, перевод пришел! Вот ваш чек.',
        type: 'good',
        impact: { efficiency: +6, professionalism: +6 },
        patientResponse: 'Спасибо! Быстро получилось!',
        explanation: 'Хорошо! Быстро подтвердили и выдали чек.'
      }
    ]);

    // Шаг 604: Не объяснили как работает СБП
    tree.set(604, [
      {
        id: 615,
        text: 'Сейчас объясню! Откройте приложение вашего банка, найдите там раздел "Переводы" или "СБП". Выберите "Перевод по номеру телефона". Я продиктую номер: +7-999-123-45-67, сумма 3500. Все просто!',
        type: 'good',
        impact: { empathy: +6, professionalism: +6, efficiency: +5 },
        patientResponse: 'А, понятно! Сейчас попробую... Получилось, отправила!',
        explanation: 'Отлично! Терпеливо объяснили пошагово.'
      },
      {
        id: 616,
        text: 'Это просто. В банке найдите СБП и введите номер.',
        type: 'neutral',
        impact: { efficiency: +3 },
        patientResponse: 'Где найти? Покажите пожалуйста, а то я не понимаю...',
        explanation: 'Слишком кратко. Клиент не технически подкован.'
      }
    ]);

    // Шаг 605: Предложили перевод вместо завтра
    tree.set(605, [
      {
        id: 1,
        text: 'Замечательно! Номер для СБП: +7-999-123-45-67. Сумма 3500р. Переводите удобно?',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Да! Сейчас... Готово, перевела!',
        explanation: 'Хорошо, переходите к оплате.'
      }
    ]);

    // Шаг 606: Упомянули расписку - клиент расстроен
    tree.set(606, [
      {
        id: 617,
        text: 'Ой, простите! Я не то имела в виду! Это просто для бухгалтерии, чисто формальность. Но давайте лучше прямо сейчас оплатим - СБП или перевод на карту? Так проще будет для всех!',
        type: 'good',
        impact: { empathy: +6, conflictResolution: +6, professionalism: +5 },
        patientResponse: 'Ладно, давайте через СБП тогда.',
        explanation: 'Хорошо исправились! Объяснили и предложили лучший вариант.'
      },
      {
        id: 618,
        text: 'Ну это стандартная процедура для всех.',
        type: 'bad',
        impact: { empathy: -6, conflictResolution: -5 },
        patientResponse: 'Знаете, я как-то передумала к вам ходить...',
        explanation: 'Плохо! Не показали эмпатию, клиент уходит.'
      }
    ]);

    // Шаг 607: Спасли конфликт
    tree.set(607, [
      {
        id: 1,
        text: 'Вот номер для СБП: +7-999-123-45-67, сумма 3500 рублей. И еще раз извините за неудобство!',
        type: 'good',
        impact: { efficiency: +6, professionalism: +6 },
        patientResponse: 'Перевожу... Готово. Вот чек.',
        explanation: 'Хорошо! Быстро перешли к делу и извинились.'
      }
    ]);

    // Шаг 609: Сухой ответ после оплаты
    tree.set(609, [
      {
        id: 619,
        text: 'Наталья Владимировна, еще раз извините за неудобство! С кем не бывает. Спасибо за понимание! Выздоравливайте!',
        type: 'good',
        impact: { empathy: +6, professionalism: +5 },
        patientResponse: 'Спасибо, вы очень помогли! Хорошего дня!',
        explanation: 'Исправились! Добавили тепла в финал.'
      }
    ]);

    // Шаг 610: Отличный финал
    tree.set(610, [
      {
        id: 6,
        text: 'Наталья Владимировна, приятно было помочь! Не стесняйтесь обращаться если что-то нужно. До встречи!',
        type: 'good',
        impact: { empathy: +7, professionalism: +6 },
        patientResponse: 'Спасибо огромное! Вы замечательная! До свидания!',
        explanation: 'Идеально! Создали отличное впечатление несмотря на проблему.'
      }
    ]);

    // Шаг 611: Дали все варианты оплаты
    tree.set(611, [
      {
        id: 1,
        text: 'Отлично! Вот номер: +7-999-123-45-67. Получатель - Клиника Жемчужина, сумма 3500 рублей.',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Перевожу... Отправлено!',
        explanation: 'Хорошо, даете данные для оплаты.'
      }
    ]);

    // Шаг 612: Неуверенно предложили варианты
    tree.set(612, [
      {
        id: 620,
        text: 'Рекомендую СБП - это самый быстрый способ. Переводите по номеру телефона прямо в приложении банка. Займет минуту! Давайте так?',
        type: 'good',
        impact: { empathy: +6, efficiency: +6, professionalism: +5 },
        patientResponse: 'Да, давайте! Это я смогу.',
        explanation: 'Хорошо! Дали четкую рекомендацию и убрали сомнения.'
      }
    ]);

    // Шаг 613: Исправили неуверенность
    tree.set(613, [
      {
        id: 1,
        text: 'Замечательно! СБП номер: +7-999-123-45-67, сумма 3500р.',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Сейчас... Перевела!',
        explanation: 'Переходите к оплате.'
      }
    ]);

    // Шаг 614: Пытаются чинить терминал
    tree.set(614, [
      {
        id: 621,
        text: 'Знаете, давайте не будем тратить время! Есть СБП - это займет буквально минуту. Хотите попробуем так?',
        type: 'good',
        impact: { efficiency: +6, conflictResolution: +5 },
        patientResponse: 'Да, конечно! Быстрее давайте!',
        explanation: 'Исправились! Переключились на рабочее решение.'
      }
    ]);

    // Шаг 615: Объяснили СБП подробно
    tree.set(615, [
      {
        id: 4,
        text: 'Вижу, перевод пришел! Спасибо! Вот ваш чек. Все получилось!',
        type: 'good',
        impact: { efficiency: +6, empathy: +5 },
        patientResponse: 'Ура! Спасибо за помощь!',
        explanation: 'Отлично! Помогли и поддержали клиента.'
      }
    ]);

    // Шаг 616: Слишком краткое объяснение
    tree.set(616, [
      {
        id: 622,
        text: 'Конечно, покажу! Смотрите: открываем приложение банка, вот здесь "Платежи", выбираем "По номеру телефона", вводим +7-999-123-45-67, сумма 3500. Нажимаем "Перевести". Все просто!',
        type: 'good',
        impact: { empathy: +7, professionalism: +6, efficiency: +5 },
        patientResponse: 'Ааа, вот оно где! Сейчас... Готово, спасибо большое!',
        explanation: 'Отлично! Терпеливо помогли разобраться.'
      }
    ]);

    // Шаг 617: Исправили ситуацию с распиской
    tree.set(617, [
      {
        id: 1,
        text: 'Вот номер: +7-999-123-45-67, сумма 3500. Спасибо за понимание!',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Перевела. Все.',
        explanation: 'Переходите к оплате.'
      }
    ]);

    // Шаг 619: Добавили тепла в финал
    tree.set(619, [
      {
        id: 6,
        text: 'Рады были помочь! Всего доброго!',
        type: 'good',
        impact: { empathy: +5 },
        patientResponse: 'Спасибо, до свидания!',
        explanation: 'Хорошо завершили.'
      }
    ]);

    // Шаг 620: Дали рекомендацию по СБП
    tree.set(620, [
      {
        id: 1,
        text: 'Отлично! Номер: +7-999-123-45-67, сумма 3500р.',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Перевела!',
        explanation: 'Оформляете оплату.'
      }
    ]);

    // Шаг 621: Переключились на СБП
    tree.set(621, [
      {
        id: 1,
        text: 'Номер +7-999-123-45-67, сумма 3500. Все очень просто!',
        type: 'good',
        impact: { efficiency: +6 },
        patientResponse: 'Хорошо, переводю... Готово!',
        explanation: 'Быстро решили проблему.'
      }
    ]);

    // Шаг 622: Помогли разобраться пошагово
    tree.set(622, [
      {
        id: 4,
        text: 'Отлично! Перевод получен. Вот чек. Наталья Владимировна, спасибо за терпение! Все получилось!',
        type: 'good',
        impact: { empathy: +7, professionalism: +6 },
        patientResponse: 'Спасибо вам! Вы так хорошо объяснили! Молодец!',
        explanation: 'Превосходно! Помогли освоить новое и создали позитив.'
      }
    ]);

    // Шаг 6: Идеальный финал
    tree.set(6, [
      {
        id: 7,
        text: 'Всегда рады! Выздоравливайте! Хорошего дня!',
        type: 'good',
        impact: { empathy: +6 },
        patientResponse: 'И вам хорошего дня! Спасибо еще раз!',
        explanation: 'Идеально! Превратили проблему в позитивный опыт.'
      }
    ]);

    return tree;
  }

  makeChoice(choiceId: number): void {
    if (this.state.isCompleted) return;

    const currentChoices = this.dialogueTree.get(this.state.currentStep);
    if (!currentChoices) return;

    const choice = currentChoices.find(c => c.id === choiceId);
    if (!choice) return;

    // Добавляем выбор администратора
    this.state.dialogue.push({
      speaker: 'admin',
      text: choice.text,
      timestamp: Date.now()
    });

    // Добавляем ответ пациента
    this.state.dialogue.push({
      speaker: 'patient',
      text: choice.patientResponse,
      timestamp: Date.now()
    });

    // Обновляем параметры
    Object.entries(choice.impact).forEach(([key, value]) => {
      const paramKey = key as keyof typeof this.state.parameters;
      this.state.parameters[paramKey] = Math.max(0, Math.min(100, 
        this.state.parameters[paramKey] + (value || 0)
      ));
    });

    // Переходим к следующему шагу
    this.state.currentStep = choice.id;

    // Проверяем завершение
    if (!this.dialogueTree.has(choice.id)) {
      this.completeScenario();
    }
  }

  private completeScenario(): void {
    this.state.isCompleted = true;
    
    // Рассчитываем итоговый балл
    const weights = {
      empathy: 0.25,
      professionalism: 0.25,
      efficiency: 0.15,
      salesSkill: 0.20,
      conflictResolution: 0.15
    };

    const targetParams = this.state.scenario.targetParameters;
    let score = 0;

    Object.entries(this.state.parameters).forEach(([key, value]) => {
      const paramKey = key as keyof typeof targetParams;
      const target = targetParams[paramKey];
      const weight = weights[paramKey];
      const paramScore = (value / target) * 100 * weight;
      score += Math.min(paramScore, weight * 100);
    });

    this.state.finalScore = Math.round(score);
  }

  getState(): SimulatorState {
    return { ...this.state };
  }

  getCurrentChoices(): DialogueChoice[] {
    return this.dialogueTree.get(this.state.currentStep) || [];
  }

  getProgress(): number {
    // Прогресс основан на количестве реплик в диалоге
    const dialogueCount = Math.floor(this.state.dialogue.length / 2); // Делим на 2, т.к. каждый обмен = 2 реплики
    const maxDialogues = 20; // Примерно максимальное количество обменов
    return Math.min(100, (dialogueCount / maxDialogues) * 100);
  }
}