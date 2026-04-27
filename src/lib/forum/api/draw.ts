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

export async function getDrawWorkflows(): Promise<DrawWorkflow[]> {
	const data = await forumRequest<{ workflows: DrawWorkflow[] }>('/api/draw/api/workflows', {
		requiresAuth: true,
	});
	return data.workflows || [];
}

export async function getDrawWorkflowCurrent(path: string): Promise<DrawWorkflowDetail> {
	return forumRequest<DrawWorkflowDetail>('/api/draw/api/workflows/current', {
		requiresAuth: true,
		query: { path },
	});
}

export async function getDrawOutputList(limit = 50, offset = 0) {
	return forumRequest<{ items: DrawOutputItem[]; total: number; output_dir: string; exists: boolean }>(
		'/api/draw/api/output/list',
		{ requiresAuth: true, query: { limit, offset } }
	);
}

function drawUrl(path: string, params?: Record<string, string>): string {
	const baseUrl = get(forumEnv.baseUrl);
	const token = forumAuth.getToken();
	const allParams = { ...params };
	if (token) allParams.token = token;
	const qs = '?' + new URLSearchParams(allParams).toString();
	return `${baseUrl}${path}${qs}`;
}

export function getDrawImageUrl(filename: string, subfolder = '', type = 'output'): string {
	return drawUrl('/api/draw/api/image', { filename, subfolder, type });
}

export function getDrawOutputFileUrl(path: string, full = false): string {
	const params: Record<string, string> = { path };
	if (full) params.full = '1';
	return drawUrl('/api/draw/api/output/file', params);
}

export function getDrawThumbnailUrl(path: string): string {
	return drawUrl('/api/draw/api/thumbnail', { path });
}

export async function getDrawOutputCreator(path: string): Promise<{ creator_ip?: string; creator_name?: string }> {
	return forumRequest('/api/draw/api/output/creator', {
		requiresAuth: true,
		query: { path },
	});
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
