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

    tree.set(0, [
      {
        id: 1,
        text: 'Добрый день! Меня зовут Анна, я администратор клиники. Расскажите, пожалуйста, что вас беспокоит?',
        type: 'good',
        impact: { empathy: +15, professionalism: +10, efficiency: +5 },
        patientResponse: 'Ой, спасибо! У меня вот верхний зуб справа болит, особенно когда холодное пью. Уже дня три так...',
        explanation: 'Отлично! Вы представились, проявили участие и задали открытый вопрос.'
      },
      {
        id: 2,
        text: 'Слушаю вас. К какому врачу хотите записаться?',
        type: 'neutral',
        impact: { professionalism: +5, efficiency: +5 },
        patientResponse: 'Ну... я не знаю, к какому... У меня просто зуб болит.',
        explanation: 'Профессионально, но суховато. Лучше сначала выяснить проблему.'
      },
      {
        id: 3,
        text: 'Да-да, слушаю. Что у вас там?',
        type: 'bad',
        impact: { empathy: -10, professionalism: -5 },
        patientResponse: 'Эм... У меня зуб болит... Вы меня вообще слушаете?',
        explanation: 'Слишком небрежно. Пациент почувствовал, что вы не заинтересованы.'
      }
    ]);

    tree.set(1, [
      {
        id: 4,
        text: 'Понимаю, это неприятно. Давайте я запишу вас к стоматологу-терапевту, он посмотрит и поможет. Когда вам удобно прийти?',
        type: 'good',
        impact: { empathy: +10, efficiency: +15, salesSkill: +10 },
        patientResponse: 'О, спасибо! А можно сегодня или завтра? А то я уже измучилась...',
        explanation: 'Прекрасно! Вы проявили эмпатию и сразу предложили решение.'
      },
      {
        id: 5,
        text: 'Хорошо. У нас свободное окно через неделю, в среду. Записать?',
        type: 'bad',
        impact: { empathy: -10, efficiency: -15 },
        patientResponse: 'Через неделю?! Но мне больно прямо сейчас! А раньше никак нельзя?',
        explanation: 'Вы не учли срочность ситуации. При боли нужно предложить ближайшее время.'
      }
    ]);

    tree.set(4, [
      {
        id: 6,
        text: 'Сейчас проверю расписание... Есть окно сегодня в 16:30 или завтра в 10:00. Что вам удобнее?',
        type: 'good',
        impact: { efficiency: +15, professionalism: +10 },
        patientResponse: 'Завтра в 10 отлично! А сколько это будет стоить примерно?',
        explanation: 'Отлично! Вы предложили конкретные варианты и дали выбор.'
      },
      {
        id: 7,
        text: 'Приходите сегодня, когда сможете, мы вас примем',
        type: 'neutral',
        impact: { empathy: +5, efficiency: -5 },
        patientResponse: 'А во сколько конкретно? У меня же работа, мне нужно отпроситься...',
        explanation: 'Слишком расплывчато. Пациенту нужно точное время.'
      }
    ]);

    tree.set(6, [
      {
        id: 8,
        text: 'Первичный осмотр и консультация — 1500 рублей. Врач посмотрит и озвучит план лечения с ценами. Вас устроит?',
        type: 'good',
        impact: { professionalism: +10, salesSkill: +10 },
        patientResponse: 'Да, хорошо, понятно. Записывайте меня на завтра в 10. Что с собой взять?',
        explanation: 'Идеально! Вы честно назвали цену и подготовили к дальнейшим расходам.'
      },
      {
        id: 9,
        text: 'Ну это зависит от лечения, может от 2 до 20 тысяч',
        type: 'bad',
        impact: { professionalism: -10, salesSkill: -15 },
        patientResponse: 'Что?! 20 тысяч?! Я думала пару тысяч... Мне нужно подумать',
        explanation: 'Вы напугали пациента неопределённостью и максимальной ценой.'
      }
    ]);

    tree.set(8, [
      {
        id: 10,
        text: 'Паспорт и хорошее настроение! Запишите адрес: улица Ленина 15. Ждём вас завтра в 10:00. Выздоравливайте!',
        type: 'good',
        impact: { empathy: +10, professionalism: +10 },
        patientResponse: 'Спасибо большое! До завтра!',
        explanation: 'Отлично завершили разговор! Дружелюбно, профессионально, всё понятно.'
      }
    ]);

    return tree;
  }

  private buildPriceObjectionTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    tree.set(0, [
      {
        id: 1,
        text: 'Андрей Петрович, я понимаю ваше удивление. Давайте я расскажу, из чего складывается эта сумма?',
        type: 'good',
        impact: { empathy: +10, conflictResolution: +15, salesSkill: +10 },
        patientResponse: 'Ну давайте, интересно послушать, за что такие деньги...',
        explanation: 'Отлично! Вы сохранили спокойствие и предложили объяснить.'
      },
      {
        id: 2,
        text: 'Это включает имплант премиум-класса, работу хирурга и ортопеда, анестезию, все материалы...',
        type: 'neutral',
        impact: { professionalism: +5 },
        patientResponse: 'Да-да, я всё это понимаю, но всё равно дорого!',
        explanation: 'Вы начали объяснять, но не учли эмоции пациента.'
      },
      {
        id: 3,
        text: 'Если вам дорого, то вы можете поискать клиники подешевле',
        type: 'bad',
        impact: { empathy: -20, salesSkill: -25, conflictResolution: -20 },
        patientResponse: 'Вот так вот? Ну ладно, пойду в ту клинику! Досвидания!',
        explanation: 'Катастрофа! Вы потеряли пациента и испортили репутацию клиники.'
      }
    ]);

    tree.set(1, [
      {
        id: 4,
        text: 'В стоимость входит: швейцарский имплант с пожизненной гарантией, работа хирурга-имплантолога с опытом 15 лет, все расходные материалы, 3D-планирование операции и год наблюдения. Это инвестиция в здоровье на всю жизнь.',
        type: 'good',
        impact: { professionalism: +15, salesSkill: +20 },
        patientResponse: 'М-да, звучит серьёзно... А нельзя как-то подешевле? Может рассрочку какую?',
        explanation: 'Отлично! Вы показали ценность и обосновали цену.'
      },
      {
        id: 5,
        text: 'Ну смотрите: имплант, коронка, работа... В общем, всё включено',
        type: 'bad',
        impact: { professionalism: -10, salesSkill: -15 },
        patientResponse: 'Это я и сам понимаю. Вопрос — почему так дорого?!',
        explanation: 'Слишком расплывчато. Пациент не получил убедительных аргументов.'
      }
    ]);

    tree.set(4, [
      {
        id: 6,
        text: 'Конечно! У нас есть рассрочка на 12 месяцев без процентов — это около 7000 в месяц. Или можем разбить лечение на этапы. Какой вариант удобнее?',
        type: 'good',
        impact: { salesSkill: +20, efficiency: +15, empathy: +10 },
        patientResponse: 'О, 7 тысяч в месяц — это уже интереснее! А подробнее про рассрочку расскажите...',
        explanation: 'Превосходно! Вы превратили возражение в возможность продажи.'
      },
      {
        id: 7,
        text: 'Ну, рассрочка есть, но это надо у менеджера уточнять',
        type: 'neutral',
        impact: { efficiency: -10 },
        patientResponse: 'А вы че, не знаете сами? Позовите менеджера тогда',
        explanation: 'Вы должны знать условия рассрочки! Это базовая информация.'
      }
    ]);

    tree.set(6, [
      {
        id: 8,
        text: 'Рассрочка оформляется за 10 минут, без первого взноса. Просто паспорт и согласие. Хотите, я сразу запишу вас на консультацию, где врач всё подробно расскажет и мы оформим рассрочку?',
        type: 'good',
        impact: { salesSkill: +20, professionalism: +15, efficiency: +15 },
        patientResponse: 'Ладно, давайте запишите. Когда можно прийти?',
        explanation: 'Блестяще! Вы закрыли возражение и довели до записи.'
      }
    ]);

    return tree;
  }

  private buildAngryPatientTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    tree.set(0, [
      {
        id: 1,
        text: 'Виктор Сергеевич, примите мои искренние извинения! Я прямо сейчас узнаю, что случилось, и решу этот вопрос. Одну минуту!',
        type: 'good',
        impact: { empathy: +20, conflictResolution: +25, professionalism: +15 },
        patientResponse: 'Ну наконец-то! Хоть кто-то реагирует. Узнайте там, что за безобразие!',
        explanation: 'Отлично! Вы взяли ответственность и показали готовность действовать.'
      },
      {
        id: 2,
        text: 'Извините, врач с предыдущим пациентом задерживается. Такое бывает.',
        type: 'bad',
        impact: { empathy: -15, conflictResolution: -20 },
        patientResponse: 'ТАКОЕ БЫВАЕТ?! Вы серьёзно?! Моё время тоже чего-то стоит!',
        explanation: 'Это звучит как оправдание, а не решение проблемы.'
      },
      {
        id: 3,
        text: 'Не кричите, пожалуйста. Все пациенты ждут.',
        type: 'bad',
        impact: { empathy: -25, conflictResolution: -30, professionalism: -15 },
        patientResponse: 'Как вы со мной разговариваете?! Позовите руководителя, немедленно!',
        explanation: 'Катастрофа! Вы обострили конфликт вместо того, чтобы его гасить.'
      }
    ]);

    tree.set(1, [
      {
        id: 4,
        text: 'Виктор Сергеевич, я узнала — у врача возникла сложность с предыдущим лечением. Он примет вас через 10 минут. А чтобы компенсировать ожидание, мы проведём бесплатную профчистку на следующем визите. Вас устроит?',
        type: 'good',
        impact: { conflictResolution: +25, professionalism: +20, empathy: +15 },
        patientResponse: 'Ну хоть так... Ладно, подожду ещё 10 минут. Но не больше!',
        explanation: 'Превосходно! Вы дали конкретную информацию и предложили компенсацию.'
      },
      {
        id: 5,
        text: 'Сейчас врач освободится, ещё немного подождите',
        type: 'neutral',
        impact: { efficiency: -10 },
        patientResponse: 'Вы мне уже 40 минут говорите "ещё немного"! Конкретное время скажите!',
        explanation: 'Слишком размыто. Пациенту нужна определённость.'
      }
    ]);

    tree.set(4, [
      {
        id: 6,
        text: 'Спасибо за понимание! Я принесу вам кофе или чай, пока ждёте. И вот Wi-Fi пароль, если нужно.',
        type: 'good',
        impact: { empathy: +15, professionalism: +10 },
        patientResponse: 'Ладно, спасибо. Кофе бы не помешал.',
        explanation: 'Отлично! Вы создали комфорт и загладили неприятную ситуацию.'
      }
    ]);

    return tree;
  }

  private buildUpsellTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    tree.set(0, [
      {
        id: 1,
        text: 'Рада, что вам понравилось! Знаете, я заметила, что у вас очень красивая улыбка. Вы когда-нибудь думали об отбеливании? Сейчас как раз акция!',
        type: 'good',
        impact: { salesSkill: +20, empathy: +10 },
        patientResponse: 'Да вот думала... А что за акция? И насколько белее станут?',
        explanation: 'Отлично! Вы подхватили сигнал интереса и естественно перевели на продажу.'
      },
      {
        id: 2,
        text: 'Да, цвет эмали с возрастом темнеет. Это нормально.',
        type: 'bad',
        impact: { salesSkill: -20, empathy: -10 },
        patientResponse: 'Ну да, понятно... Спасибо. До свидания.',
        explanation: 'Вы упустили возможность допродажи! Пациент подал явный сигнал интереса.'
      }
    ]);

    tree.set(1, [
      {
        id: 3,
        text: 'Профессиональное отбеливание Amazing White даёт отбеливание на 7-10 тонов за 1 час. Посмотрите фото наших пациентов — вот такой результат. Сейчас по акции 7900 вместо 12000. До конца месяца!',
        type: 'good',
        impact: { salesSkill: +25, professionalism: +15 },
        patientResponse: 'Вау, красиво! А это безопасно? Не повредит эмаль?',
        explanation: 'Превосходно! Вы показали результат, цену и создали срочность.'
      },
      {
        id: 4,
        text: 'Ну тоны на 5-7 точно станут белее. Стоит около 10 тысяч.',
        type: 'neutral',
        impact: { salesSkill: +5 },
        patientResponse: 'М-да, дорого как-то... Я подумаю',
        explanation: 'Слишком сухо и дорого. Нужно было больше продать ценность.'
      }
    ]);

    tree.set(3, [
      {
        id: 5,
        text: 'Абсолютно безопасно! Используем гель последнего поколения без перекиси, который укрепляет эмаль. Врач перед процедурой всё проверит. Хотите запишу вас на следующей неделе, чтобы успеть по акции?',
        type: 'good',
        impact: { salesSkill: +25, empathy: +10, efficiency: +15 },
        patientResponse: 'Ладно, давайте! А можно в субботу?',
        explanation: 'Блестяще! Вы закрыли возражение и довели до записи.'
      }
    ]);

    return tree;
  }

  private buildScaredChildTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    tree.set(0, [
      {
        id: 1,
        text: 'Ольга Андреевна, всё хорошо! Саша, привет! Я вижу, ты немного волнуешься. Знаешь, у нас тут совсем не страшно — даже мультики показываем! Хочешь сначала посмотреть, как тут красиво?',
        type: 'good',
        impact: { empathy: +25, professionalism: +15 },
        patientResponse: 'Саша перестал плакать и выглядывает из-за мамы. Мама: "О, спасибо! Саша, слышишь, мультики будут!"',
        explanation: 'Отлично! Вы переключили внимание ребёнка и сняли напряжение.'
      },
      {
        id: 2,
        text: 'Не переживайте, наш врач умеет работать с детьми. Сейчас вызову его.',
        type: 'neutral',
        impact: { professionalism: +5 },
        patientResponse: 'НЕЕЕЕТ! Я не хочу к врачу! Мама, пойдём домой!',
        explanation: 'Вы действуете правильно, но слишком быстро переходите к делу.'
      },
      {
        id: 3,
        text: 'Ну что такое, это же не больно! Все дети лечат зубы.',
        type: 'bad',
        impact: { empathy: -20, professionalism: -15 },
        patientResponse: 'Саша плачет ещё громче. Мама: "Вы только хуже делаете! Мы уходим!"',
        explanation: 'Так нельзя! Вы обесценили страх ребёнка и потеряли доверие.'
      }
    ]);

    tree.set(1, [
      {
        id: 4,
        text: 'Саша, смотри, у нас есть волшебное кресло! Оно может подниматься и опускаться — как в ракете! Хочешь попробовать на нём покататься? А врач просто посмотрит зубки, как мама дома. Можно даже не лечить сегодня, просто познакомимся!',
        type: 'good',
        impact: { empathy: +25, professionalism: +20 },
        patientResponse: 'Саша заинтересованно смотрит. Мама: "Саша, правда, только посмотрит! Давай попробуем?"',
        explanation: 'Превосходно! Вы превратили страх в интерес и сняли давление.'
      },
      {
        id: 5,
        text: 'У врача есть специальные детские инструменты, совсем маленькие',
        type: 'neutral',
        impact: {},
        patientResponse: 'Инструменты?! НЕЕЕЕТ! (плачет)',
        explanation: 'Слово "инструменты" напугало ещё больше.'
      }
    ]);

    tree.set(4, [
      {
        id: 6,
        text: 'А ещё у нас за смелость дарят подарки! Саша, ты любишь машинки или раскраски? Заходи, покажу!',
        type: 'good',
        impact: { empathy: +20, efficiency: +15 },
        patientResponse: 'Саша: "Машинки..." Мама: "Спасибо вам огромное! Саша, пойдём посмотрим!"',
        explanation: 'Блестяще! Вы создали позитивную мотивацию и помогли семье.'
      }
    ]);

    return tree;
  }

  private buildVipPatientTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    tree.set(0, [
      {
        id: 1,
        text: 'Михаил Константинович, добрый день! Сейчас проверю возможность приёма на завтра. Один момент, буквально 30 секунд.',
        type: 'good',
        impact: { professionalism: +20, efficiency: +20 },
        patientResponse: 'Хорошо, жду.',
        explanation: 'Отлично! Вы проявили уважение и сразу начали действовать.'
      },
      {
        id: 2,
        text: 'У нас очередь на две недели вперёд, но могу попробовать найти окно...',
        type: 'bad',
        impact: { efficiency: -15, professionalism: -10 },
        patientResponse: 'То есть, даже за доплату нельзя? Странно. Я думал, у вас сервис на уровне.',
        explanation: 'Вы сразу начали с негатива. Сначала проверьте возможности!'
      }
    ]);

    tree.set(1, [
      {
        id: 3,
        text: 'Михаил Константинович, отличные новости! Наш главный ортопед, Смирнов Игорь Петрович, кандидат медицинских наук, сможет принять вас завтра в 10:30. Это будет расширенная консультация с 3D-диагностикой. Вас устроит?',
        type: 'good',
        impact: { professionalism: +25, efficiency: +20, salesSkill: +15 },
        patientResponse: 'Прекрасно! Именно то, что нужно. Записывайте.',
        explanation: 'Превосходно! Вы подчеркнули статус врача и показали ценность.'
      },
      {
        id: 4,
        text: 'Да, могу записать на завтра. У нас свободно в 10:00.',
        type: 'neutral',
        impact: { efficiency: +10 },
        patientResponse: 'А к кому конкретно? Кто лучший специалист?',
        explanation: 'Сухо. Для VIP-клиента нужно больше внимания и деталей.'
      }
    ]);

    tree.set(3, [
      {
        id: 5,
        text: 'Отлично! Запишите, пожалуйста: клиника на Тверской, 15, 3 этаж. Ваш личный менеджер Анна встретит вас в холле. Пришлю все детали на WhatsApp. Что-то ещё подготовить к визиту?',
        type: 'good',
        impact: { professionalism: +20, efficiency: +15, empathy: +10 },
        patientResponse: 'Великолепно! Очень профессионально. Жду сообщение.',
        explanation: 'Блестяще! Вы обеспечили VIP-сервис и внимание к деталям.'
      }
    ]);

    return tree;
  }

  private buildPaymentIssueTree(): Map<number, DialogueChoice[]> {
    const tree = new Map<number, DialogueChoice[]>();

    tree.set(0, [
      {
        id: 1,
        text: 'Наталья Владимировна, не переживайте! У нас есть СБП, можно по номеру телефона перевести. Или на карту клиники. Какой способ удобнее?',
        type: 'good',
        impact: { empathy: +15, efficiency: +20, professionalism: +10 },
        patientResponse: 'О, спасибо! СБП отлично подойдёт, у меня на телефоне всё есть!',
        explanation: 'Отлично! Вы сразу предложили решение и сняли стресс.'
      },
      {
        id: 2,
        text: 'Можете завтра привезти, мы вас знаем.',
        type: 'neutral',
        impact: { empathy: +5 },
        patientResponse: 'А документ какой-то нужен, что я должна?',
        explanation: 'Это рискованно и непрофессионально. Нужно оформить официально.'
      },
      {
        id: 3,
        text: 'Как же так? Надо было заранее проверить! Без оплаты не можем отпустить.',
        type: 'bad',
        impact: { empathy: -20, professionalism: -15, conflictResolution: -15 },
        patientResponse: 'Что?! Я что, должник какой-то?! Я постоянный клиент! Хамство!',
        explanation: 'Катастрофа! Вы обвинили пациента и создали конфликт.'
      }
    ]);

    tree.set(1, [
      {
        id: 4,
        text: 'Сейчас скажу реквизиты. Переведёте, и я сразу выбью чек. Буквально минута! *диктует номер телефона для СБП*',
        type: 'good',
        impact: { efficiency: +20, professionalism: +15 },
        patientResponse: 'Перевела! Вот, смотрите, операция прошла.',
        explanation: 'Отлично! Быстро и профессионально решили вопрос.'
      }
    ]);

    tree.set(4, [
      {
        id: 5,
        text: 'Получили, спасибо! Вот ваш чек. Наталья Владимировна, с кем не бывает! Главное, что всё решилось. Выздоравливайте!',
        type: 'good',
        impact: { empathy: +15, professionalism: +10 },
        patientResponse: 'Спасибо вам большое! Как хорошо, что всё так быстро! Вы молодец!',
        explanation: 'Превосходно! Вы превратили неловкую ситуацию в позитивный опыт.'
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
    const totalSteps = Array.from(this.dialogueTree.keys()).length;
    return totalSteps > 0 ? (this.state.currentStep / totalSteps) * 100 : 0;
  }
}
