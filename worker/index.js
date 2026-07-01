// Cloudflare Worker - DashScope 任务轮询跨域代理

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const taskId = url.pathname.replace('/tasks/', '');

    if (!taskId || request.method !== 'GET') {
      return new Response('Not Found', { status: 404 });
    }

    const apiKey = DASHSCOPE_API_KEY;
    if (!apiKey) {
      return new Response('Server configuration error', { status: 500 });
    }

    const response = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  },
};
