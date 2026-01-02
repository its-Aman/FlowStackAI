import { Flow } from "../types";

// This key would be your API endpoint base URL in a real app
const STORAGE_KEY = 'flowstack_flows';

// Helper to simulate network delay (remove this when connecting to real backend)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const flowService = {
  // GET /api/flows
  getAll: async (): Promise<Flow[]> => {
    await delay(300); // Simulate network latency
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // GET /api/flows/:id
  getById: async (id: string): Promise<Flow | undefined> => {
    await delay(200);
    const flows = await flowService.getAll();
    return flows.find(f => f.id === id);
  },

  // POST /api/flows
  create: async (flow: Flow): Promise<Flow> => {
    await delay(400);
    const flows = await flowService.getAll();
    const newFlows = [flow, ...flows];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlows));
    return flow;
  },

  // PUT /api/flows/:id
  update: async (flow: Flow): Promise<Flow> => {
    await delay(400);
    const flows = await flowService.getAll();
    const newFlows = flows.map(f => f.id === flow.id ? flow : f);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlows));
    return flow;
  },

  // DELETE /api/flows/:id
  delete: async (id: string): Promise<void> => {
    await delay(300);
    const flows = await flowService.getAll();
    const newFlows = flows.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlows));
  }
};
