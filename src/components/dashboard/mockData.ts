import { Course, QuizQuestion, VoiceStep, Achievement, LeaderboardEntry } from './types';

export const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Продажи стоматологических услуг',
    description: 'Техники продаж для администраторов стоматологии',
    progress: 75,
    category: 'Продажи',
    duration: '4 часа',
    status: 'in-progress',
    lessons: [
      { id: 1, title: 'Введение в продажи', duration: '15 мин', completed: true, type: 'video' },
      { id: 2, title: 'Техники активных продаж', duration: '30 мин', completed: true, type: 'video' },
      { id: 3, title: 'Тест: Основы продаж', duration: '10 мин', completed: false, type: 'quiz' },
    ]
  },
  {
    id: 2,
    title: 'Работа с пациентами',
    description: 'Общение с пациентами и работа с возражениями',
    progress: 100,
    category: 'Сервис',
    duration: '3 часа',
    status: 'completed',
    lessons: [
      { id: 4, title: 'Психология пациента', duration: '20 мин', completed: true, type: 'text' },
      { id: 5, title: 'Работа с возражениями', duration: '25 мин', completed: true, type: 'video' },
    ]
  },
  {
    id: 3,
    title: 'Презентация лечения',
    description: 'Как правильно представить план лечения пациенту',
    progress: 0,
    category: 'Продажи',
    duration: '5 часов',
    status: 'not-started',
    lessons: []
  }
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