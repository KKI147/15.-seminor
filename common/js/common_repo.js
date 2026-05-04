

function run() {
    const html = `
        <div id="app">
            <div id="listContainer"></div>
        </div>
    `;
    contents.html(html);

    getCommitData({
        owner: id,
        repo: repo,
        branch: branch,
        // token: 'ghp_xxx'
    })
    .then(function (data) {
        console.log(data);

        renderCommits(data);
    })
    .catch(function (err) {
        console.error(err);
    });
}


function formatTime(isoString) {
    const date = new Date(isoString);

    return `<span class="date">${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}</span><span class="time">${digit(date.getHours())}:${digit(date.getMinutes())}</span>`;
}

function renderCommits(list) {
    const $app = contents.find('#app');
    const $listContainer = $app.find('#listContainer');

    $listContainer.empty();

    let htmlInfo, htmlFrame, htmlLink;

    const total = list.length;
    for (let i = 0; i < total; ++i) {
        const item = list[i];

        const $row = $(`<div class="commit-row"></div>`);

        const $idx = $(`<div class="commit-col commit-idx'">${total - i}</div>`);

        htmlInfo = `
            <div class="commit-col commit-info">
                <p class="title">${item.title}</p>
                <p class="message">${item.message}</p>
                <p class="datetime">${formatTime(item.date)}</p>
            </div>
        `;
        const $info = $(htmlInfo);

        htmlFrame = `
            <div class="commit-col commit-frame">
                <iframe id="" src="${item.indexUrl}" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" title="" allowtransparency="true"></iframe>
            </div>
        `;

        const $frame = $(htmlFrame);

        htmlLink = `
            <div class="commit-col commit-link">
                <a href="${item.indexUrl}" target="_blank"><span class="text">[View]</span></a>
            </div>
        `;

        const $link = $(htmlLink);

        $row.append($idx, $info, $frame, $link);

        $listContainer.append($row);
    }

    checkScroll($listContainer);

    $listContainer.scrollTop(0);
}


function checkScroll($container) {
    // 내용물의 높이가 컨테이너 높이보다 크면 스크롤 추가
    if ($container[0].scrollHeight > $container[0].clientHeight) {
        $container.addClass('scroll');
    }
    // 그렇지 않으면 스크롤 숨김
    else {
        // $container.addClass('noScroll');
    }
}


/*
https://api.github.com/repos/leer83/test_seminar/commits?sha=main&per_page=100&page=1
https://api.github.com/repos/leer83/pull-request-repo/commits?sha=master&per_page=100&page=1
*/
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
    // return `https://raw.githubusercontent.com/${owner}/${repo}/${sha}/index.html`;
    // return `https://${owner}.github.io/${repo}/${sha}/index.html`;
    return `https://raw.githack.com/${owner}/${repo}/${sha}/index.html`;
}

/**
 * commit 메시지 의 제목/내용 분리
 */
function parseCommitMessage(message) {
    var lines = message.split('\n');

    var title = lines[0];
    var body = lines.slice(1).join('\n').trim();

    return {
        title: title,
        body: body,
    };
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
                const parsed = parseCommitMessage(c.commit.message);

                return {
                    sha: c.sha,
                    message: c.commit.message,
                    title: parsed.title,
                    body: parsed.body,
                    author: c.commit.author.name,
                    date: c.commit.author.date,
                    indexUrl: buildIndexUrl(owner, repo, c.sha)
                };
            });
        });
}
