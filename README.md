# ReadMe

The source for the [mathworks.github.io](https://mathworks.github.io) landing page.

This readme covers basic maintenance tasks for the page owner.

## Local development

The site is static HTML/JS, so any local web server works. Two convenient options:

**Docker Compose** (recommended, matches the development container):
```
docker compose -f githubio.compose.yml up
```
Then open http://localhost:8080.

**Python** (no dependencies):
```
python -m http.server 8080
```

Opening `index.html` directly via `file://` will not work — the page fetches `cache.json` and `stats.json` over HTTP.

## Featured Projects

The Featured Projects section is rendered from a hand-curated list near the top of `index.html`. To add, remove, or reorder a featured project, edit the `#featured` block:

```
$('#featured').append(Mustache.render(featuredTemplate, {
  name: "MATLAB Agentic Toolkit",
  description: "Connect MATLAB to AI agents and agentic frameworks...",
  url: "https://github.com/matlab/matlab-agentic-toolkit",
  org: "MATLAB Development & AI Coding Projects"
}));
```

The `org` field should match one of the organization display names used below.

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

Add the organization to the `orgs` object. The current list is:
```
this.orgs = {
              'mathworks': 'MathWorks',
              'matlab': 'MATLAB Development & AI Coding Projects',
              'simulink': 'Simulink',
              'mathworks-ref-arch': 'Reference Architecture',
              'simscape': 'Simscape',
              'matlab-deep-learning' : 'Deep Learning',
              'MATLAB-Graphics-and-App-Building': 'Graphics and App Building',
              'MathWorks-Teaching-Resources': 'Teaching Resources',
              'mathworks-robotics' : 'Robotics',
              'MathWorks-SimBiology': 'SimBiology',
              'thingspeak': 'ThingSpeak'
            };
```

Regenerate the cache after adding an organization (see below).

## Ignore

Individual repositories can be ignored by appending to the following array in `assets/javascripts/repo-helper.js`:

```
this.ignore_list = [ 'xilinx-linux', 'buildroot', 'xilinx-uboot', 'altera-linux', 'altera-uboot', '.github' ];
```

Repositories named `mathworks.github.io` are always excluded.

## Cache

The page uses a cache for certain costly API requests, such as finding the most active contributors across organizations. The cache is also used if the API is not reachable, such as when the client has exhausted the rate limit for their IP.

To regenerate this cache periodically, perform the following:

- Generate an API token: [GitHub Tokens](https://github.com/settings/tokens)
  - Classic tokens: `public_repo`, `read:project`, `read:user`, `user:email`
  - Fine-grained tokens also work; grant read-only access to public repositories and user metadata.
- Run `fetchCache.js`:

```
cd assets/javascripts
npm install
GITHUB_TOKEN=(PASTE YOUR TOKEN HERE) node ./fetchCache.js
```

e.g. for token `ghp_1234567abcdefg`:
```
cd assets/javascripts
npm install
GITHUB_TOKEN=ghp_1234567abcdefg node ./fetchCache.js
```

On PowerShell:
```
cd assets\javascripts
npm install
$env:GITHUB_TOKEN = "ghp_1234567abcdefg"
node .\fetchCache.js
```

- Commit the resulting `cache.json` and `stats.json`.
