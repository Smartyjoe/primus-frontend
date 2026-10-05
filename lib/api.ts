/**
 * Primus Director Backend API Integration Service
 * Target API Base URL: http://localhost:3001/api/v1
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

// Default auth header for local dev (can be overridden with real JWT token)
function getHeaders(customHeaders: Record<string, string> = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('primus_auth_token') : null;
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : 'Bearer dev-user-123',
    ...customHeaders,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = `HTTP error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.error || errorJson.message || errorMsg;
    } catch {
      // Body not JSON
    }
    throw new Error(errorMsg);
  }
  return response.json() as Promise<T>;
}

export const api = {
  // ─── Health Check ───────────────────────────────────────────────────────────
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<{ status: string; services: Record<string, boolean> }>(res);
  },

  // ─── Projects (Director API) ─────────────────────────────────────────────────
  async getProjects() {
    const res = await fetch(`${API_BASE_URL}/director/projects`, {
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean; data: any[] }>(res);
  },

  async createProject(projectData: {
    title: string;
    premise: string;
    purpose?: string;
    use_case?: string;
    visual_style?: string;
    ai_video_model?: string;
    aspect_ratio?: string;
    target_platform?: string;
    shot_duration?: number;
    target_duration?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/director/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(projectData),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async getProjectDetails(id: string) {
    const res = await fetch(`${API_BASE_URL}/director/projects/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async updateProject(id: string, updates: Record<string, any>) {
    const res = await fetch(`${API_BASE_URL}/director/projects/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async deleteProject(id: string) {
    const res = await fetch(`${API_BASE_URL}/director/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // ─── Shots & Director State ──────────────────────────────────────────────────
  async addShots(projectId: string, shots: any[]) {
    const res = await fetch(`${API_BASE_URL}/director/projects/${projectId}/shots`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ shots }),
    });
    return handleResponse<{ success: boolean; data: any[] }>(res);
  },

  async updateShot(shotId: string, updates: Record<string, any>) {
    const res = await fetch(`${API_BASE_URL}/director/shots/${shotId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async getDirectorState(projectId: string) {
    const res = await fetch(`${API_BASE_URL}/director/projects/${projectId}/state`, {
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async registerCharacterDna(projectId: string, data: { name: string; description?: string; dna_prompt: string; face_reference_url?: string }) {
    const res = await fetch(`${API_BASE_URL}/director/projects/${projectId}/characters`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async registerLocationDna(projectId: string, data: { name: string; description?: string; dna_prompt: string; reference_url?: string }) {
    const res = await fetch(`${API_BASE_URL}/director/projects/${projectId}/locations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  // ─── AI Planning (Script & Storyboard) ───────────────────────────────────────
  async generateScript(data: { premise: string; useCase: string; duration?: number; visualStyle?: string }) {
    const res = await fetch(`${API_BASE_URL}/ai/script`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async generateStoryboard(data: { script: string; visualStyle?: string; aiVideoModel?: string }) {
    const res = await fetch(`${API_BASE_URL}/ai/storyboard`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: { shots: any[]; reasoning?: string } }>(res);
  },

  // ─── Video & Image Generation ────────────────────────────────────────────────
  async queueVideoGeneration(data: {
    projectId: string;
    shotId?: string;
    prompt?: string;
    model: string;
    aspect_ratio?: string;
    resolution?: string;
    ref_images?: string[];
    mode_image?: 'frame' | 'ingredient';
    ref_history?: string; // for EXTEND shots
  }) {
    const res = await fetch(`${API_BASE_URL}/generation/video`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: { taskId: string; status: string; estimatedCost: number; isExtend?: boolean } }>(res);
  },

  async queueImageGeneration(data: { projectId: string; shotId?: string; prompt: string; model: string; aspect_ratio?: string }) {
    const res = await fetch(`${API_BASE_URL}/generation/image`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: { taskId: string; status: string; estimatedCost: number } }>(res);
  },

  async getShotStatus(shotId: string) {
    const res = await fetch(`${API_BASE_URL}/generation/shot/${shotId}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async getTaskStatus(taskId: string) {
    const res = await fetch(`${API_BASE_URL}/generation/task/${taskId}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  // ─── Paystack Payments ───────────────────────────────────────────────────────
  async initPaystackPayment(data: { email: string; amount: number; currency?: string; reference?: string; metadata?: any }) {
    const res = await fetch(`${API_BASE_URL}/payment/init`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: { authorization_url?: string; url?: string; access_code?: string; reference?: string } }>(res);
  },

  async verifyPaystackPayment(reference: string) {
    const res = await fetch(`${API_BASE_URL}/payment/verify/${reference}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean; data: { status: string; reference: string; amount?: number } }>(res);
  },
};
