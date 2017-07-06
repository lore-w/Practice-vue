let chalk = require('chalk'),
    semver = require('semver'),
    packageConf = require('../package.json');

function exec(cmd) {
    return require('child_process').execSync(cmd).toString().trim()
}

let versionRequirements = [
    {
        name: 'node',
        currentVersion: semver.clean(process.version),
        versionRequirement: packageConf.engines.node
    },
    {
        name: 'npm',
        currentVersion: exec('npm --version'),
        versionRequirement: packageConf.engines.npm
    }
];

module.exports = function () {

    let warnings = [],
        mod,
        i,
        j;

    for (i = 0; i < versionRequirements.length; i++) {

        mod = versionRequirements[i];

        if (!semver.satisfies(mod.currentVersion, mod.versionRequirement)) {
            warnings.push(mod.name + ': ' +
                chalk.red(mod.currentVersion) + ' should be ' +
                chalk.green(mod.versionRequirement)
            )
        }
    }

    if (warnings.length) {
        console.log('');
        console.log(chalk.yellow('To use this template, you must update following to modules:'))
        console.log();

        for (j = 0; j < warnings.length; j++) {

            console.log('  ' + warning[j])
        }
        console.log();
        process.exit(1)
    }
};