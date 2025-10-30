import { TextProcessor } from './TextProcessor';

export class KeywordExtractor {
  private textProcessor: TextProcessor;

  constructor() {
    this.textProcessor = new TextProcessor();
  }

  /**
   * Extrae keywords más relevantes del texto
   */
  extractKeywords(text: string, topN: number = 10): string[] {
    const frequency = this.textProcessor.getTermFrequency(text);

    // Ordenar por frecuencia
    const sorted = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map((entry) => entry[0]);

    return sorted;
  }

  /**
   * Calcula TF-IDF (Term Frequency - Inverse Document Frequency)
   * Útil para encontrar términos importantes en un documento vs un corpus
   */
  calculateTfIdf(text: string, corpus: string[]): Map<string, number> {
    const tokens = this.textProcessor.process(text);
    const uniqueTokens = [...new Set(tokens)];
    const tfidf = new Map<string, number>();

    // Calcular TF (Term Frequency)
    const tf = new Map<string, number>();
    tokens.forEach((token) => {
      tf.set(token, (tf.get(token) || 0) + 1 / tokens.length);
    });

    // Calcular IDF (Inverse Document Frequency)
    uniqueTokens.forEach((token) => {
      const termFrequency = tf.get(token) || 0;
      
      // Contar en cuántos documentos aparece el término
      const docsWithTerm = corpus.filter((doc) => {
        const docTokens = this.textProcessor.process(doc);
        return docTokens.includes(token);
      }).length;

      const idf = Math.log(corpus.length / (1 + docsWithTerm));
      tfidf.set(token, termFrequency * idf);
    });

    return tfidf;
  }

  /**
   * Extrae keywords usando TF-IDF
   */
  extractKeywordsWithTfIdf(
    text: string,
    corpus: string[],
    topN: number = 10
  ): string[] {
    const tfidf = this.calculateTfIdf(text, corpus);

    return Array.from(tfidf.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map((entry) => entry[0]);
  }

  /**
   * Encuentra palabras clave que coinciden con un conjunto predefinido
   */
  findMatchingKeywords(text: string, keywordSet: string[]): string[] {
    const cleanedText = this.textProcessor.cleanText(text);
    const tokens = this.textProcessor.tokenize(cleanedText);

    return keywordSet.filter((keyword) => {
      const cleanedKeyword = this.textProcessor.cleanText(keyword);
      return tokens.includes(cleanedKeyword);
    });
  }

  /**
   * Calcula el score de coincidencia con un conjunto de keywords
   */
  calculateKeywordScore(text: string, keywords: string[]): number {
    const textTokens = this.textProcessor.process(text);
    const keywordTokens = keywords.map((kw) =>
      this.textProcessor.cleanText(kw)
    );

    let matches = 0;
    textTokens.forEach((token) => {
      if (keywordTokens.includes(token)) {
        matches++;
      }
    });

    return textTokens.length > 0 ? (matches / textTokens.length) * 100 : 0;
  }
}