    npm run publish

This commits all of the changes in the **dist/** directory to the **gh-pages** branch and pushes it to GitHub. The **gh-pages** branch is used for the publicly accessible Patterns website.

### Publishing

Here are the steps to publishing updates to the npm registry. This assumes that a feature request has been approved and pulled into master.

1. `git checkout master` - Change the working branch of your source to master.

1. `npm install` - Install any npm dependencies from the master **package.json** were not captured in your source.

1. Manually increment the package.json version number to the desired semantic version (patch, minor, major) and save the file.

1. `npm run predeploy` - Build the scripts, styles, and markup of to the distribution folder with the new version number in the file.

1. `git checkout package.json` - Undo the change made to the **package.json** file. This is temporary so that the next command can do it's work.

1. `npm version {{ patch, minor, or major }}` - This will update the **package.json** and **package-lock.json** file, commit the change and tag the repo with the desired version.

1. `git push origin && git push origin {{ tag (version number with 'v' prepended to it) }}` - Push changes and tag to the GitHub repository.

1. `npm publish` - Publish the package to the npm registery. This will also run `npm run publish` which executes a script that will take the distribution directory and push it to the GitHub Pages branch for the static site documentation.
