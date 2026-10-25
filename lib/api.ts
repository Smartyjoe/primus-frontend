/**
 * Primus Director Backend API Integration Service
 * Target API Base URL: http://localhost:3001/api/v1
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

// Default auth header for local dev (can be overridden with real JWT token)
function getHeaders(customHeaders: Record<string, string> = {}) {
  let token = typeof window !== 'undefined' ? localStorage.getItem('primus_auth_token') : null;
  
  if (!token && typeof window !== 'undefined') {
    // Automatically find Supabase session token in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        try {
          const item = JSON.parse(localStorage.getItem(key)!);
          token = item?.access_token;
          if (token) break;
        } catch {}
      }
    }
  }

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
    estimated_duration?: number;
    target_duration_seconds?: number;
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

  async triggerPipeline(projectId: string) {
    const res = await fetch(`${API_BASE_URL}/director/projects/${projectId}/trigger`, {
      method: 'POST',
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

  async generateStoryboard(data: { script: string; visualStyle?: string; aiVideoModel?: string; targetDurationSec?: number }) {
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
    console.info('[api.initPaystackPayment] payload:', data);
    const res = await fetch(`${API_BASE_URL}/payment/init`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: { authorization_url?: string; url?: string; access_code?: string; reference?: string } }>(res);
  },

  async verifyPaystackPayment(reference: string) {
    console.info('[api.verifyPaystackPayment] verifying reference:', reference);
    const res = await fetch(`${API_BASE_URL}/payment/verify/${reference}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ success: boolean; data: { status: string; reference: string; amount?: number } }>(res);
  },

  // ─── Wallet & Credits Ledger ────────────────────────────────────────────────
  async getWallet() {
    try {
      const res = await fetch(`${API_BASE_URL}/payment/wallet`, {
        headers: getHeaders(),
      });
      return await handleResponse<{ success: boolean; data: { userId: string; email: string; role: string; credits: number } }>(res);
    } catch (err: any) {
      console.error('[api.getWallet] Failed to fetch live wallet credits:', err);
      throw err;
    }
  },

  async getTransactions() {
    try {
      const res = await fetch(`${API_BASE_URL}/payment/transactions`, {
        headers: getHeaders(),
      });
      return await handleResponse<{ success: boolean; data: any[] }>(res);
    } catch (err: any) {
      console.error('[api.getTransactions] Failed to fetch credit transactions:', err);
      throw err;
    }
  },

  // ─── Shot Retry & Diagnostics ───────────────────────────────────────────────
  async retryShot(data: {
    projectId: string;
    shotId: string;
    prompt?: string;
    model?: string;
    aspect_ratio?: string;
  }) {
    console.info(`[api.retryShot] Triggering retry for shot ${data.shotId} in project ${data.projectId}`);
    try {
      // Re-queue video generation with veo-3.1-lite
      const res = await fetch(`${API_BASE_URL}/generation/video`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          projectId: data.projectId,
          shotId: data.shotId,
          prompt: data.prompt,
          model: data.model || 'veo-3.1-lite',
          aspect_ratio: data.aspect_ratio || '16:9',
        }),
      });
      return await handleResponse<{ success: boolean; data: { taskId: string; status: string; estimatedCost: number } }>(res);
    } catch (err: any) {
      console.error(`[api.retryShot] Retry failed for shot ${data.shotId}:`, err);
      throw err;
    }
  },
};

