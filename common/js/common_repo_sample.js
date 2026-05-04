
✅ ES5 전체 코드

const GITHUB_API = 'https://api.github.com';

/**
 * 모든 commit 가져오기 (pagination)
 */
function fetchAllCommits(options) {
    var owner = options.owner;
    var repo = options.repo;
    var branch = options.branch || 'main';
    var token = options.token;

    var page = 1;
    var perPage = 100;
    var allCommits = [];

    function request() {
        const url = `${GITHUB_API}/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${perPage}&page=${page}`;

        return fetch(url, {
            headers: token
                ? { Authorization: 'Bearer ' + token }
                : {}
        })
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('GitHub API error: ' + res.status);
                }
                return res.json();
            })
            .then(function (data) {
                if (data.length === 0) {
                    return allCommits;
                }

                allCommits = allCommits.concat(data);

                if (data.length < perPage) {
                    return allCommits;
                }

                page++;
                return request(); // 재귀로 다음 페이지
            });
    }

    return request();
}

/**
 * index.html URL 생성
 */
function buildIndexUrl(owner, repo, sha) {
    return `https://raw.githubusercontent.com/${owner}/${repo}/${sha}/index.html`;
}

/**
 * commit 데이터 가공
 */
function getCommitData(options) {
    var owner = options.owner;
    var repo = options.repo;
    var branch = options.branch || 'main';
    var token = options.token;

    return fetchAllCommits({
        owner: owner,
        repo: repo,
        branch: branch,
        token: token
    })
        .then(function (commits) {
            return commits.map(function (c) {
                return {
                    sha: c.sha,
                    message: c.commit.message,
                    author: c.commit.author.name,
                    date: c.commit.author.date,
                    indexUrl: buildIndexUrl(owner, repo, c.sha)
                };
            });
        });
}



✅ 사용 예시
getCommitData({
    owner: 'your-id',
    repo: 'your-repo',
    branch: 'main'
    // token: 'ghp_xxx'
})
    .then(function (data) {
        console.log(data);
    })
    .catch(function (err) {
        console.error(err);
    });
