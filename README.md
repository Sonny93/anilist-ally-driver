## Getting Started

To use this package, use the following command in your Adonis V6 project:
```shell
node ace configure anilist-ally-driver
```

### Usage

In your `config/ally.ts`
```typescript
import env from '#start/env';
import { defineConfig } from '@adonisjs/ally';
import { AniListDriverService } from 'anilist-ally-driver/build/index.js';

const allyConfig = defineConfig({
  anilist: AniListDriverService({
    clientId: env.get('ANILIST_CLIENT_ID'),
    clientSecret: env.get('ANILIST_CLIENT_SECRET'),
    callbackUrl: 'http://localhost:3333/auth/anilist/callback',
  }),
});

export default allyConfig;

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
```

## How the repo works

### Creating a new release

To create a new release, we can use the Github interface or do it from the command line.

To do this, we'll need to add the following variable to our terminal : `GITHUB_TOKEN` (how? it depends on your OS).

```shell
make release
# or (both commands do the same thing)
pnpm release
```

### Configuring the Github action

To allow the CI to publish the package on NPM, we have to add the following secret `NPM_TOKEN` to this repository.

To do this, read the section [Add a secret to your repository](#add-a-secret-to-your-repository)

### Add a secret to your repository

Go to https://github.com/Sonny93/anilist-ally-driver/settings/secrets/actions and click on "New repository secret".
