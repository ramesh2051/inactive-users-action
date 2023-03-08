const util = require('../dateUtil');

module.exports = class PullRequestActivity {

  constructor(octokit) {
    if (!octokit) {
      throw new Error('An octokit client must be provided');
    }
    this._octokit = octokit;
  }

  getPullRequestActivityFrom(owner, repo, since) {
    const from = util.getFromDate(since)
      , repoFullName = `${owner}/${repo}`
    ;

    return this.octokit.paginate('GET /repos/:owner/:repo/pulls',
      {
        owner: owner,
        repo: repo,
        since: from,
        per_page: 100,
      }
    ).then(pullRequests => {
      const users = {};

      pullRequests.forEach(pullRequest => {
        if (pullRequest.user && pullRequest.user.login) {
          const login = pullRequest.user.login;

          if (!users[login]) {
            users[login] = 1;
          } else {
            users[login] = users[login] + 1;
          }
        }
      });

      const data = {}
      data[repoFullName] = users;
      return data;
    }).catch(err => {
      if (err.status === 404) {
        return {};
      } else {
        console.error(err)
        throw err;
      }
    });
  }

  getPullRequestCommentActivityFrom(owner, repo, since) {
    const from = util.getFromDate(since)
      , repoFullName = `${owner}/${repo}`
    ;

    return this.octokit.paginate('GET /repos/:owner/:repo/pulls/comments',
      {
        owner: owner,
        repo: repo,
        since: from,
        per_page: 100,
      }
    ).then(prComments => {
      const users = {};

      prComments.forEach(prComment => {
        if (prComment.user && prComment.user.login) {
          const login = prComment.user.login;

          if (!users[login]) {
            users[login] = 1;
          } else {
            users[login] = users[login] + 1;
          }
        }
      });

      const result = {};
      result[repoFullName] = users;

      return result;
    })
      .catch(err => {
        if (err.status === 404) {
          //TODO could log this out
          return {};
        } else {
          console.error(err)
          throw err;
        }
      })
  }

  get octokit() {
    return this._octokit;
  }
}


