exports.argv = (argv) => {
    const { context } = argv
    const { yargs, modules } = context

    argv.modules.split(',').forEach((name) => {
        name = name.trim()

        if (name === '*') {
            Object.values(modules).forEach(module => require(module))
        }
        else {
            const module = modules[name]

            if (module) {
                require(module)
            }
            else {
                yargs
                    .epilog(`Unrecognized module ${name}.`)
                    .showHelp()

                process.exit(1)
            }
        }
    })
}

exports.yargs = {
    command: 'modules',
    describe: 'List loadable modules',

    handler: (argv) => {
        const { context } = argv
        const { modules } = context

        Object.keys(modules).forEach(module => console.log(module, '-', module.desc || module.describe || module.description || ''))
    }
}
