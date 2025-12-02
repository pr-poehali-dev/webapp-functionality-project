import { Course, QuizQuestion, VoiceStep, Achievement, LeaderboardEntry } from './types';

export const mockCourses: Course[] = [
  // Курсы для врачей
  {
    id: 1,
    title: 'Современные методы анестезии',
    description: 'Актуальные техники и препараты для безболезненного лечения',
    progress: 45,
    category: 'Клиническая практика',
    duration: '6 часов',
    status: 'in-progress',
    type: 'doctors',
    lessons: [
      { id: 1, title: 'Виды анестезии в стоматологии', duration: '25 мин', completed: true, type: 'video' },
      { id: 2, title: 'Современные анестетики', duration: '30 мин', completed: true, type: 'video' },
      { id: 3, title: 'Техники проведения анестезии', duration: '40 мин', completed: true, type: 'video' },
      { id: 4, title: 'Осложнения и их предотвращение', duration: '35 мин', completed: false, type: 'text' },
      { id: 5, title: 'Работа с тревожными пациентами', duration: '30 мин', completed: false, type: 'video' },
      { id: 6, title: 'Тест: Анестезия', duration: '15 мин', completed: false, type: 'quiz' },
    ]
  },
  {
    id: 2,
    title: 'Эндодонтия: современные протоколы',
    description: 'Лечение корневых каналов по последним стандартам',
    progress: 0,
    category: 'Клиническая практика',
    duration: '8 часов',
    status: 'not-started',
    type: 'doctors',
    lessons: [
      { id: 7, title: 'Анатомия корневых каналов', duration: '30 мин', completed: false, type: 'video' },
      { id: 8, title: 'Диагностика эндодонтических заболеваний', duration: '25 мин', completed: false, type: 'video' },
      { id: 9, title: 'Инструментальная обработка каналов', duration: '45 мин', completed: false, type: 'video' },
      { id: 10, title: 'Медикаментозная обработка', duration: '35 мин', completed: false, type: 'text' },
      { id: 11, title: 'Обтурация корневых каналов', duration: '40 мин', completed: false, type: 'video' },
      { id: 12, title: 'Повторное эндодонтическое лечение', duration: '50 мин', completed: false, type: 'video' },
      { id: 13, title: 'Тест: Эндодонтия', duration: '20 мин', completed: false, type: 'quiz' },
    ]
  },
  {
    id: 3,
    title: 'Цифровая стоматология',
    description: 'Использование CAD/CAM технологий и 3D-печати',
    progress: 100,
    category: 'Технологии',
    duration: '5 часов',
    status: 'completed',
    type: 'doctors',
    lessons: [
      { id: 14, title: 'Введение в цифровую стоматологию', duration: '20 мин', completed: true, type: 'video' },
      { id: 15, title: 'Интраоральное сканирование', duration: '35 мин', completed: true, type: 'video' },
      { id: 16, title: 'CAD/CAM системы', duration: '40 мин', completed: true, type: 'video' },
      { id: 17, title: '3D-печать в стоматологии', duration: '30 мин', completed: true, type: 'text' },
      { id: 18, title: 'Тест: Цифровые технологии', duration: '15 мин', completed: true, type: 'quiz' },
    ]
  },
  {
    id: 4,
    title: 'Имплантология для начинающих',
    description: 'Основы планирования и установки имплантатов',
    progress: 20,
    category: 'Хирургия',
    duration: '10 часов',
    status: 'in-progress',
    type: 'doctors',
    lessons: [
      { id: 19, title: 'Основы имплантологии', duration: '30 мин', completed: true, type: 'video' },
      { id: 20, title: 'Показания и противопоказания', duration: '25 мин', completed: true, type: 'text' },
      { id: 21, title: 'Планирование имплантации', duration: '45 мин', completed: false, type: 'video' },
      { id: 22, title: 'Хирургический протокол', duration: '60 мин', completed: false, type: 'video' },
      { id: 23, title: 'Костная пластика', duration: '50 мин', completed: false, type: 'video' },
      { id: 24, title: 'Осложнения и их профилактика', duration: '40 мин', completed: false, type: 'text' },
      { id: 25, title: 'Тест: Имплантология', duration: '20 мин', completed: false, type: 'quiz' },
    ]
  },

  // Курсы по продажам
  {
    id: 5,
    title: 'Активные продажи в стоматологии',
    description: 'Техники продаж стоматологических услуг премиум-сегмента',
    progress: 75,
    category: 'Продажи',
    duration: '5 часов',
    status: 'in-progress',
    type: 'sales',
    lessons: [
      { id: 26, title: 'Психология продаж в стоматологии', duration: '25 мин', completed: true, type: 'video' },
      { id: 27, title: 'Выявление потребностей пациента', duration: '30 мин', completed: true, type: 'video' },
      { id: 28, title: 'Презентация плана лечения', duration: '35 мин', completed: true, type: 'video' },
      { id: 29, title: 'Работа с возражениями', duration: '40 мин', completed: true, type: 'video' },
      { id: 30, title: 'Закрытие сделки', duration: '30 мин', completed: false, type: 'video' },
      { id: 31, title: 'Тест: Продажи', duration: '15 мин', completed: false, type: 'quiz' },
    ]
  },
  {
    id: 6,
    title: 'Увеличение среднего чека',
    description: 'Стратегии повышения стоимости лечения',
    progress: 0,
    category: 'Продажи',
    duration: '4 часа',
    status: 'not-started',
    type: 'sales',
    lessons: [
      { id: 32, title: 'Анализ текущего чека', duration: '20 мин', completed: false, type: 'video' },
      { id: 33, title: 'Допродажи и кросс-продажи', duration: '35 мин', completed: false, type: 'video' },
      { id: 34, title: 'Презентация комплексных планов', duration: '40 мин', completed: false, type: 'video' },
      { id: 35, title: 'Работа с ценой', duration: '30 мин', completed: false, type: 'text' },
      { id: 36, title: 'Тест: Увеличение чека', duration: '15 мин', completed: false, type: 'quiz' },
    ]
  },
  {
    id: 7,
    title: 'Продажи эстетических услуг',
    description: 'Специфика продаж отбеливания, виниров и эстетики',
    progress: 100,
    category: 'Продажи',
    duration: '4 часа',
    status: 'completed',
    type: 'sales',
    lessons: [
      { id: 37, title: 'Особенности эстетической стоматологии', duration: '25 мин', completed: true, type: 'video' },
      { id: 38, title: 'Визуализация результата', duration: '30 мин', completed: true, type: 'video' },
      { id: 39, title: 'Работа с ожиданиями', duration: '35 мин', completed: true, type: 'text' },
      { id: 40, title: 'Кейсы успешных продаж', duration: '30 мин', completed: true, type: 'video' },
      { id: 41, title: 'Тест: Эстетические услуги', duration: '15 мин', completed: true, type: 'quiz' },
    ]
  },
  {
    id: 8,
    title: 'Скрипты продаж',
    description: 'Готовые скрипты для разных ситуаций',
    progress: 30,
    category: 'Продажи',
    duration: '3 часа',
    status: 'in-progress',
    type: 'sales',
    lessons: [
      { id: 42, title: 'Структура эффективного скрипта', duration: '20 мин', completed: true, type: 'video' },
      { id: 43, title: 'Скрипт первичной консультации', duration: '25 мин', completed: true, type: 'text' },
      { id: 44, title: 'Скрипт повторного визита', duration: '25 мин', completed: false, type: 'text' },
      { id: 45, title: 'Скрипт работы с возражениями', duration: '30 мин', completed: false, type: 'video' },
      { id: 46, title: 'Тест: Скрипты', duration: '10 мин', completed: false, type: 'quiz' },
    ]
  },

  // Курсы для администраторов
  {
    id: 9,
    title: 'Эффективная работа администратора',
    description: 'Полный курс для администраторов медицинских клиник',
    progress: 60,
    category: 'Администрирование',
    duration: '6 часов',
    status: 'in-progress',
    type: 'admins',
    lessons: [
      { id: 47, title: 'Роль администратора в клинике', duration: '20 мин', completed: true, type: 'video' },
      { id: 48, title: 'Прием и регистрация пациентов', duration: '30 мин', completed: true, type: 'video' },
      { id: 49, title: 'Телефонные переговоры', duration: '35 мин', completed: true, type: 'video' },
      { id: 50, title: 'Работа с расписанием', duration: '25 мин', completed: true, type: 'text' },
      { id: 51, title: 'Конфликтные ситуации', duration: '30 мин', completed: false, type: 'video' },
      { id: 52, title: 'Финансовые операции', duration: '25 мин', completed: false, type: 'text' },
      { id: 53, title: 'Тест: Работа администратора', duration: '15 мин', completed: false, type: 'quiz' },
    ]
  },
  {
    id: 10,
    title: 'Работа с CRM системой',
    description: 'Эффективное использование CRM для управления клиникой',
    progress: 0,
    category: 'Технологии',
    duration: '4 часа',
    status: 'not-started',
    type: 'admins',
    lessons: [
      { id: 54, title: 'Введение в CRM', duration: '20 мин', completed: false, type: 'video' },
      { id: 55, title: 'Карточка пациента', duration: '30 мин', completed: false, type: 'video' },
      { id: 56, title: 'Запись на прием', duration: '25 мин', completed: false, type: 'video' },
      { id: 57, title: 'Отчеты и аналитика', duration: '35 мин', completed: false, type: 'text' },
      { id: 58, title: 'Автоматизация процессов', duration: '30 мин', completed: false, type: 'video' },
      { id: 59, title: 'Тест: CRM система', duration: '15 мин', completed: false, type: 'quiz' },
    ]
  },
  {
    id: 11,
    title: 'Сервис и клиентский опыт',
    description: 'Создание wow-сервиса для пациентов',
    progress: 100,
    category: 'Сервис',
    duration: '5 часов',
    status: 'completed',
    type: 'admins',
    lessons: [
      { id: 60, title: 'Философия клиентоориентированности', duration: '25 мин', completed: true, type: 'video' },
      { id: 61, title: 'Первое впечатление пациента', duration: '30 мин', completed: true, type: 'video' },
      { id: 62, title: 'Стандарты обслуживания', duration: '35 мин', completed: true, type: 'text' },
      { id: 63, title: 'Работа с отзывами', duration: '25 мин', completed: true, type: 'video' },
      { id: 64, title: 'Программы лояльности', duration: '30 мин', completed: true, type: 'video' },
      { id: 65, title: 'Тест: Клиентский сервис', duration: '15 мин', completed: true, type: 'quiz' },
    ]
  },
  {
    id: 12,
    title: 'Медицинская документация',
    description: 'Правильное ведение медицинской документации',
    progress: 40,
    category: 'Администрирование',
    duration: '3 часа',
    status: 'in-progress',
    type: 'admins',
    lessons: [
      { id: 66, title: 'Виды медицинских документов', duration: '20 мин', completed: true, type: 'video' },
      { id: 67, title: 'Медицинская карта пациента', duration: '30 мин', completed: true, type: 'text' },
      { id: 68, title: 'Договоры и согласия', duration: '25 мин', completed: false, type: 'text' },
      { id: 69, title: 'Архивирование документов', duration: '20 мин', completed: false, type: 'video' },
      { id: 70, title: 'Тест: Документация', duration: '10 мин', completed: false, type: 'quiz' },
    ]
  },
];

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'Какой первый шаг в технике активных продаж?',
    options: ['Презентация услуги', 'Выявление потребностей', 'Закрытие сделки', 'Работа с возражениями'],
    correctAnswer: 1
  },
  {
    id: 2,
    question: 'Что важнее всего при работе с пациентом?',
    options: ['Скорость обслуживания', 'Эмпатия и понимание', 'Знание прайса', 'Красивая речь'],
    correctAnswer: 1
  },
  {
    id: 3,
    question: 'Как правильно реагировать на возражение "Дорого"?',
    options: ['Сразу дать скидку', 'Выяснить истинную причину', 'Сравнить с конкурентами', 'Перейти к другой услуге'],
    correctAnswer: 1
  }
];

export const mockVoiceSteps: VoiceStep[] = [
  {
    id: 1,
    prompt: 'Поздоровайтесь с пациентом и представьтесь',
    expectedKeywords: ['здравствуйте', 'добрый день', 'меня зовут']
  },
  {
    id: 2,
    prompt: 'Спросите, как вы можете помочь пациенту',
    expectedKeywords: ['помочь', 'чем могу', 'обратились']
  },
  {
    id: 3,
    prompt: 'Предложите записаться на консультацию',
    expectedKeywords: ['записаться', 'консультация', 'прием', 'врач']
  }
];

export const mockAchievements: Achievement[] = [
  {
    id: 1,
    title: 'Первый шаг',
    description: 'Завершите первый урок',
    icon: 'Award',
    unlocked: true,
    progress: 1,
    total: 1
  },
  {
    id: 2,
    title: 'Знаток продаж',
    description: 'Завершите 5 уроков по продажам',
    icon: 'TrendingUp',
    unlocked: true,
    progress: 5,
    total: 5
  },
  {
    id: 3,
    title: 'Мастер общения',
    description: 'Пройдите все тренажеры голосового общения',
    icon: 'Mic',
    unlocked: false,
    progress: 2,
    total: 5
  },
  {
    id: 4,
    title: 'Отличник',
    description: 'Наберите 90%+ в 10 тестах',
    icon: 'Star',
    unlocked: false,
    progress: 3,
    total: 10
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { 
    id: 1, 
    name: 'Анна Смирнова', 
    avatar: 'АС', 
    points: 3500, 
    rank: 1, 
    coursesCompleted: 8,
    position: 'Старший администратор',
    achievements: ['Знаток продаж', 'Мастер общения', 'Отличник'],
    level: 12
  },
  { 
    id: 2, 
    name: 'Мария Петрова', 
    avatar: 'МП', 
    points: 3200, 
    rank: 2, 
    coursesCompleted: 7,
    position: 'Администратор',
    achievements: ['Знаток продаж', 'Мастер общения'],
    level: 10
  },
  { 
    id: 3, 
    name: 'Елена Иванова', 
    avatar: 'ЕИ', 
    points: 2800, 
    rank: 3, 
    coursesCompleted: 6,
    position: 'Координатор',
    achievements: ['Первый шаг', 'Знаток продаж'],
    level: 9
  },
  { 
    id: 4, 
    name: 'Ольга Васильева', 
    avatar: 'ОВ', 
    points: 2150, 
    rank: 4, 
    coursesCompleted: 5,
    position: 'Администратор',
    achievements: ['Первый шаг'],
    level: 7
  },
  { 
    id: 5, 
    name: 'Дарья Козлова', 
    avatar: 'ДК', 
    points: 1900, 
    rank: 5, 
    coursesCompleted: 4,
    position: 'Стажер',
    achievements: ['Первый шаг'],
    level: 6
  },
  { 
    id: 6, 
    name: 'Татьяна Новикова', 
    avatar: 'ТН', 
    points: 1650, 
    rank: 6, 
    coursesCompleted: 3,
    position: 'Администратор',
    achievements: [],
    level: 5
  },
  { 
    id: 7, 
    name: 'Светлана Морозова', 
    avatar: 'СМ', 
    points: 1400, 
    rank: 7, 
    coursesCompleted: 3,
    position: 'Стажер',
    achievements: ['Первый шаг'],
    level: 4
  },
];