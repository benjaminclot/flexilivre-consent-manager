"use strict";

module.exports = {
  preReleaseBase: 1,
  hooks: {
    "after:bump": ["npm run build"],
    "before:git:release": "git tag -d {version} && git add -f dist/",
  },
  git: {
    commitMessage: "chore(release): ${version}",
    getLatestTagFromAllRefs: true,
    pushRepo: "git@github.com:benjaminclot/flexilivre-consent-manager.git",
    requireBranch: "main",
    requireCleanWorkingDir: true,
    commit: true,
    tag: true,
    tagName: "${version}",
    tagAnnotation: "Release: ${version}",
    // tagArgs: [ "-f" ],
    push: false,
  },
  github: {
    release: false,
  },
  npm: {
    publish: false,
  },
};