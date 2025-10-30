import * as natural from 'natural';
import { STOPWORDS_SPANISH } from '@constants/keywords.constant';

export class TextProcessor {
  private tokenizer: any;
  private stemmer: any;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    // @ts-ignore - Natural no tiene tipos completos para PorterStemmerEs
    this.stemmer = natural.PorterStemmerEs || natural.PorterStemmer;
  }

  /**
   * Limpia y normaliza el texto
   */
  cleanText(text: string): string {
    if (!text) return '';

    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^\w\s]/g, ' ') // Remover caracteres especiales
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
  }

  /**
   * Tokeniza el texto en palabras
   */
  tokenize(text: string): string[] {
    const cleanedText = this.cleanText(text);
    const tokens = this.tokenizer.tokenize(cleanedText);
    return tokens || [];
  }

  /**
   * Remueve stopwords (palabras comunes sin significado)
   */
  removeStopWords(tokens: string[]): string[] {
    return tokens.filter((token) => !STOPWORDS_SPANISH.includes(token));
  }

  /**
   * Aplica stemming (reducir palabras a su raíz)
   */
  stemWords(tokens: string[]): string[] {
    return tokens.map((token) => {
      try {
        return this.stemmer.stem(token);
      } catch (error) {
        return token; // Si falla, retornar el token original
      }
    });
  }

  /**
   * Proceso completo: limpia, tokeniza, remueve stopwords y aplica stemming
   */
  process(text: string): string[] {
    const tokens = this.tokenize(text);
    const withoutStopwords = this.removeStopWords(tokens);
    return this.stemWords(withoutStopwords);
  }

  /**
   * Obtiene n-gramas (secuencias de n palabras)
   */
  getNGrams(text: string, n: number = 2): string[] {
    const tokens = this.tokenize(text);
    const ngrams: string[] = [];

    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }

    return ngrams;
  }

  /**
   * Calcula la frecuencia de términos
   */
  getTermFrequency(text: string): Map<string, number> {
    const tokens = this.process(text);
    const frequency = new Map<string, number>();

    tokens.forEach((token) => {
      frequency.set(token, (frequency.get(token) || 0) + 1);
    });

    return frequency;
  }
}