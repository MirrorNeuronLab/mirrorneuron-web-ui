# Release Process

This repository releases from Git tags. The tag is the public source of truth for a release version.

## Versioning Policy

Use Semantic Versioning tags with a leading `v`:

- `vMAJOR.MINOR.PATCH` for stable releases
- `vMAJOR.MINOR.PATCH-rc.N` for release candidates
- `vMAJOR.MINOR.PATCH-beta.N` or `vMAJOR.MINOR.PATCH-alpha.N` for prereleases

Examples:

- `v1.0.1` = patch release
- `v1.1.0` = minor release
- `v2.0.0` = major release
- `v1.1.0-rc.1` = prerelease

CI build numbers are for internal artifacts only. Public releases use clean SemVer tags, not build-number versions such as `1.0.0-build123`.

## Create a Stable Release

Before creating a release, make sure `main` is clean and tests pass locally.

```bash
git checkout main
git pull
git tag v1.0.1
git push origin v1.0.1
```

Pushing the tag starts the release workflow. The workflow validates the tag, runs tests, builds the app, validates the npm package, creates a release ZIP, writes SHA256 checksums, creates a GitHub Release, uploads the assets, and publishes stable tags to npm when Trusted Publishing is configured.

## Create a Prerelease

```bash
git checkout main
git pull
git tag v1.0.1-rc.1
git push origin v1.0.1-rc.1
```

Prerelease tags create GitHub prereleases. Prerelease tags do not publish to npm by default.

## npm Package Versions

The npm package version is derived from the Git tag at release time. Stable tags such as `v1.0.1` publish package metadata as `1.0.1`, without the leading `v`.

Stable tags publish `mirrorneuron-web-ui` to npm by default. Prerelease tags publish to npm only if the repository variable `PUBLISH_PRERELEASES_TO_NPM` is set to `true`; prereleases use the `next` npm dist-tag.

## npm Trusted Publishing

npm publishing uses npm Trusted Publishing with GitHub OIDC. No `NPM_TOKEN` is required.

To enable npm publishing for stable tags:

1. In npm, configure a trusted publisher for package `mirrorneuron-web-ui`.
2. Set the GitHub repository to `MirrorNeuronLab/mn-web-ui`.
3. Set the workflow file to `.github/workflows/release.yml`.
4. Leave token-based secrets unset unless there is a deliberate reason to use them.

Stable tags publish to npm only after the build, tests, package validation, and GitHub Release succeed.
