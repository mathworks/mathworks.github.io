(function() {
  // Maximum 1 concurrent connection, 3 per second
  const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 333
  });

  // Constructor
  MW_GitHub = function() {
    this.PAGE_SIZE = 6;
    this.repos = [];
    this.page = 0;
    this.index = 0;
    this.orgs = {
                  'mathworks': 'MathWorks',
                  'mathworks-ref-arch': 'Reference Architecture',
                  'MathWorks-SimBiology': 'SimBiology',
                  'matlab-deep-learning' : 'Deep Learning',
                  'mathworks-robotics' : 'Robotics'
                  // Future orgs
                  //'thingspeak': 'ThingSpeak'
                };
    this.ignore_list = [ 'xilinx-linux', 'buildroot', 'xilinx-uboot', 'altera-linux', 'altera-uboot' ];
    this.contributors = {};
    this.stats = {};
  }

  // Populate repos[], performing sorting by date and de-duplication
  MW_GitHub.prototype.getRepositories = function(callback, followPages = false, headers = new Headers()) {
    var orgs = this.orgs;
    var ignore = this.ignore_list;
    // We want to pull each org, then process all of the results
    async function fetchRepos(urls) {
      try {
        return await Promise.all(urls.map(url => {
          //fetch(url, {headers: headers}).then(response => {
          return limiter.schedule(fetch, url, {headers: headers}).then(response => {

            // Perform a recursion down all pages only if requested (costly)
            if (response.headers.get('link') && followPages == true) {
              linkFields = response.headers.get('link').split(',');
              var links = {};
              linkFields.forEach(function(linkField) {
                links[linkField.match(/rel="(\w*)"/)[1]] = linkField.match(/\<(.*)\>/)[1];
              });
              if (links.hasOwnProperty('next') && links.hasOwnProperty('last'))
                return new Promise(function(resolve, reject) {
                  response.json().then(async prevJSON => {
                    fetchRepos([links['next']]).then(json => {
                      try {
                        var resultJSON = prevJSON.concat(json[0]);
                        resolve (resultJSON);
                      } catch (err) {
                        reject (err);
                      }
                    });
                  });
                });
              else
                return response.json()
            } else
              return response.json()
          }).catch(error => console.log(error))
        }));
      } catch (err) {
        throw (err);
      }
    }

    var request = fetchRepos(Object.keys(orgs).map(function(org, name) {
      return 'https://api.github.com/orgs/' + org + '/repos?per_page=100&type=public';
    }));
    var repos = [];

    request.then(json => {
      json.forEach(function(org) {
        if (Array.isArray(org)) {
          org.forEach(function(r) {
            var _org = r.full_name.split('/')[0];
            if (r.name != 'mathworks.github.io')
              repos.push({
                is_fork: r.fork,
                org: _org,
                org_pretty: orgs[_org],
                name: r.name,
                url: r.html_url,
                desc: truncate(r.description),
                updated_at: new Date(r.updated_at.replace(/\n/g, '')),
                stars: r.stargazers_count,
                forks: r.forks_count,
                watchers: r.subscribers_count || -1,
                lang: r.language,
                contributors_url: r.contributors_url
              });
          });
        } else {
          console.log(org);
        }
      });

      this.repos = repos;
      callback(repos);
    }).catch(err => console.log(err));
  }

  // Populate contributors from across all orgs, repos
  // WARNING: This is a very costly method! Run locally and hardcode the result above.
  MW_GitHub.prototype.getContributors = function(callback, headers = new Headers()) {
    var contributors = {};
    var ignore = this.ignore_list;
    async function fetchCtrb(urls) {
      try {
        return await Promise.all(urls.map(url => {
          return limiter.schedule(fetch, url, {headers: headers}).then(response => {
            // Perform a recursion down all pages
            if (response.headers.get('link')) {
              linkFields = response.headers.get('link').split(',');
              var links = {};
              linkFields.forEach(function(linkField) {
                links[linkField.match(/rel="(\w*)"/)[1]] = linkField.match(/\<(.*)\>/)[1];
              });
              if (links.hasOwnProperty('next') && links.hasOwnProperty('last'))
                return new Promise(function(resolve, reject) {
                  response.json().then(async prevJSON => {
                    fetchCtrb([links['next']]).then(json => {
                      try {
                        var resultJSON = prevJSON.concat(json[0]);
                        resolve (resultJSON);
                      } catch (err) {
                        reject (err);
                      }
                    });
                  });
                });
              else
                return response.json()
            } else
              return response.json()
          }).catch(error => console.log(error))
        }));
      } catch (err) {
        throw (err);
    }
  }

    // Get repositories, following pagination
    this.getRepositories(function(repos) {
      var urls = [];
      repos.map(function(r) {
        if (r.is_fork == false && !ignore.includes(r.name) )
          urls.push(r.contributors_url);
      });
      fetchCtrb(urls).then(json => {
        json.forEach(function(people) {
          if (Array.isArray(people)) {
            people.forEach(function(r) {
              contributors[r.login] = {
                user: r.login,
                avatar: r.avatar_url,
                url: r.html_url,
                contributions: contributors.hasOwnProperty(r.login) ? contributors[r.login].contributions + r.contributions : r.contributions,
               };
             });
          } else {
            console.log(people);
          }
        });

        callback(Object.values(contributors));
      }).catch(err => console.log(err));;
    }, true, headers);
  }

  // Promise to return key metrics for hero banner
  MW_GitHub.prototype.getStats = function(headers = new Headers()) {
    return new Promise(function(resolve, reject) {
      fetch('./assets/javascripts/stats.json?d=' + Date.now(), {headers: headers}).then(response => response.json()).then(stats => {
        resolve(stats);
      }).catch(err => {
        reject(err);
      });
    });
  }

  MW_GitHub.prototype.getRepositoriesCache = function(headers = new Headers()) {
    return new Promise(function(resolve, reject) {
      fetch('./assets/javascripts/cache.json?d=' + Date.now(), {headers: headers}).then(response => response.json()).then(cache => {
        for (var index in cache.repos) {
          cache.repos[index].updated_at = new Date(cache.repos[index].updated_at);
        }
        resolve(cache);
      }).catch(err => {
        reject(err);
      });
    });
  }

})();
