# KeruLabs {{tag}}

## Release channel

This release is published from the `{{tag}}` Git tag. Tags containing a prerelease suffix such as `-beta.1` are treated as preview releases.

## Downloads

- Web: `kerulabs-web-{{tag}}.zip`
- macOS Apple Silicon: `KeruLabs-{{version}}-arm64.dmg` or `KeruLabs-{{version}}-arm64-mac.zip`
- Windows installer: `KeruLabs Setup {{version}}.exe`
- Windows portable: `KeruLabs {{version}}.exe`

## Install notes

- The Web bundle is the easiest way to try the app without installing desktop software.
- The macOS build is distributed as a signed and notarized Electron app.
- The Windows builds are currently unsigned, so Microsoft Defender SmartScreen may show a warning.

## Known constraints

- The Windows installer and portable builds are preview-quality unsigned builds.
- App data is stored locally in IndexedDB or Electron app data. Back up important data with JSON export before clearing browser or app storage.

## Changes

{{changelog}}
