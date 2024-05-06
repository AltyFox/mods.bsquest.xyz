const fetch = require('node-fetch');

class Github {
    constructor(user, repo) {
        this.user = user;
        this.repo = repo;
    }

    async getReleases() {
        const response = await fetch(`https://api.github.com/repos/${this.user}/${this.repo}/releases`, {
            headers: {
                'User-Agent': 'ModUpdater/0.1',
                'authorization': require('fs').readFileSync('token.txt', 'utf-8')
            }
        });
        const releases = await response.json();
        return releases.map(release => ({
            url: release.url || '',
            tag_name: release.tag_name || '',
            body: release.body || '',
            prerelease: release.prerelease || false,
            draft: release.draft || false,
            author: release.author || {},
            assets: release.assets || [],
            comparedToCurrentVersion: -2
        }));
    }

    static getUser(url) {
        return url.split('/')[3];
    }

    static getRepo(url) {
        return url.split('/')[4];
    }

    static getTagName(url) {
        return url.split('/')[7];
    }
}

class GithubRelease {
    constructor() {
        this.url = '';
        this.tag_name = '';
        this.body = '';
        this.prerelease = false;
        this.draft = false;
        this.author = new GithubAuthor();
        this.assets = [];
        this.comparedToCurrentVersion = -2;
    }

    getDownloads() {
        return this.assets
            .filter(asset => asset.content_type === 'application/x-zip-compressed')
            .map(asset => asset.browser_download_url);
    }

    getVersion() {
        return new Version(this.tag_name);
    }
}

class GithubAuthor {
    constructor() {
        this.login = '';
    }
}

class GithubAsset {
    constructor() {
        this.browser_download_url = '';
        this.content_type = '';
    }
}

class GithubCommit {
    constructor() {
        this.commit = new GithubCommitCommit();
        this.html_url = '';
    }
}

class GithubCommitCommit {
    constructor() {
        this.message = '';
        this.author = new GithubCommitCommiter();
        this.committer = new GithubCommitCommiter();
    }
}

module.exports = {
    Github,
    GithubRelease,
    GithubAuthor,
    GithubAsset,
    GithubCommit,
    GithubCommitCommit
};