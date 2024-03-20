# ReadMe

The source to the mathworks.github.io page.

This readme covers basic maintenance tasks for the page owner.

## Organizations

To add a new organization, make two modifications:

**index.html**

Find the block of templates added to the Organizations section. Add a new one in the same format, e.g.:
```
        $('#orgs').append(Mustache.render(orgTemplate, {
          name: "MathWorks",
          description: "A diverse selection of MathWorks Open Source projects and resources",
          url: "https://www.github.com/mathworks"
        }));
```

**assets/javascripts/repo-helper.js**

Add the organization to the orgs object:
```
    this.orgs = {
                  'mathworks': 'MathWorks',
                  'mathworks-ref-arch': 'Reference Architecture',
                  'MathWorks-SimBiology': 'SimBiology',
                  'matlab-deep-learning' : 'Deep Learning',
                  'mathworks-robotics' : 'Robotics',
                  'thingspeak': 'ThingSpeak',
		              'MathWorks-Teaching-Resources': 'Teaching Resources',
		              'MATLAB-Graphics-and-App-Building': 'Graphics and App Building'
                };
```

Regenerate the cache after adding an organization (see below).

## Ignore

Individual repositories can be ignored by appending to the following array, in `assets/javascripts/repo-helper.js`

```
this.ignore_list = [ 'xilinx-linux', 'buildroot', 'xilinx-uboot', 'altera-linux', 'altera-uboot' ];
```

## Cache 

The page uses a cache for certain costly API requests, such as finding the most active contributors across organizations. The cache is also used if the API is not reachable, such as when the client has exhausted the rate limit for their IP.

To regenerate this cache periodically, perform the following:

- Generate an API token: [GitHub Tokens](https://github.com/settings/tokens)
  - You'll need the following permissions: public_repo, read:project, read:user, user:email
- Run `fetchCache.js` as follows:

```
cd assets/javascripts
npm install
GITHUB_TOKEN=(PASTE YOUR TOKEN HERE) node ./fetchCache.js
```

e.g. for token `ghp_1234567abcdefg`
```
cd assets/javascripts
npm install
GITHUB_TOKEN=ghp_1234567abcdefg node ./fetchCache.js
```

- Commit the resulting `cache.json` and `stats.json`
