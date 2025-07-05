import { createClient } from '@deepgram/sdk';
// Note: Using custom ElevenLabs implementation until official SDK is available
import axios from 'axios';

// Types for speech processing
export interface SpeechProcessingConfig {
  deepgramApiKey?: string;
  elevenlabsApiKey?: string;
  language?: string;
  voiceId?: string;
  sampleRate?: number;
  encoding?: string;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  channel?: number;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

export interface SpeechSynthesisOptions {
  voiceId?: string;
  modelId?: string;
  voiceSettings?: {
    stability?: number;
    similarityBoost?: number;
  };
  outputFormat?: 'mp3_22050_32' | 'mp3_44100_32' | 'pcm_16000' | 'pcm_22050' | 'pcm_44100';
}

export interface AudioProcessingResult {
  audioBuffer: ArrayBuffer;
  mimeType: string;
  duration?: number;
  size: number;
}

export class SpeechProcessingEngine {
  private deepgramClient: any;
  private elevenlabsApiKey: string | null = null;
  private config: SpeechProcessingConfig;
  private isInitialized: boolean = false;

  constructor(config: SpeechProcessingConfig = {}) {
    this.config = {
      language: 'en-US',
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella voice - friendly and professional
      sampleRate: 16000,
      encoding: 'linear16',
      ...config
    };
    this.initializeClients();
  }

  private initializeClients(): void {
    try {
      // Initialize Deepgram for speech-to-text
      if (this.config.deepgramApiKey) {
        this.deepgramClient = createClient(this.config.deepgramApiKey);
      } else {
        // Development mode - use mock client
        this.deepgramClient = this.createMockDeepgramClient();
      }

      // Initialize ElevenLabs for text-to-speech
      this.elevenlabsApiKey = this.config.elevenlabsApiKey || null;

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize speech processing clients:', error);
      this.isInitialized = false;
    }
  }

  private createMockDeepgramClient() {
    return {
      listen: {
        prerecorded: {
          transcribeFile: async () => ({
            result: {
              channels: [{
                alternatives: [{
                  transcript: "Hello, I'd like to schedule an appointment for next Tuesday.",
                  confidence: 0.98,
                  words: [
                    { word: "Hello", start: 0.0, end: 0.5, confidence: 0.99 },
                    { word: "I'd", start: 0.6, end: 0.8, confidence: 0.95 },
                    { word: "like", start: 0.9, end: 1.1, confidence: 0.98 }
                  ]
                }]
              }]
            }
          })
        },
        live: {
          transcribe: async () => ({
            on: () => {},
            send: () => {},
            finish: () => {}
          })
        }
      }
    };
  }

  private async elevenLabsApiCall(endpoint: string, data: any): Promise<any> {
    if (!this.elevenlabsApiKey) {
      // Return mock data for development
      if (endpoint.includes('text-to-speech')) {
        return { arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)) };
      }
      if (endpoint.includes('voices')) {
        return {
          voices: [
            { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'premade' },
            { voice_id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', category: 'premade' }
          ]
        };
      }
    }

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/${endpoint}`,
        data,
        {
          headers: {
            'xi-api-key': this.elevenlabsApiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('ElevenLabs API call failed:', error);
      throw error;
    }
  }

  // Real-time speech-to-text for live conversations
  async startLiveTranscription(audioStream: MediaStream): Promise<TranscriptionResult[]> {
    if (!this.isInitialized) {
      throw new Error('Speech processing engine not initialized');
    }

    const transcriptionResults: TranscriptionResult[] = [];

    try {
      const liveTranscriber = await this.deepgramClient.listen.live.transcribe({
        model: 'nova-2',
        language: this.config.language,
        smart_format: true,
        interim_results: true,
        utterance_end_ms: 1000,
        vad_events: true,
        encoding: this.config.encoding,
        sample_rate: this.config.sampleRate,
        channels: 1,
        numerals: true,
        punctuate: true,
        profanity_filter: false,
        redact: false,
        diarize: false,
        alternatives: 3,
        tier: 'enhanced'
      });

      liveTranscriber.on('transcript', (data: any) => {
        const channel = data.channel;
        const alternatives = channel.alternatives;
        
        if (alternatives && alternatives.length > 0) {
          const primary = alternatives[0];
          
          if (primary.transcript && primary.transcript.trim()) {
            const result: TranscriptionResult = {
              text: primary.transcript,
              confidence: primary.confidence,
              words: primary.words,
              channel: data.channel_index,
              alternatives: alternatives.slice(1).map((alt: any) => ({
                transcript: alt.transcript,
                confidence: alt.confidence
              }))
            };
            
            transcriptionResults.push(result);
          }
        }
      });

      liveTranscriber.on('error', (error: any) => {
        console.error('Live transcription error:', error);
      });

      // Connect audio stream to transcriber
      if (audioStream) {
        const recorder = new MediaRecorder(audioStream);
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            liveTranscriber.send(event.data);
          }
        };
        recorder.start(250); // Send data every 250ms
      }

      return transcriptionResults;
    } catch (error) {
      console.error('Live transcription setup failed:', error);
      throw error;
    }
  }

  // Transcribe pre-recorded audio files
  async transcribeAudio(audioBuffer: ArrayBuffer, mimeType: string): Promise<TranscriptionResult> {
    if (!this.isInitialized) {
      throw new Error('Speech processing engine not initialized');
    }

    try {
      const response = await this.deepgramClient.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: 'nova-2',
          language: this.config.language,
          smart_format: true,
          punctuate: true,
          numerals: true,
          profanity_filter: false,
          redact: false,
          diarize: false,
          alternatives: 3,
          tier: 'enhanced',
          keywords: ['appointment', 'schedule', 'booking', 'service', 'quote', 'estimate'],
          keyword_boost: 'medium'
        }
      );

      const channel = response.result.channels[0];
      const alternatives = channel.alternatives;

      if (alternatives && alternatives.length > 0) {
        const primary = alternatives[0];
        return {
          text: primary.transcript,
          confidence: primary.confidence,
          words: primary.words,
          alternatives: alternatives.slice(1).map((alt: any) => ({
            transcript: alt.transcript,
            confidence: alt.confidence
          }))
        };
      }

      throw new Error('No transcription alternatives found');
    } catch (error) {
      console.error('Audio transcription failed:', error);
      throw error;
    }
  }

  // Convert text to speech with natural voice
  async synthesizeSpeech(text: string, options: SpeechSynthesisOptions = {}): Promise<AudioProcessingResult> {
    if (!this.isInitialized) {
      throw new Error('Speech synthesis not available');
    }

    const synthesisOptions = {
      voiceId: options.voiceId || this.config.voiceId,
      modelId: options.modelId || 'eleven_multilingual_v2',
      voiceSettings: {
        stability: options.voiceSettings?.stability || 0.71,
        similarity_boost: options.voiceSettings?.similarityBoost || 0.76,
      },
      output_format: options.outputFormat || 'mp3_22050_32',
    };

    try {
      const audioResponse = await this.elevenLabsApiCall(
        `text-to-speech/${synthesisOptions.voiceId}`,
        {
          text: text,
          model_id: synthesisOptions.modelId,
          voice_settings: synthesisOptions.voiceSettings,
          output_format: synthesisOptions.output_format
        }
      );

      const audioBuffer = await audioResponse.arrayBuffer();
      
      return {
        audioBuffer,
        mimeType: 'audio/mpeg',
        size: audioBuffer.byteLength
      };
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      throw error;
    }
  }

  // Get available voices for text-to-speech
  async getAvailableVoices(): Promise<Array<{ id: string; name: string; category: string }>> {
    try {
      const response = await this.elevenLabsApiCall('voices', {});
      return response.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category
      }));
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      return [
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'premade' },
        { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', category: 'premade' }
      ];
    }
  }

  // Process audio for quality and format
  async processAudioForCalls(audioBuffer: ArrayBuffer, targetFormat: 'wav' | 'mp3' | 'pcm' = 'wav'): Promise<AudioProcessingResult> {
    try {
      // In a real implementation, you'd use Web Audio API or similar
      // For now, return the buffer as-is with proper metadata
      return {
        audioBuffer,
        mimeType: targetFormat === 'wav' ? 'audio/wav' : 'audio/mpeg',
        size: audioBuffer.byteLength
      };
    } catch (error) {
      console.error('Audio processing failed:', error);
      throw error;
    }
  }

  // Clean up resources
  dispose(): void {
    this.isInitialized = false;
    this.deepgramClient = null;
    this.elevenlabsApiKey = null;
  }
}

// Utility functions for speech processing
export const speechProcessingUtils = {
  // Detect speech activity in audio
  detectSpeechActivity(audioBuffer: ArrayBuffer): boolean {
    // Simple voice activity detection based on audio level
    const audioData = new Float32Array(audioBuffer);
    const rms = Math.sqrt(audioData.reduce((sum, sample) => sum + sample * sample, 0) / audioData.length);
    return rms > 0.01; // Threshold for speech detection
  },

  // Calculate audio duration from buffer
  calculateAudioDuration(audioBuffer: ArrayBuffer, sampleRate: number = 16000): number {
    const audioData = new Float32Array(audioBuffer);
    return audioData.length / sampleRate;
  },

  // Normalize audio levels
  normalizeAudioLevels(audioBuffer: ArrayBuffer): ArrayBuffer {
    const audioData = new Float32Array(audioBuffer);
    const max = Math.max(...audioData.map(Math.abs));
    
    if (max > 0) {
      const normalizedData = audioData.map(sample => sample / max * 0.95);
      return normalizedData.buffer;
    }
    
    return audioBuffer;
  },

  // Extract audio features for analysis
  extractAudioFeatures(audioBuffer: ArrayBuffer): {
    duration: number;
    averageLevel: number;
    peakLevel: number;
    silenceRatio: number;
  } {
    const audioData = new Float32Array(audioBuffer);
    const duration = this.calculateAudioDuration(audioBuffer);
    
    const levels = audioData.map(Math.abs);
    const averageLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const peakLevel = Math.max(...levels);
    const silenceThreshold = 0.01;
    const silentSamples = levels.filter(level => level < silenceThreshold).length;
    const silenceRatio = silentSamples / levels.length;
    
    return {
      duration,
      averageLevel,
      peakLevel,
      silenceRatio
    };
  }
};

// Factory function for creating speech processing engine
export function createSpeechProcessingEngine(config?: SpeechProcessingConfig): SpeechProcessingEngine {
  return new SpeechProcessingEngine(config);
}

// Export default instance for easy use
export const speechProcessor = createSpeechProcessingEngine({
  deepgramApiKey: process.env.DEEPGRAM_API_KEY,
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
  language: 'en-US',
  voiceId: 'EXAVITQu4vr4xnSDxMaL' // Bella - professional and friendly
});