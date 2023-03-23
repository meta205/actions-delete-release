import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';

(async (): Promise<void> => {
  try {
    console.log(`>> process.env.GITHUB_REPOSITORY: ${process.env.GITHUB_REPOSITORY}`);
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    const owner: string = core.getInput('owner');
    const repo: string = core.getInput('repo');
    const releaseName: string = core.getInput('release-name');

    const releases = await octokit.repos.listReleases({
      owner,
      repo
    });

    const targetReleases = releases.data.filter(release => release.name == releaseName);

    for (const targetRelease of targetReleases) {
      console.log(`Removing release "${targetRelease.name}" and tag "${targetRelease.tag_name}"...`);
      await octokit.repos.deleteRelease({
        owner,
        repo,
        release_id: targetRelease.id
      });

      await octokit.git.deleteRef({ owner, repo, ref: `tags/${targetRelease.tag_name}` });
    }
  } catch (err: any) {
    core.setFailed(err.message);
  }
})();
