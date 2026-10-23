/**
 * Whisper API speech-to-text service
 * Submits audio payloads to OpenAI Whisper API for speech-to-text transcription.
 */

export interface WhisperTranscriptionOptions {
  apiKey?: string;
  language?: string;
  prompt?: string;
}

/**
 * Transcribes an audio Blob or File using OpenAI's Whisper API.
 * @param audioBlob The recorded audio blob (e.g. webm, mp3, mp4, wav)
 * @param options Optional configuration including apiKey, language, or prompt
 * @returns The transcribed text string
 */
export async function transcribeAudioWithWhisper(
  audioBlob: Blob,
  options?: WhisperTranscriptionOptions
): Promise<string> {
  const apiKey = options?.apiKey || import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OpenAI API key is missing. Set VITE_OPENAI_API_KEY in your .env file to enable Whisper transcription."
    );
  }

  const formData = new FormData();
  formData.append("file", audioBlob, "speech.webm");
  formData.append("model", "whisper-1");
  if (options?.language) {
    formData.append("language", options.language);
  }
  if (options?.prompt) {
    formData.append("prompt", options.prompt);
  }

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message ||
        `Whisper API request failed with status code ${response.status}`
    );
  }

  const data = await response.json();
  return data.text ? data.text.trim() : "";
}

/**
 * Helper to record audio from user's microphone with browser MediaRecorder.
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("MediaRecorder not initialized"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}
