exports.argv = (argv) => {
    const { screen, Question } = require('@pown/blessed')

    const s = screen()

    s.key(['tab'], (ch, key) => {
        s.focusNext()
    })

    s.key(['q', 'C-c', 'C-x'], (ch, key) => {
        const question = new Question({
            keys: true,
            top: 'center',
            left: 'center',
            width: '50%',
            height: 5,
            border: {
                type: 'line'
            },
            style: {
                border: {
                    fg: 'grey'
                }
            }
        })

        s.append(question)

        question.ask('Do you really want to quit?', (err, result) => {
            if (err) {
                return
            }

            if (result) {
                return process.exit(0)
            }

            s.remove(question)
            s.render()
        })
    })

    s.render()
}
