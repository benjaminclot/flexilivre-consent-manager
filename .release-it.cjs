"use strict";

module.exports = {
  preReleaseBase: 1,
  hooks: {
    "after:bump": "npm run build",
    "before:git:release": "git add -f dist/",
  },
  git: {
    commitMessage: "Release: ${version}",
    getLatestTagFromAllRefs: true,
    pushRepo: "git@github.com:benjaminclot/flexilivre-consent-manager.git",
    requireBranch: "main",
    requireCleanWorkingDir: true,
    commit: true,
    commitArgs: [ "-S" ],
    tag: true,
    tagName: "${version}",
    tagAnnotation: "Release: ${version}",
    tagArgs: [ "-s" ],
  },
  github: {
    release: false,
  },
  npm: {
    publish: false,
  },
};