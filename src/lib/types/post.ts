export interface PostMetadata {
	title: string;
	image: string;
	published: string;
	pinned: boolean;
	description: string;
	draft?: boolean;
	updated?: string;
}

export interface Post {
	slug: string;
	metadata: PostMetadata;
	content: string;
}
