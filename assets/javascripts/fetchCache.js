/* fetchCache.js
   Prepopulate all caches and update the top-level stats
   This script must be executed periodically with a privileged API Token
   to make the necessary number of API requests to populate caches.
   
   Example: 
   GITHUB_TOKEN=myAwesomeToken node fetchCache.js

   Information on generating a token:
   https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token

   This script should be invoked ideally from a cronned GitHub Action
*/   



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
Bottleneck = require("bottleneck/es5");

require('./repo-helper.js');

var fs = require('fs');

const GH_TOKEN = process.env.GITHUB_TOKEN || '';
console.log("Using token " + GH_TOKEN);

var headers = new fetch.Headers();
headers.set('Authorization', 'Token ' + GH_TOKEN);
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
    repo_total: gh.repos.length + 1
  };
  var jsonFull = {
    repos: gh.repos,
    ctrb: gh.contributors,
  }

  fs.writeFileSync('stats.json', JSON.stringify(jsonStats));
  fs.writeFileSync('cache.json', JSON.stringify(jsonFull));
  console.log("Fetched cache");
}, headers);
