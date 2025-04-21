import {axios} from '../utils/request'

interface SearchParams {
    query: string
    top_k?: number
    model?: string
}


export interface StreamSearchParams {
    query: string;
    top_k?: number;
    model?: string;
  }
  
  export const createSSEConnection = (
    params: StreamSearchParams,
    onMessage: (data: string) => void,
    onError?: (error: Event) => void
  ): () => void => {
    const abortController = new AbortController();
    
    // 使用 Fetch API
    fetch('http://127.0.0.1:5000/stream_output', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No readable stream received');
  
        const decoder = new TextDecoder();
        let buffer = '';
  
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
  
          buffer += decoder.decode(value, { stream: true });
          
          // 处理 SSE 格式（data: content\n\n）
          while (buffer.includes('\n\n')) {
            const eventEndIndex = buffer.indexOf('\n\n');
            const eventData = buffer.slice(0, eventEndIndex);
            buffer = buffer.slice(eventEndIndex + 2);
  
            // 解析事件内容
            const content = eventData.replace(/^data: /, '').trim();
            if (content === '[END]') break;
            
            onMessage(content);
          }
        }
        
        onMessage('[END]'); // 发送结束信号
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          onError?.(error);
        }
      });
  
    // 返回关闭函数
    return () => {
      abortController.abort();
    };
  };
  
export const baseSearch = (params: SearchParams) => {
    return axios.post('/search', params).then(res => res.data)
}

export const hybridSearch = (query: string, top_k = 5) => {
    return axios.post(`/search`, { query, top_k }).then(res => res.data)
}

export const getDocumentUrl = (name: string) => {
    return axios.get(`/document/${name}`).then(res => res.data)
}