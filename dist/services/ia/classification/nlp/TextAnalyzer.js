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
exports.TextAnalyzer = void 0;
const TextProcessor_1 = require("./TextProcessor");
const natural = __importStar(require("natural"));
/**
 * Analiza texto para extraer información relevante
 * Utiliza NLP básico sin APIs externas
 */
class TextAnalyzer {
    constructor() {
        this.textProcessor = new TextProcessor_1.TextProcessor();
        this.tokenizer = new natural.WordTokenizer();
        this.tfidf = new natural.TfIdf();
    }
    /**
     * Analizar sentimiento del texto (básico)
     * Detecta si el tono es urgente, neutral o informativo
     */
    analyzeSentiment(text) {
        const cleanText = text.toLowerCase();
        // Palabras que indican urgencia
        const urgentWords = [
            'urgente', 'inmediato', 'crítico', 'emergencia', 'bloqueado',
            'cuanto antes', 'lo antes posible', 'ahora', 'ya', 'rápido',
            'importante', 'prioridad', 'necesario', 'fundamental'
        ];
        // Palabras que indican información/consulta
        const informativeWords = [
            'pregunta', 'consulta', 'duda', 'información', 'cómo',
            'cuándo', 'dónde', 'qué', 'por qué', 'para qué',
            'quisiera saber', 'me gustaría', 'podrían', 'ayuda'
        ];
        let urgentScore = 0;
        let informativeScore = 0;
        // Contar palabras urgentes
        urgentWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = cleanText.match(regex);
            if (matches) {
                urgentScore += matches.length;
            }
        });
        // Contar palabras informativas
        informativeWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = cleanText.match(regex);
            if (matches) {
                informativeScore += matches.length;
            }
        });
        // Determinar sentimiento
        if (urgentScore > informativeScore && urgentScore > 0) {
            return {
                sentiment: 'urgente',
                score: Math.min(urgentScore / 3, 1), // Normalizar a 0-1
            };
        }
        else if (informativeScore > urgentScore && informativeScore > 0) {
            return {
                sentiment: 'informativo',
                score: Math.min(informativeScore / 3, 1),
            };
        }
        else {
            return {
                sentiment: 'neutral',
                score: 0.5,
            };
        }
    }
    /**
     * Detectar entidades nombradas (básico)
     * Extrae nombres de sistemas, aplicaciones, etc.
     */
    extractEntities(text) {
        const cleanText = text.toLowerCase();
        const entities = {
            systems: [],
            applications: [],
            hardware: [],
            general: [],
        };
        // Sistemas conocidos
        const systems = [
            'sap', 'oracle', 'salesforce', 'dynamics', 'erp', 'crm',
            'active directory', 'ad', 'ldap', 'servidor', 'base de datos',
            'mysql', 'postgresql', 'sql server', 'mongodb'
        ];
        // Aplicaciones comunes
        const applications = [
            'excel', 'word', 'powerpoint', 'outlook', 'teams', 'zoom',
            'slack', 'chrome', 'firefox', 'edge', 'photoshop', 'autocad',
            'google sheets', 'google drive', 'onedrive', 'dropbox'
        ];
        // Hardware
        const hardware = [
            'computadora', 'laptop', 'pc', 'mouse', 'teclado', 'monitor',
            'impresora', 'escáner', 'teléfono', 'celular', 'tablet',
            'cámara', 'micrófono', 'audífonos', 'disco duro', 'usb'
        ];
        // Buscar sistemas
        systems.forEach(system => {
            if (cleanText.includes(system)) {
                entities.systems.push(system);
            }
        });
        // Buscar aplicaciones
        applications.forEach(app => {
            if (cleanText.includes(app)) {
                entities.applications.push(app);
            }
        });
        // Buscar hardware
        hardware.forEach(hw => {
            if (cleanText.includes(hw)) {
                entities.hardware.push(hw);
            }
        });
        return entities;
    }
    /**
     * Calcular similitud entre dos textos usando Cosine Similarity
     */
    calculateSimilarity(text1, text2) {
        // Procesar textos
        const tokens1 = this.textProcessor.tokenize(text1);
        const tokens2 = this.textProcessor.tokenize(text2);
        // Crear vectores de frecuencia
        const allTokens = [...new Set([...tokens1, ...tokens2])];
        const vector1 = [];
        const vector2 = [];
        allTokens.forEach(token => {
            vector1.push(tokens1.filter(t => t === token).length);
            vector2.push(tokens2.filter(t => t === token).length);
        });
        // Calcular cosine similarity
        const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
        const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
        if (magnitude1 === 0 || magnitude2 === 0) {
            return 0;
        }
        return dotProduct / (magnitude1 * magnitude2);
    }
    /**
     * Extraer frases importantes del texto
     */
    extractKeyPhrases(text, maxPhrases = 5) {
        const sentences = text.split(/[.!?]\s+/);
        const phrases = [];
        sentences.forEach(sentence => {
            if (sentence.length < 10)
                return; // Ignorar frases muy cortas
            const tokens = this.textProcessor.tokenize(sentence);
            // Calcular score basado en:
            // 1. Longitud (frases medianas son mejores)
            // 2. Presencia de palabras clave importantes
            let score = 0;
            // Longitud óptima: 5-15 palabras
            if (tokens.length >= 5 && tokens.length <= 15) {
                score += 2;
            }
            else if (tokens.length > 15) {
                score += 1;
            }
            // Palabras clave que aumentan relevancia
            const importantWords = [
                'error', 'problema', 'falla', 'no funciona', 'necesito',
                'urgente', 'importante', 'solicito', 'requiero', 'ayuda'
            ];
            importantWords.forEach(word => {
                if (sentence.toLowerCase().includes(word)) {
                    score += 3;
                }
            });
            phrases.push({
                phrase: sentence.trim(),
                score,
            });
        });
        // Ordenar por score y retornar las mejores
        return phrases
            .sort((a, b) => b.score - a.score)
            .slice(0, maxPhrases)
            .map(p => p.phrase);
    }
    /**
     * Detectar el idioma del texto (básico: solo español/inglés)
     */
    detectLanguage(text) {
        const cleanText = text.toLowerCase();
        // Palabras comunes en español
        const spanishWords = [
            'el', 'la', 'los', 'las', 'de', 'del', 'que', 'en', 'un', 'una',
            'por', 'para', 'con', 'no', 'es', 'su', 'al', 'lo', 'como', 'pero'
        ];
        // Palabras comunes en inglés
        const englishWords = [
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
        ];
        let spanishScore = 0;
        let englishScore = 0;
        spanishWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            const matches = cleanText.match(regex);
            if (matches) {
                spanishScore += matches.length;
            }
        });
        englishWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            const matches = cleanText.match(regex);
            if (matches) {
                englishScore += matches.length;
            }
        });
        if (spanishScore > englishScore && spanishScore > 5) {
            return 'es';
        }
        else if (englishScore > spanishScore && englishScore > 5) {
            return 'en';
        }
        else {
            return 'unknown';
        }
    }
    /**
     * Calcular densidad de palabras clave
     * Útil para determinar qué tan relevante es un texto para un tema
     */
    calculateKeywordDensity(text, keywords) {
        const cleanText = text.toLowerCase();
        const tokens = this.textProcessor.tokenize(cleanText);
        if (tokens.length === 0)
            return 0;
        let keywordCount = 0;
        keywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            keywordCount += tokens.filter(token => token === keywordLower).length;
        });
        return (keywordCount / tokens.length) * 100; // Porcentaje
    }
    /**
     * Análisis completo del texto
     */
    analyzeText(text) {
        const sentiment = this.analyzeSentiment(text);
        const entities = this.extractEntities(text);
        const keyPhrases = this.extractKeyPhrases(text);
        const language = this.detectLanguage(text);
        const tokens = this.textProcessor.tokenize(text);
        const sentences = text.split(/[.!?]\s+/).filter(s => s.length > 0);
        return {
            sentiment,
            entities,
            keyPhrases,
            language,
            wordCount: tokens.length,
            sentenceCount: sentences.length,
        };
    }
}
exports.TextAnalyzer = TextAnalyzer;
//# sourceMappingURL=TextAnalyzer.js.map