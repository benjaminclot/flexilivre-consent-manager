"use strict";

module.exports = {
  preReleaseBase: 1,
  hooks: {
    "before:bump": "if [ $(git tag -l '${version}') ]; then git tag -d ${version} && git push --delete origin ${version}; fi",
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