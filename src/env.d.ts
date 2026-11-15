interface ImportMetaEnv {
	/** "true" on branch preview builds: shows drafts, adds a banner, sets noindex. */
	readonly PUBLIC_PREVIEW?: string;
	/** Branch name shown in the preview banner. */
	readonly PUBLIC_BRANCH?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
