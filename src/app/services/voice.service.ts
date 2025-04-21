import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize AudioContext when needed to avoid autoplay policy issues
  }

  /**
   * Converts base64 audio data to a playable format and plays it
   * @param base64Audio The base64 encoded audio data
   * @returns Promise that resolves when audio starts playing or rejects on error
   */
  public async playBase64Audio(base64Audio: string): Promise<void> {
    try {
      // Create AudioContext on first use (must be triggered by user interaction)
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      // Convert base64 to array buffer
      const audioData = this.base64ToArrayBuffer(base64Audio);
      
      // Decode the audio data
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      
      // Create audio source
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Connect to audio output
      source.connect(this.audioContext.destination);
      
      // Play the audio
      source.start(0);
      
      return new Promise<void>((resolve) => {
        source.onended = () => resolve();
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  /**
   * Converts base64 audio to a Blob URL that can be used in audio elements
   * @param base64Audio The base64 encoded audio data
   * @param mimeType The MIME type of the audio (default: 'audio/mp3')
   * @returns A URL that can be used in an audio element's src attribute
   */
  public base64ToAudioUrl(base64Audio: string, mimeType: string = 'audio/mp3'): string {
    try {
      // Remove data URL prefix if present
      const base64Data = base64Audio.replace(/^data:audio\/[a-z]+;base64,/, '');
      
      // Convert base64 to Blob
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: mimeType });
      
      // Create a URL for the Blob
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error converting base64 to audio URL:', error);
      throw error;
    }
  }

  /**
   * Saves base64 audio data as a file and triggers download
   * @param base64Audio The base64 encoded audio data
   * @param fileName The name for the downloaded file
   * @param mimeType The MIME type of the audio (default: 'audio/mp3')
   */
  public downloadBase64Audio(base64Audio: string, fileName: string = 'audio.mp3', mimeType: string = 'audio/mp3'): void {
    try {
      // Remove data URL prefix if present
      const base64Data = base64Audio.replace(/^data:audio\/[a-z]+;base64,/, '');
      
      // Create a proper binary blob from the base64 data
      let binaryData: Uint8Array;
      
      // Check if the string starts with a hex pattern (like fff384c4) which indicates MP3 data
      if (/^[0-9a-f]+$/i.test(base64Data.substring(0, 8))) {
        console.log('Detected hex-encoded audio data, converting to proper format for download');
        // Convert hex to binary
        binaryData = new Uint8Array(base64Data.length / 2);
        for (let i = 0; i < base64Data.length; i += 2) {
          binaryData[i / 2] = parseInt(base64Data.substring(i, i + 2), 16);
        }
      } else {
        // Standard base64 decoding
        const binaryString = window.atob(base64Data);
        binaryData = new Uint8Array(binaryString.length);
        
        // Convert to byte array
        for (let i = 0; i < binaryString.length; i++) {
          binaryData[i] = binaryString.charCodeAt(i);
        }
      }
      
      // Create a proper MP3 blob
      const blob = new Blob([binaryData], { type: mimeType });
      const audioUrl = URL.createObjectURL(blob);
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = audioUrl;
      downloadLink.download = fileName;
      
      // Append to body, click and remove
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the URL object
      setTimeout(() => {
        URL.revokeObjectURL(audioUrl);
      }, 100);
    } catch (error) {
      console.error('Error downloading audio:', error);
      throw error;
    }
  }

  /**
   * Helper method to convert base64 string to ArrayBuffer
   * @param base64 The base64 string to convert
   * @returns ArrayBuffer representation of the base64 data
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    // Remove data URL prefix if present
    const base64Data = base64.replace(/^data:audio\/[a-z]+;base64,/, '');
    
    // Check if the string starts with a hex pattern (like fff384c4) which indicates MP3 data
    // that's not properly base64 encoded
    if (/^[0-9a-f]+$/i.test(base64Data.substring(0, 8))) {
      console.log('Detected hex-encoded audio data, converting to proper format');
      // Convert hex to binary
      const bytes = new Uint8Array(base64Data.length / 2);
      for (let i = 0; i < base64Data.length; i += 2) {
        bytes[i / 2] = parseInt(base64Data.substring(i, i + 2), 16);
      }
      return bytes.buffer;
    }
    
    // Standard base64 decoding
    try {
      const binaryString = window.atob(base64Data);
      const length = binaryString.length;
      const bytes = new Uint8Array(length);
      
      // Convert to byte array
      for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return bytes.buffer;
    } catch (error) {
      console.error('Error decoding base64 data:', error);
      throw new Error('Invalid audio data format');
    }
  }
}