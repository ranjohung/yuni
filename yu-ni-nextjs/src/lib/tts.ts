export class TTSClient {
  private apiKey: string;
  private region: string;

  constructor() {
    this.apiKey = process.env.AZURE_TTS_KEY || '';
    this.region = process.env.AZURE_TTS_REGION || 'eastus';
  }

  async synthesize(text: string, voiceType: string = 'zh-CN-XiaoxiaoNeural'): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('Azure TTS key not configured');
    }

    const response = await fetch(`https://${this.region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ssml+xml',
        'Ocp-Apim-Subscription-Key': this.apiKey,
        'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
      },
      body: this.buildSSML(text, voiceType),
    });

    if (!response.ok) {
      throw new Error(`TTS synthesis failed: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private buildSSML(text: string, voiceType: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">
  <voice name="${voiceType}">
    <mstts:express-as style="cheerful">
      ${text}
    </mstts:express-as>
  </voice>
</speak>`;
  }

  async getAvailableVoices(): Promise<Array<{ name: string; displayName: string; language: string }>> {
    if (!this.apiKey) {
      return [
        { name: 'zh-CN-XiaoxiaoNeural', displayName: '晓晓', language: '中文' },
        { name: 'zh-CN-YunxiNeural', displayName: '云希', language: '中文' },
        { name: 'zh-CN-YunyangNeural', displayName: '云扬', language: '中文' },
      ];
    }

    const response = await fetch(`https://${this.region}.tts.speech.microsoft.com/cognitiveservices/voices/list`, {
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      return [
        { name: 'zh-CN-XiaoxiaoNeural', displayName: '晓晓', language: '中文' },
        { name: 'zh-CN-YunxiNeural', displayName: '云希', language: '中文' },
        { name: 'zh-CN-YunyangNeural', displayName: '云扬', language: '中文' },
      ];
    }

    const voices = await response.json();
    return voices
      .filter((v: { Locale: string }) => v.Locale.startsWith('zh-CN'))
      .map((v: { Name: string; DisplayName: string; Locale: string }) => ({
        name: v.Name,
        displayName: v.DisplayName,
        language: '中文',
      }));
  }
}

export const ttsClient = new TTSClient();