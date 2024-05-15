const fs = require('fs');
const c = require('ansi-colors');
const progress = require('cli-progress');

const create = async project => {
  console.log('');
  console.log(c.whiteBright('\u2192 ') + c.blueBright.bold('Creating directory...'));
  if (fs.existsSync(project.directory)) {
    console.log(c.grey.italic('  skipped.\n'));
  } else {
    fs.mkdirSync(project.directory, { recursive: true });
    console.log(c.greenBright('  done.\n'));
  };
  console.log(c.whiteBright('\u2192 ') + c.blueBright.bold('Creating package.json...'));
  fs.writeFileSync(`${project.directory}/package.json`, JSON.stringify({
    name: project.name,
    version: '1.0.0',
    description: project.description,
    main: 'src/main.js',
  }, null, 2));
  console.log(project);
};

module.exports = create;