interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  content: string;
  model: string;
}

export class LLMProxy {
  private deepseekApiKey: string;
  private ollamaBaseUrl: string;

  constructor() {
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || '';
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  async request(userId: string, messages: ChatMessage[]): Promise<ChatResponse> {
    const membershipType = await this.getUserMembership(userId);
    const config = this.getConfig(membershipType);

    try {
      return await this.callDeepSeek(messages, config);
    } catch {
      return await this.callOllama(messages, config);
    }
  }

  private async getUserMembership(userId: string): Promise<number> {
    const { prisma } = await import('./prisma');
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    return user?.membershipType || 0;
  }

  private getConfig(membershipType: number): { model: string; maxTokens: number; temperature: number } {
    const configs: Record<number, { model: string; maxTokens: number; temperature: number }> = {
      0: { model: 'deepseek-chat', maxTokens: 4096, temperature: 0.7 },
      1: { model: 'deepseek-chat', maxTokens: 8192, temperature: 0.8 },
      2: { model: 'deepseek-chat', maxTokens: 8192, temperature: 0.85 },
      3: { model: 'deepseek-chat', maxTokens: 16384, temperature: 0.9 },
    };
    return configs[membershipType] || configs[0];
  }

  private async callDeepSeek(messages: ChatMessage[], config: { model: string; maxTokens: number; temperature: number }): Promise<ChatResponse> {
    if (!this.deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        stream: false,
      }),
    });

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: config.model,
    };
  }

  private async callOllama(messages: ChatMessage[], config: { model: string; maxTokens: number; temperature: number }): Promise<ChatResponse> {
    const response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:14b',
        messages,
        options: {
          num_ctx: config.maxTokens,
          temperature: config.temperature,
        },
        stream: false,
      }),
    });

    const data = await response.json();
    return {
      content: data.message?.content || '',
      model: 'ollama-qwen2.5',
    };
  }

  async streamRequest(userId: string, messages: ChatMessage[]): Promise<ReadableStream> {
    const membershipType = await this.getUserMembership(userId);
    const config = this.getConfig(membershipType);

    try {
      return await this.streamDeepSeek(messages, config);
    } catch {
      return await this.streamOllama(messages, config);
    }
  }

  private async streamDeepSeek(messages: ChatMessage[], config: { model: string; maxTokens: number; temperature: number }): Promise<ReadableStream> {
    if (!this.deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        stream: true,
      }),
    });

    return response.body as ReadableStream;
  }

  private async streamOllama(messages: ChatMessage[], config: { model: string; maxTokens: number; temperature: number }): Promise<ReadableStream> {
    const response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:14b',
        messages,
        options: {
          num_ctx: config.maxTokens,
          temperature: config.temperature,
        },
        stream: true,
      }),
    });

    return response.body as ReadableStream;
  }
}

export const llmProxy = new LLMProxy();