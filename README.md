### Anilist Ally Driver

To use this package, use the following command in your Adonis V6 project:
```shell
node ace configure sonny93/anilist-ally-driver
```

### Creating a new release

To create a new release, you can use the Github interface or do it from the command line.

To do this, add the following variable to your `GITHUB_TOKEN` terminal (this depends on your OS).

```shell
make release
# or (both commands do the same thing)
pnpm release
```

### Configuring the Github action

To allow the CI to publish the package on NPM, you need to add the following secret `NPM_TOKEN` to your repository.

To do this, read the section [Add a secret to your repository](#add-a-secret-to-your-repository)

### Add a secret to your repository

Go to [here](https://github.com/Sonny93/anilist-ally-driver/settings/secrets/actions) and click on ‘New repository secret’.
