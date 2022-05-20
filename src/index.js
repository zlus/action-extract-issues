const core = require("@actions/core");
const { Octokit } = require("@octokit/rest");
const github = require("@actions/github");
const { dealStringToArr } = require("actions-util");
const octokit = new Octokit({ auth: `token ${process.env.GITHUB_TOKEN}` });
const context = github.context;

async function run() {
  try {
    const { owner, repo } = context.repo;
    let commits = [];
    const outEventErr = `This Action only support "push" ！`;
    if (context.eventName === "push") {
      commits = context.payload.commits;
    } else {
      core.setFailed(outEventErr);
      return;
    }

    const issues = [];

    commits.forEach((commit) => {
      let message = commit.message;
      const reg = new RegExp(core.getInput("match-reg"), "g");
      const result = message.matchAll(reg);
      for (const res of result) {
        if (res && res[1]) {
          const issueNumber = parseInt(res[1]);
          if (issueNumber && !issues.includes(issueNumber)) {
            issues.push(issueNumber);
          }
        }
      }
    });
    core.info(`All issues: [${issues}]`);
    core.setOutput("issues", issues);

    const addLabels = core.getInput("add-labels");
    const removeLabels = core.getInput("remove-labels");
    const addComment = core.getInput("add-comment");

    if (!addLabels && !removeLabels && !addComment) {
      return false;
    }
    const cathError = (error) => {
      const isFailOnError = core.getInput("fail-on-error");
      if(isFailOnError === 'true'){
        throw error
      }
    };
    for (let issue of issues) {
      if (addLabels) {
        try {
          await octokit.issues.addLabels({
            owner,
            repo,
            issue_number: issue,
            labels: dealStringToArr(addLabels),
          });
          core.info(`Success add labels: ${issue} [${addLabels}]`);
        } catch (error) {
          core.warning(`Failed add labels: ${issue} [${addLabels}]`);
          cathError(error);
        }
      }
      if (removeLabels) {
        const removeLabelsArr = dealStringToArr(removeLabels);
        for (const label of removeLabelsArr) {
          try {
            await octokit.issues.removeLabel({
              name: label,
              owner,
              repo,
              issue_number: issue,
            });
            core.info(`Success remove label: ${issue} [${label}]`);
          } catch (error) {
            core.warning(`Failed remove label: ${issue} [${label}]`);
            cathError(error);
          }
        }
      }
      if (addComment) {
        try {
          await octokit.issues.createComment({
            owner,
            repo,
            issue_number: issue,
            body: addComment,
          });
          core.info(`Success add comment: ${issue} [${addComment}]`);
        } catch (error) {
          core.warning(`Failed add comment: ${issue} [${addComment}]`);
          cathError(error);
        }
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
