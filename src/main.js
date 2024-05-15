const fs = require('fs');
const c = require('ansi-colors');
const prompts = require('prompts');
const splash = require('./splash');
const create = require('./create');
const { execSync } = require('child_process');

if (process.stdout.columns > 83 && process.stdout.rows > 11) {
  console.log('\n'.repeat(process.stdout.rows - 13));

  const splash0 = splash.node.map(l => c.greenBright(l));
  const splash1 = splash.create.map(l => c.cyan(l));

  let left = Math.round((process.stdout.columns - 84) / 2);
  let right = process.stdout.columns - left - 84;
  for (let i = 0; i < splash0.length; i++) {
    console.log(' '.repeat(left) + splash0[i] + ' ' + splash1[i] + ' '.repeat(right));
  };

  console.log('\n   \u256d' + '\u2500'.repeat(process.stdout.columns - 8) + '\u256e   ');
  left = Math.round((process.stdout.columns - 35) / 2);
  right = process.stdout.columns - left - 35;
  console.log('   \u2502' + ' '.repeat(left) + c.grey('created by') + ' ' + c.white('Leonard Lesinski') + ' '.repeat(right) + '\u2502   ');
  console.log('   \u2570' + '\u2500'.repeat(process.stdout.columns - 8) + '\u256f   ');
  left = Math.round((process.stdout.columns - 46) / 2);
  right = process.stdout.columns - left - 46;

  console.log('\n');
} else {
  console.log('\n');
  console.log(c.greenBright('node') + c.cyan('create'));
  console.log(c.grey('created by') + ' ' + c.white('Leonard Lesinski'));
  console.log('\n');
};

(async () => {
  const project = {};

  await new Promise(resolve => setTimeout(resolve, 500));
  let response = await prompts({
    type: 'text',
    name: 'name',
    message: 'What is the name of your project?',
    validate: value => value.length > 0 ? true : 'Project name cannot be empty.'
  });
  project.name = response.name;
  if (typeof project.name != 'string') process.exit(1);

  if (!process.argv[2]) {
    response = await prompts({
      type: 'autocomplete',
      name: 'directory',
      message: 'Where would you like to create your project?',
      choices: [
        { title: 'Current directory', value: 'current' },
        { title: 'Existing directory', value: 'existing' },
        { title: 'New directory', value: 'new' }
      ]
    });

    switch (response.directory) {
      case 'existing':
        response = await prompts({
          type: 'autocomplete',
          name: 'directory',
          message: 'Which directory would you like to use?',
          choices: fs.readdirSync(process.cwd()).filter(f => fs.statSync(f).isDirectory()).map(f => ({ title: f, value: f }))
        });
        project.directory = response.directory;
        break;

      case 'new':
        response = await prompts({
          type: 'text',
          name: 'directory',
          message: 'What would you like to name the new directory?',
          initial: project.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '_'),
          validate: value => {
            if (fs.existsSync(value)) {
              return 'Directory already exists.';
            };
            if (value.match(/[^A-Za-z0-9-_/]/)) {
              return 'Directory name can only contain letters, numbers, hyphens and underscores.';
            };
            return true;
          }
        });
        project.directory = response.directory;
        break;

      default:
        project.directory = '.';
        break;
    };
  } else {
    project.directory = process.argv[2];
  };
  if (typeof project.directory != 'string') process.exit(1);

  response = await prompts({
    type: 'text',
    name: 'description',
    message: 'How would you describe your project?',
    initial: 'A new Node.js project.'
  });
  project.description = response.description;
  if (typeof project.description != 'string') process.exit(1);

  while (true) {
    response = await prompts({
      type: 'text',
      name: 'pkgname',
      message: 'What is the name of your package?',
      initial: project.directory.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      validate: value => {
        if (value.match(/[^a-z0-9-]/)) {
          return 'Package name can only contain lowercase letters, numbers and hyphens.';
        };
        return true;
      }
    });
    project.pkgname = response.pkgname;
    if (typeof project.pkgname != 'string') process.exit(1);

    try {
      execSync('npm v ' + project.pkgname);

      response = await prompts({
        type: 'confirm',
        name: 'changeName',
        message: `Package name ${project.pkgname} already exists on npm. Would you like to try a different name?`,
        initial: true
      });
      if (!response.changeName) break;
    } catch (error) {
      break;
    };
  };

  response = await prompts({
    type: 'confirm',
    name: 'create',
    message: 'Create the project?',
    initial: true
  });
  if (!response.create) process.exit(0);

  create(project);
})();