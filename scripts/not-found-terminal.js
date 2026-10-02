(() => {
    const form = document.querySelector('.terminal-input-line');
    const input = document.querySelector('.terminal-input');
    const history = document.querySelector('.terminal-history');
    const screen = document.querySelector('.terminal-screen');
    const terminal = document.querySelector('.terminal');
    const cursor = document.querySelector('.terminal-input-line .cursor');

    if (!(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement)
        || !(history instanceof HTMLElement) || !(screen instanceof HTMLElement)
        || !(terminal instanceof HTMLElement) || !(cursor instanceof HTMLElement)) {
        throw new Error('404 terminal markup is incomplete.');
    }

    const helpText = `# Welcome to my 404 terminal

This is a small simulated shell. Commands run here, not on a real system.

Try: ls, cat help.md, pwd, whoami, uname -a, date, echo, clear, help

Use --help after a command for more information.`;
    const commands = ['cat', 'clear', 'date', 'echo', 'find', 'help', 'ls', 'pwd', 'uname', 'whoami'];
    const commandHelp = {
        cat: 'Usage: cat help.md — print the demo help file.',
        clear: 'Usage: clear — clear the terminal history.',
        date: 'Usage: date — print the current local date and time.',
        echo: 'Usage: echo [text...] — print the supplied text.',
        find: 'Usage: find ./page — demonstrate a missing page.',
        help: 'Usage: help — show the commands available in this demo.',
        ls: 'Usage: ls — list the available demo file.',
        pwd: 'Usage: pwd — print the simulated working directory.',
        whoami: 'Usage: whoami — print the simulated username.'
    };
    const commandHistory = [];
    let historyIndex = 0;
    const measureContext = document.createElement('canvas').getContext('2d');

    const updateInputWidth = () => {
        input.style.width = `calc(${Math.max(1, input.value.length)}ch + .55em)`;
        updateCursorPosition();
    };

    const updateCursorPosition = () => {
        if (!measureContext) return;

        const styles = getComputedStyle(input);
        measureContext.font = styles.font;
        const caretPosition = input.selectionStart ?? input.value.length;
        const prefixWidth = measureContext.measureText(input.value.slice(0, caretPosition)).width;
        const left = input.offsetLeft + parseFloat(styles.paddingLeft) + prefixWidth - input.scrollLeft;
        cursor.style.left = `${left}px`;
    };

    const parseCommand = (command) => {
        const tokens = command.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
        if (tokens.some((token) => (token.startsWith('"') && !token.endsWith('"'))
            || (token.startsWith("'") && !token.endsWith("'")))) {
            return null;
        }
        return tokens.map((token) => {
            if ((token.startsWith('"') && token.endsWith('"'))
                || (token.startsWith("'") && token.endsWith("'"))) {
                return token.slice(1, -1);
            }
            return token;
        });
    };

    const appendPrompt = (command) => {
        const line = document.createElement('p');
        line.className = 'terminal-command';

        const user = document.createElement('span');
        user.className = 'prompt-user';
        user.textContent = 'daniel@debian';

        const path = document.createElement('span');
        path.className = 'prompt-path';
        path.textContent = ':~';

        const symbol = document.createElement('span');
        symbol.className = 'prompt-symbol';
        symbol.textContent = '$ ';

        line.append(user, path, symbol, document.createTextNode(command));
        history.append(line);
    };

    const appendOutput = (text) => {
        if (!text) return;
        const output = document.createElement('pre');
        output.className = 'terminal-output';
        output.textContent = text;
        history.append(output);
    };

    const runCommand = (rawCommand) => {
        const command = rawCommand.trim();
        if (!command) return;

        appendPrompt(command);
        commandHistory.push(command);
        historyIndex = commandHistory.length;

        const parsed = parseCommand(command);
        if (!parsed) {
            appendOutput('bash: syntax error: unmatched quote');
            screen.scrollTop = screen.scrollHeight;
            return;
        }

        const [name, ...args] = parsed;
        let result = '';

        if (args[0] === '--help' && name !== 'uname') {
            result = Object.hasOwn(commandHelp, name)
                ? commandHelp[name]
                : `Usage: ${name} [options...]`;
        } else switch (name) {
            case 'help':
                result = 'Commands: cat, clear, date, echo, find, help, ls, pwd, uname, whoami. Use --help with commands other than uname; uname supports -a only.';
                break;
            case 'ls':
                result = args.length === 0 || (args.length === 1 && ['-a', '-la', '-al'].includes(args[0]))
                    ? 'help.md'
                    : `ls: unsupported option or path: ${args.join(' ')}`;
                break;
            case 'cat':
                result = args.length === 1 && args[0] === 'help.md'
                    ? helpText
                    : args.length === 0
                        ? 'cat: missing file operand'
                        : `cat: ${args.join(' ')}: No such file or directory`;
                break;
            case 'pwd':
                result = args.length === 0 ? '/home/daniel' : `pwd: unexpected argument: ${args.join(' ')}`;
                break;
            case 'whoami':
                result = args.length === 0 ? 'daniel' : `whoami: unexpected argument: ${args.join(' ')}`;
                break;
            case 'uname':
                result = args.length === 0 || (args.length === 1 && args[0] === '-s')
                    ? 'Linux'
                    : args.length === 1 && args[0] === '-a'
                        ? 'Linux debian 6.1.0 x86_64 GNU/Linux'
                        : `uname: unsupported option: ${args.join(' ')}`;
                break;
            case 'echo':
                result = args.join(' ');
                break;
            case 'date':
                result = args.length === 0
                    ? new Date().toLocaleString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hourCycle: 'h23',
                        timeZoneName: 'short'
                    })
                    : `date: unsupported option: ${args.join(' ')}`;
                break;
            case 'find':
                result = args.length === 1 && args[0] === './page'
                    ? "find: './page': No such file or directory"
                    : `find: ${args.join(' ') || '.'}: No such file or directory`;
                break;
            case 'clear':
                if (args.length === 0) {
                    history.replaceChildren();
                    screen.scrollTop = 0;
                    return;
                }
                result = 'clear: too many arguments';
                break;
            default:
                result = `${name}: command not found`;
        }

        appendOutput(result);
        screen.scrollTop = screen.scrollHeight;
    };

    const commonPrefix = (values) => values.reduce((prefix, value) => {
        let length = 0;
        while (length < prefix.length && prefix[length] === value[length]) length += 1;
        return prefix.slice(0, length);
    });

    const completeInput = () => {
        const caretPosition = input.selectionStart ?? input.value.length;
        if (caretPosition !== input.value.length || input.value.includes('"') || input.value.includes("'")) return;

        const current = input.value;
        const parts = current.split(/\s+/);
        const command = parts[0];
        const isCompletingCommand = parts.length === 1 && !current.endsWith(' ');
        let prefix;
        let candidates;

        if (isCompletingCommand) {
            prefix = command;
            candidates = commands;
        } else {
            prefix = current.endsWith(' ') ? '' : parts.at(-1);
            const args = parts.slice(1);
            if (command === 'cat') {
                candidates = ['help.md', '--help'];
            } else if (command === 'uname') {
                candidates = ['-a', '-r', '--help'];
            } else if (command === 'find') {
                candidates = ['./page', '--help'];
            } else if (command === 'ls' && prefix.startsWith('-')) {
                candidates = ['-a', '-la', '-al', '--help'];
            } else if (commandHelp[command]) {
                candidates = ['--help'];
            } else {
                candidates = [];
            }
            if (args.length > 0 && !current.endsWith(' ')) {
                candidates = candidates.filter((candidate) => candidate !== '--help' || prefix.startsWith('-'));
            }
        }

        const matches = candidates.filter((candidate) => candidate.startsWith(prefix));
        if (matches.length === 1) {
            const completed = isCompletingCommand
                ? matches[0]
                : `${current.slice(0, current.length - prefix.length)}${matches[0]}`;
            input.value = completed;
            input.setSelectionRange(completed.length, completed.length);
            updateInputWidth();
        } else if (matches.length > 1) {
            const shared = commonPrefix(matches);
            if (shared.length > prefix.length) {
                const completed = isCompletingCommand
                    ? shared
                    : `${current.slice(0, current.length - prefix.length)}${shared}`;
                input.value = completed;
                input.setSelectionRange(completed.length, completed.length);
                updateInputWidth();
            } else {
                appendOutput(matches.join('    '));
                screen.scrollTop = screen.scrollHeight;
            }
        }
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        runCommand(input.value);
        input.value = '';
        updateInputWidth();
        screen.scrollTop = screen.scrollHeight;
    });

    input.addEventListener('input', updateInputWidth);
    input.addEventListener('click', updateCursorPosition);
    input.addEventListener('keyup', updateCursorPosition);
    input.addEventListener('select', updateCursorPosition);
    input.addEventListener('focus', updateCursorPosition);
    input.addEventListener('blur', updateCursorPosition);
    terminal.addEventListener('click', () => input.focus());
    window.addEventListener('resize', updateCursorPosition);

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            completeInput();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (historyIndex > 0) {
                historyIndex -= 1;
                input.value = commandHistory[historyIndex];
                updateInputWidth();
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex += 1;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                input.value = '';
            }
            updateInputWidth();
        }
    });

    updateInputWidth();
})();