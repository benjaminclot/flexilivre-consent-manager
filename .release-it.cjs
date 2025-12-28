"use strict";

module.exports = {
  preReleaseBase: 1,
  hooks: {
    "after:bump": ["npm run build"],
    "before:git:release": "git add -f dist/",
  },
  git: {
    commitMessage: "chore(release): ${version}",
    getLatestTagFromAllRefs: true,
    pushRepo: "git@github.com:benjaminclot/flexilivre-consent-manager.git",
    requireBranch: "main",
    requireCleanWorkingDir: true,
    commit: true,
    // commitArgs: [ "-S" ],
    tag: true,
    tagName: "${version}",
    tagAnnotation: "Release: ${version}",
    // tagArgs: [ "-s" ],
    push: true,
  },
  github: {
    release: false,
  },
  npm: {
    publish: false,
  },
};