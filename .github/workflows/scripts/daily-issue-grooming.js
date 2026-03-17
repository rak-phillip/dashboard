const fs = require('fs');
const path = require('path');

module.exports = async function({ github, context, core, exec }) {
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const ghToken = process.env.GH_TOKEN;
  const workspaceDir = process.env.GITHUB_WORKSPACE;
  const scriptsDir = path.join(workspaceDir, '.github', 'workflows', 'scripts');

  function buildPrompt(title, body) {
    return fs.readFileSync(path.join(scriptsDir, 'grooming-prompt-initial.md'), 'utf8')
      .replace('{{TITLE}}', title)
      .replace('{{BODY}}', body);
  }

  function buildReviewPrompt(title, body, previousQuestions) {
    return fs.readFileSync(path.join(scriptsDir, 'grooming-prompt-review.md'), 'utf8')
      .replace('{{PREVIOUS_QUESTIONS}}', previousQuestions)
      .replace('{{TITLE}}', title)
      .replace('{{BODY}}', body);
  }

  async function runGhModels(prompt) {
    const cmd = 'gh';
    const args = [
      'models',
      'run',
      'openai/gpt-4.1',   // or whatever model ID is enabled for your repo
      prompt,
    ];

    const { exitCode, stdout, stderr } = await exec.getExecOutput(cmd, args, {
      env: { ...process.env, GH_TOKEN: ghToken },
    });

    if (stderr) {
      core.debug(`gh stderr: ${stderr}`);
    }
    if (exitCode !== 0) {
      throw new Error(`gh models run failed with exit code ${exitCode}`);
    }
    return stdout.trim();
  }

  const sinceISO = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  core.info(`Fetching issues since ${sinceISO}`);

  const issuesResp = await github.rest.issues.listForRepo({
    owner,
    repo,
    state: 'open',
    since: sinceISO,
    per_page: 100,
  });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const issues = issuesResp.data.filter((issue) => {
    if (issue.pull_request) return false;
    // Only process newly created issues
    if (new Date(issue.created_at) < since) return false;
    // Skip if already labeled by a previous grooming run
    const labelNames = (issue.labels || []).map((l) => l.name);
    if (labelNames.includes('groomed') || labelNames.includes('needs-info')) return false;
    return true;
  });
  core.info(`Found ${issues.length} issues to groom`);

  for (const issue of issues) {
    const number = issue.number;
    const title = issue.title || '';
    const body = issue.body || '';

    core.info(`Processing issue #${number}: ${title}`);

    const prompt = buildPrompt(title, body);
    const stdout = await runGhModels(prompt);
    core.debug(`Model raw output: ${stdout}`);

    let result;
    try {
      result = JSON.parse(stdout);
    } catch (err) {
      core.warning(
        `Failed to parse model output for issue #${number}: ${err.message}`,
      );
      continue;
    }

    const isGroomed = !!result.is_groomed;
    const analysis = result.analysis_markdown || '';
    const questions = result.questions_markdown || '';

    let commentBody;
    if (isGroomed) {
      commentBody = `### 🤖 Issue grooming analysis\n\n${analysis}\n\n_This analysis was generated automatically based on the repository's grooming checklist._`;
    } else {
      commentBody = `### 🤖 Issue grooming questions\n\n${questions}\n\n_This comment was generated automatically to help gather the information needed to groom this issue._`;
    }

    await github.rest.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: commentBody,
    });

    try {
      if (isGroomed) {
        await github.rest.issues.addLabels({
          owner,
          repo,
          issue_number: number,
          labels: ['groomed'],
        });
      } else {
        await github.rest.issues.addLabels({
          owner,
          repo,
          issue_number: number,
          labels: ['needs-info'],
        });
      }
    } catch (err) {
      core.warning(
        `Failed to add labels on issue #${number}: ${err.message}`,
      );
    }
  }

  const processedByQueueA = new Set(issues.map((i) => i.number));

  // --- Queue B: re-evaluate needs-info issues updated since last run ---
  const needsInfoResp = await github.rest.issues.listForRepo({
    owner,
    repo,
    state: 'open',
    labels: 'needs-info',
    since: sinceISO,
    per_page: 100,
  });

  const needsInfoIssues = needsInfoResp.data.filter((issue) => !issue.pull_request);
  core.info(`Found ${needsInfoIssues.length} needs-info issues to re-evaluate`);

  for (const issue of needsInfoIssues) {
    const number = issue.number;
    const title = issue.title || '';
    const body = issue.body || '';

    if (processedByQueueA.has(number)) {
      core.info(`Issue #${number}: just processed in Queue A this run, skipping`);
      continue;
    }

    // Fetch comments to find the last bot comment
    const commentsResp = await github.rest.issues.listComments({
      owner,
      repo,
      issue_number: number,
      per_page: 100,
    });

    const botComments = commentsResp.data.filter(
      (c) => c.user?.login === 'github-actions[bot]'
    );
    const lastBotComment = botComments[botComments.length - 1];

    // Skip if no meaningful user activity since the bot last commented.
    // Two conditions guard against false negatives:
    //   1. lastCommentIsBot  — no one replied after the bot
    //   2. buffer check      — absorbs GitHub's server-side timestamp lag (~seconds) and
    //                          the issue.updated_at bump from label changes the bot makes
    //                          immediately after commenting (still well within 30 min)
    const lastComment = commentsResp.data[commentsResp.data.length - 1];
    const lastCommentIsBot = lastComment?.user?.login === 'github-actions[bot]';
    const LABEL_BUMP_BUFFER_MS = 30 * 60 * 1000; // 30 minutes
    const issueUpdatedAt = new Date(issue.updated_at).getTime();
    const lastBotCommentedAt = lastBotComment ? new Date(lastBotComment.created_at).getTime() : 0;

    if (lastBotComment && lastCommentIsBot && issueUpdatedAt <= lastBotCommentedAt + LABEL_BUMP_BUFFER_MS) {
      core.info(`Issue #${number}: no new user activity since last bot comment, skipping`);
      continue;
    }

    core.info(`Re-evaluating issue #${number}: ${title}`);

    const previousQuestions = lastBotComment?.body || '(no previous bot comment found)';
    const prompt = buildReviewPrompt(title, body, previousQuestions);
    const stdout = await runGhModels(prompt);
    core.debug(`Model raw output for re-evaluation of #${number}: ${stdout}`);

    let result;
    try {
      result = JSON.parse(stdout);
    } catch (err) {
      core.warning(`Failed to parse model output for issue #${number}: ${err.message}`);
      continue;
    }

    const isGroomed = !!result.is_groomed;
    const analysis = result.analysis_markdown || '';
    const questions = result.questions_markdown || '';

    let commentBody;
    if (isGroomed) {
      commentBody = `### 🤖 Issue grooming analysis\n\n${analysis}\n\n_This analysis was generated automatically based on the repository's grooming checklist._`;
    } else {
      commentBody = `### 🤖 Issue grooming questions\n\n${questions}\n\n_This comment was generated automatically to help gather the information needed to groom this issue._`;
    }

    await github.rest.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: commentBody,
    });

    if (isGroomed) {
      try {
        await github.rest.issues.removeLabel({
          owner,
          repo,
          issue_number: number,
          name: 'needs-info',
        });
      } catch (err) {
        core.warning(`Failed to remove needs-info label on issue #${number}: ${err.message}`);
      }
      try {
        await github.rest.issues.addLabels({
          owner,
          repo,
          issue_number: number,
          labels: ['groomed'],
        });
      } catch (err) {
        core.warning(`Failed to add groomed label on issue #${number}: ${err.message}`);
      }
    }
    // If still not groomed, needs-info label already present — no label change needed
  }
};
