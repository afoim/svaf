export interface FileItem {
	name: string;
	path: string;
	type: 'file' | 'directory';
	size?: number;
	mtime?: string;
	children?: FileItem[];
	downloadUrl?: string;
}

export function formatSize(bytes?: number): string {
	if (bytes === undefined) return '';
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getFileIcon(filename: string): string {
	const ext = filename.split('.').pop()?.toLowerCase();
	switch (ext) {
		case 'jpg':
		case 'jpeg':
		case 'png':
		case 'gif':
		case 'svg':
		case 'webp':
		case 'avif':
			return 'mdi:file-image-outline';
		case 'mp4':
		case 'webm':
		case 'mkv':
		case 'mov':
		case 'avi':
			return 'mdi:file-video-outline';
		case 'mp3':
		case 'wav':
		case 'flac':
		case 'ogg':
			return 'mdi:file-music-outline';
		case 'zip':
		case 'rar':
		case '7z':
		case 'tar':
		case 'gz':
		case 'zpaq':
			return 'mdi:folder-zip-outline';
		case 'pdf':
			return 'mdi:file-pdf-box';
		case 'doc':
		case 'docx':
			return 'mdi:file-word-outline';
		case 'xls':
		case 'xlsx':
			return 'mdi:file-excel-outline';
		case 'ppt':
		case 'pptx':
			return 'mdi:file-powerpoint-outline';
		case 'js':
		case 'ts':
		case 'html':
		case 'css':
		case 'py':
		case 'go':
		case 'json':
		case 'md':
			return 'mdi:file-code-outline';
		case 'exe':
		case 'msi':
		case 'iso':
			return 'mdi:application-cog-outline';
		case 'txt':
			return 'mdi:file-document-outline';
		default:
			return 'mdi:file-outline';
	}
}
