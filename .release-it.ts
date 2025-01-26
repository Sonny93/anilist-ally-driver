import type { Config } from 'release-it';

export default {
	hooks: {
		'before:init': ['pnpm lint'],
	},
	git: {
		commitMessage: 'chore: release v${version}',
		commit: true,
		tag: true,
		push: true,
	},
	github: {
		release: true,
		releaseName: 'Release ${version}',
		autoGenerate: true,
	},
	npm: {
		publish: false, // We'll use the Github action to publish the package
	},
} satisfies Config;
