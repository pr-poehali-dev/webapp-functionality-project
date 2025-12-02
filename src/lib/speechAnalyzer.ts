export interface SpeechAnalysisResult {
  wordCount: number;
  duration: number;
  wordsPerMinute: number;
  keywordsFound: string[];
  keywordsMissing: string[];
  confidence: number;
  feedback: string;
}

export class SpeechAnalyzer {
  analyzeTranscript(
    transcript: string,
    expectedKeywords: string[],
    duration: number
  ): SpeechAnalysisResult {
    const normalizedTranscript = transcript.toLowerCase().trim();
    const words = normalizedTranscript.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    const durationMinutes = duration / 60;
    const wordsPerMinute = durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 0;

    const keywordsFound: string[] = [];
    const keywordsMissing: string[] = [];

    expectedKeywords.forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      if (normalizedTranscript.includes(normalizedKeyword)) {
        keywordsFound.push(keyword);
      } else {
        keywordsMissing.push(keyword);
      }
    });

    const keywordMatchRate = expectedKeywords.length > 0 
      ? keywordsFound.length / expectedKeywords.length 
      : 0;

    let lengthScore = 0;
    if (wordCount >= 10 && wordCount <= 50) {
      lengthScore = 1;
    } else if (wordCount >= 5 && wordCount < 10) {
      lengthScore = 0.7;
    } else if (wordCount > 50 && wordCount <= 100) {
      lengthScore = 0.8;
    } else if (wordCount > 0) {
      lengthScore = 0.5;
    }

    const confidence = Math.round((keywordMatchRate * 0.7 + lengthScore * 0.3) * 100);

    const feedback = this.generateFeedback(
      confidence,
      wordCount,
      keywordsFound.length,
      keywordsMissing.length,
      wordsPerMinute
    );

    return {
      wordCount,
      duration,
      wordsPerMinute,
      keywordsFound,
      keywordsMissing,
      confidence,
      feedback,
    };
  }

  private generateFeedback(
    confidence: number,
    wordCount: number,
    keywordsFoundCount: number,
    keywordsMissingCount: number,
    wpm: number
  ): string {
    const feedback: string[] = [];

    if (confidence >= 80) {
      feedback.push('Отлично! Вы использовали все необходимые фразы.');
    } else if (confidence >= 60) {
      feedback.push('Хорошо, но можно улучшить.');
    } else if (confidence >= 40) {
      feedback.push('Неплохо, но есть что доработать.');
    } else {
      feedback.push('Нужно больше практики.');
    }

    if (wordCount < 5) {
      feedback.push('Ответ слишком короткий, добавьте больше деталей.');
    } else if (wordCount > 100) {
      feedback.push('Ответ слишком длинный, старайтесь быть более кратким.');
    }

    if (keywordsMissingCount > 0) {
      feedback.push(`Не хватает ключевых фраз: ${keywordsMissingCount}.`);
    }

    if (wpm > 0) {
      if (wpm < 100) {
        feedback.push('Говорите немного медленно, попробуйте ускориться.');
      } else if (wpm > 200) {
        feedback.push('Вы говорите слишком быстро, замедлитесь для ясности.');
      } else {
        feedback.push('Темп речи отличный!');
      }
    }

    return feedback.join(' ');
  }

  extractKeyPhrases(transcript: string): string[] {
    const stopWords = new Set([
      'и', 'в', 'на', 'с', 'по', 'для', 'к', 'у', 'из', 'о', 'от', 'что', 'это',
      'как', 'мы', 'вы', 'я', 'он', 'она', 'они', 'а', 'но', 'же', 'бы', 'ли'
    ]);

    const words = transcript
      .toLowerCase()
      .replace(/[^\wа-яё\s]/gi, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    const wordFrequency = new Map<string, number>();
    words.forEach(word => {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    });

    return Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  calculateSentiment(transcript: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = [
      'хорошо', 'отлично', 'прекрасно', 'замечательно', 'рад', 'спасибо',
      'благодарю', 'помогу', 'конечно', 'обязательно', 'удовольствие'
    ];

    const negativeWords = [
      'плохо', 'ужасно', 'не могу', 'нельзя', 'невозможно', 'проблема',
      'сожалею', 'извините', 'к сожалению'
    ];

    const lowerTranscript = transcript.toLowerCase();
    
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (lowerTranscript.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (lowerTranscript.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
}

export default SpeechAnalyzer;
