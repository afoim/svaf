import imageCompression, { type Options } from 'browser-image-compression';

export const POST_IMAGE_MAX_BYTES: number = 500 * 1024;
const POST_IMAGE_MAX_SIZE_MB = POST_IMAGE_MAX_BYTES / 1024 / 1024;
const POST_IMAGE_MAX_WIDTH_OR_HEIGHT = 1600;

const AVATAR_IMAGE_MAX_BYTES = 200 * 1024;
const AVATAR_IMAGE_MAX_SIZE_MB = AVATAR_IMAGE_MAX_BYTES / 1024 / 1024;
const AVATAR_IMAGE_MAX_WIDTH_OR_HEIGHT = 512;

function normalizeCompressedFile(originalFile: File, compressedFile: File): File {
	if (compressedFile.size >= originalFile.size) return originalFile;
	return compressedFile;
}

async function compressImage(file: File, options: Options): Promise<File> {
	const compressedFile = await imageCompression(file, {
		useWebWorker: true,
		maxIteration: 10,
		initialQuality: 0.8,
		...options
	});
	return normalizeCompressedFile(file, compressedFile);
}

export function isPostImageWithinLimit(file: File): boolean {
	return file.size <= POST_IMAGE_MAX_BYTES;
}

export function isAvatarImageWithinLimit(file: File): boolean {
	return file.size <= AVATAR_IMAGE_MAX_BYTES;
}

export function compressPostImage(file: File): Promise<File> {
	return compressImage(file, {
		maxSizeMB: POST_IMAGE_MAX_SIZE_MB,
		maxWidthOrHeight: POST_IMAGE_MAX_WIDTH_OR_HEIGHT,
		fileType: file.type,
		initialQuality: 0.82
	});
}

export function compressAvatarImage(file: File): Promise<File> {
	return compressImage(file, {
		maxSizeMB: AVATAR_IMAGE_MAX_SIZE_MB,
		maxWidthOrHeight: AVATAR_IMAGE_MAX_WIDTH_OR_HEIGHT,
		fileType: file.type,
		initialQuality: 0.78
	});
}
