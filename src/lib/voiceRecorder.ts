export interface VoiceRecorderOptions {
  onDataAvailable?: (blob: Blob) => void;
  onTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recognition: any = null;
  private isRecording = false;
  private options: VoiceRecorderOptions;

  constructor(options: VoiceRecorderOptions = {}) {
    this.options = options;
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'ru-RU';

      let finalTranscript = '';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (this.options.onTranscript) {
          this.options.onTranscript(finalTranscript + interimTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (this.options.onError) {
          this.options.onError(new Error(event.error));
        }
      };
    }
  }

  async startRecording(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        if (this.options.onDataAvailable) {
          this.options.onDataAvailable(audioBlob);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;

      if (this.recognition) {
        this.recognition.start();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  stopRecording(): void {
    if (!this.isRecording) {
      return;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.recognition) {
      this.recognition.stop();
    }

    this.isRecording = false;
  }

  getRecordingState(): boolean {
    return this.isRecording;
  }

  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  isSpeechRecognitionSupported(): boolean {
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }
}

export default VoiceRecorder;
