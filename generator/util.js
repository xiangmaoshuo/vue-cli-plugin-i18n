const fs = require('fs')

const dftIgnoreText = `
.DS_Store
node_modules
/dist
~*.xlsx


# local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`

module.exports.updateGitIgnore = function(api) {
  const ignorePath = api.resolve('./.gitignore');
  if (fs.existsSync(ignorePath)) {
    const ignoreText = fs.readFileSync(ignorePath, { encoding: 'utf8' });
    if (!ignoreText.split('\n').includes('~*.xlsx')) {
      fs.writeFileSync(
        ignorePath,
        `${ignoreText}\n~*.xlsx`,
        { encoding: 'utf8' }
      )
    }
  } else {
    fs.writeFileSync(
      ignorePath,
      dftIgnoreText,
      { encoding: 'utf8' }
    )
  }
}

