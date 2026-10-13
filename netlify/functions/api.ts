export interface NetlifyEvent {
  path: string;
  httpMethod: string;
  headers: Record<string, string>;
  body: string | null;
}

export interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

let inMemoryStore: any = {
  users: [],
  clients: [],
  leads: [],
  works: [],
  services: [],
  reimbursements: [],
  attendance: [],
  siteVisits: [],
  employeeDocuments: [],
  materialRequests: [],
  companyProfile: null,
  festivals: [],
  notifications: [],
  tombstones: [],
  updatedAt: new Date().toISOString()
};

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '');
  const method = event.httpMethod;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (path === '/health' || path === '') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        service: 'KDPL Netlify API',
        timestamp: new Date().toISOString()
      })
    };
  }

  if (path === '/sync') {
    if (method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(inMemoryStore)
      };
    }
    if (method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        inMemoryStore = {
          ...inMemoryStore,
          ...body,
          updatedAt: new Date().toISOString()
        };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, updatedAt: inMemoryStore.updatedAt })
        };
      } catch (err: any) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid JSON payload' })
        };
      }
    }
  }

  if (path === '/storage/upload' && method === 'POST') {
    try {
      const { fileData, fileName } = JSON.parse(event.body || '{}');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ url: fileData, fileName: fileName || 'upload' })
      };
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Upload parsing error' })
      };
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Route not found' })
  };
};
