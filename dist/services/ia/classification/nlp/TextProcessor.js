"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextProcessor = void 0;
const natural = __importStar(require("natural"));
const keywords_constant_1 = require("@constants/keywords.constant");
class TextProcessor {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        // @ts-ignore - Natural no tiene tipos completos para PorterStemmerEs
        this.stemmer = natural.PorterStemmerEs || natural.PorterStemmer;
    }
    /**
     * Limpia y normaliza el texto
     */
    cleanText(text) {
        if (!text)
            return '';
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
    tokenize(text) {
        const cleanedText = this.cleanText(text);
        const tokens = this.tokenizer.tokenize(cleanedText);
        return tokens || [];
    }
    /**
     * Remueve stopwords (palabras comunes sin significado)
     */
    removeStopWords(tokens) {
        return tokens.filter((token) => !keywords_constant_1.STOPWORDS_SPANISH.includes(token));
    }
    /**
     * Aplica stemming (reducir palabras a su raíz)
     */
    stemWords(tokens) {
        return tokens.map((token) => {
            try {
                return this.stemmer.stem(token);
            }
            catch (error) {
                return token; // Si falla, retornar el token original
            }
        });
    }
    /**
     * Proceso completo: limpia, tokeniza, remueve stopwords y aplica stemming
     */
    process(text) {
        const tokens = this.tokenize(text);
        const withoutStopwords = this.removeStopWords(tokens);
        return this.stemWords(withoutStopwords);
    }
    /**
     * Obtiene n-gramas (secuencias de n palabras)
     */
    getNGrams(text, n = 2) {
        const tokens = this.tokenize(text);
        const ngrams = [];
        for (let i = 0; i <= tokens.length - n; i++) {
            ngrams.push(tokens.slice(i, i + n).join(' '));
        }
        return ngrams;
    }
    /**
     * Calcula la frecuencia de términos
     */
    getTermFrequency(text) {
        const tokens = this.process(text);
        const frequency = new Map();
        tokens.forEach((token) => {
            frequency.set(token, (frequency.get(token) || 0) + 1);
        });
        return frequency;
    }
}
exports.TextProcessor = TextProcessor;
//# sourceMappingURL=TextProcessor.js.map