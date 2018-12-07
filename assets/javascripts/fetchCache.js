// Helper methods for repo-helper.js
truncate = function(text, length = 80) {
  if (!text)
    return '';

  if (text.length > length)
    return text.substring(0,text.indexOf(" ", 70)) + '...';
  else
    return text;
}

fetch = require('node-fetch');

require('./repo-helper.js');

var fs = require('fs');

// Use basic auth in Node for pulling cached metrics with a higher rate limit
const GH_USER = process.env.GITHUB_USER || '';
const GH_PASS = process.env.GITHUB_PASS || '';
console.log("Using credentials " + GH_USER + ":" + GH_PASS);

var headers = new fetch.Headers();
headers.set('Authorization', 'Basic ' + Buffer.from(GH_USER + ":" + GH_PASS).toString('base64'));
var gh = new MW_GitHub();

gh.getContributors(function(contributors) {
  gh.contributors = contributors;

  // Sort by Contributions
  gh.contributors.sort(function(a,b) { return b.contributions - a.contributions });
  gh.top_contributors = gh.contributors.slice(0,6);


  var jsonStats = {
    top_contributors: gh.top_contributors,
    ctrb_total: gh.contributors.length,
    org_total: Object.keys(gh.orgs).length,
    repo_total: gh.repos.length
  };
  var jsonFull = {
    repos: gh.repos,
    ctrb: gh.contributors,
  }

  fs.writeFileSync('stats.json', JSON.stringify(jsonStats));
  fs.writeFileSync('cache.json', JSON.stringify(jsonFull));
  console.log("Fetched cache");
}, headers);
