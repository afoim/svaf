import { forumRequest } from './client';
import { forumEnv } from '../stores/env';
import { forumAuth } from '../stores/auth';
import { get } from 'svelte/store';

export interface DrawWorkflow {
	path: string;
	modified?: number;
	size?: number;
	thumbnail?: string;
}

export interface DrawWorkflowDetail {
	path: string;
	summary?: { node_count: number; link_count: number; group_count: number };
	thumbnail?: string;
	default_width?: number;
	default_height?: number;
	builtin_prompt?: string;
	loras?: string[];
	lora_link?: string;
	error?: string;
}

export interface DrawOutputItem {
	path: string;
	mtime?: number;
}

const DRAW_BACKEND = 'https://d.2x.nz';

export async function getDrawWorkflows(): Promise<DrawWorkflow[]> {
	const r = await fetch(`${DRAW_BACKEND}/api/workflows`);
	if (!r.ok) throw new Error(`HTTP ${r.status}`);
	const data = await r.json();
	return data.workflows || [];
}

export async function getDrawWorkflowCurrent(path: string): Promise<DrawWorkflowDetail> {
	const r = await fetch(`${DRAW_BACKEND}/api/workflows/current?path=${encodeURIComponent(path)}`);
	if (!r.ok) throw new Error(`HTTP ${r.status}`);
	return r.json();
}

export async function getDrawOutputList(limit = 50, offset = 0) {
	const r = await fetch(`${DRAW_BACKEND}/api/output/list?limit=${limit}&offset=${offset}`);
	if (!r.ok) throw new Error(`HTTP ${r.status}`);
	return r.json();
}

export function getDrawImageUrl(filename: string, subfolder = '', type = 'output'): string {
	const params = new URLSearchParams({ filename, subfolder, type });
	return `${DRAW_BACKEND}/api/image?${params}`;
}

export function getDrawOutputFileUrl(path: string, full = false): string {
	const params = new URLSearchParams({ path });
	if (full) params.set('full', '1');
	return `${DRAW_BACKEND}/api/output/file?${params}`;
}

export function getDrawThumbnailUrl(path: string): string {
	return `${DRAW_BACKEND}/api/thumbnail?path=${encodeURIComponent(path)}`;
}

export async function getDrawOutputCreator(path: string): Promise<{ creator_ip?: string; creator_name?: string }> {
	const r = await fetch(`${DRAW_BACKEND}/api/output/creator?path=${encodeURIComponent(path)}`);
	if (!r.ok) return {};
	return r.json();
}

export async function forkDrawOutput(path: string) {
	return forumRequest<{
		workflow: unknown;
		format: string;
		summary: { node_count: number; link_count: number; group_count: number };
		default_width?: number;
		default_height?: number;
		builtin_prompt?: string;
		loras?: string[];
		source_image?: string;
	}>('/api/draw/api/output/fork', {
		requiresAuth: true,
		method: 'POST',
		json: { path },
	});
}

export async function interruptDraw() {
	return forumRequest<{ ok: boolean }>('/api/draw/api/interrupt', {
		requiresAuth: true,
		method: 'POST',
		json: {},
	});
}

export async function getDrawWsTicket(endpoint: 'run' | 'status'): Promise<{ url: string }> {
	return forumRequest<{ url: string }>('/api/draw/ws/ticket', {
		requiresAuth: true,
		method: 'POST',
		json: { endpoint },
	});
}

export async function createDrawWebSocket(endpoint: 'run' | 'status'): Promise<WebSocket> {
	const ticket = await getDrawWsTicket(endpoint);
	return new WebSocket(ticket.url);
}
