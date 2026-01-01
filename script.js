const input = document.getElementById('user-input');
const hint = document.getElementById('suggestion-hint');
const historyContainer = document.getElementById('terminal-history');
const outputBuffer = document.getElementById('output-buffer');
const promptLabel = document.getElementById('prompt-label');
const dirDisplay = document.getElementById('current-dir');
const tipDisplay = document.getElementById('random-tip');

let currentPath = "root";
let commandHistory = [];
let historyIndex = -1;
let glitchCounter = 0;

const terminalTips = [
    "Type 'help' for commands.",
];

// File System Structure
const fileSystem = {
    "root": { 
        parent: null, 
        directories: ["documents", "journal", "projects", "recipes"], 
        files: ["contact.txt"] 
    },
    "documents": { parent: "root", directories: [], files: ["readme.md"] },
    "journal": { parent: "root", directories: [], files: ["01_entry.txt"] },
    "projects": { parent: "root", directories: ["web", "python"], files: ["list.txt"] },
    "web": { parent: "projects", directories: [], files: ["index.html", "script.js"] },
    "python": { parent: "projects", directories: [], files: ["bot.py"] },
    "recipes": { parent: "root", directories: [], files: ["chef.txt"] }
};

// File Data Repo
const fileData = {
    "contact.txt": "Email: hello@frqise.me\nGithub: @frqise\nTwitter: @its_FrQise",
    "readme.md": "# Documents\nTest Readme File",
    "01_entry.txt": `DATE: 2026-01-01\nTITLE: First Entry\n-------------------\nThis is an example journal entry.`,
    "chef.txt": "Go to the kebab, call them Chef, enjoy your meal.",
};

// Commands List
const commands = ["help", "ls", "cd", "cat", "clear", "history", "frqisefetch", "pwd", "sudo", "whoami"];

function showRandomTip() {
    tipDisplay.textContent = terminalTips[Math.floor(Math.random() * terminalTips.length)];
}
showRandomTip();

// Input functions
input.addEventListener('input', () => {
    const val = input.value;
    hint.textContent = "";
    if (!val) return;
    const parts = val.split(" ");
    const cmdPart = parts[0].toLowerCase();
    const argPart = parts[1] || "";

    if (parts.length === 1) {
        const match = commands.find(c => c.startsWith(cmdPart));
        if (match) hint.textContent = match;
    } else {
        const items = [...fileSystem[currentPath].directories, ...fileSystem[currentPath].files];
        const match = items.find(i => i.startsWith(argPart.toLowerCase()));
        if (match) hint.textContent = parts[0] + " " + (match || "");
    }
});

input.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        if (hint.textContent) { input.value = hint.textContent; hint.textContent = ""; }
    }
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[commandHistory.length - 1 - historyIndex];
            hint.textContent = "";
        }
    }
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[commandHistory.length - 1 - historyIndex];
        } else if (historyIndex === 0) {
            historyIndex = -1;
            input.value = "";
        }
        hint.textContent = "";
    }
    if (e.key === 'Enter') {
        const fullInput = input.value.trim();
        if (fullInput) { commandHistory.push(fullInput); historyIndex = -1; }
        const [cmd, arg] = fullInput.toLowerCase().split(' ');
        processCommand(cmd, arg, fullInput);
        input.value = '';
        hint.textContent = '';
    }
});

// Command Logic
function processCommand(cmd, arg, originalInput) {
    const currentPromptHtml = promptLabel.innerHTML;
    const echo = `<div class="echo-line">${currentPromptHtml} <span class="white-text">${originalInput}</span></div>`;
    let output = "";

    if (commands.includes(cmd) || cmd === "") { glitchCounter = 0; }

    switch (cmd) {
        case "whoami":
            output = `
<span class="user-part">User:</span> guest
<span class="path-part">Role:</span> Temporary Visitor
<span class="gold-text">Host:</span> frqise_web_v2.9
<span class="dim-text">Permissions:</span> Read-only (Sudo restricted)
            `;
            break;

        case "sudo":
            const sudoGags = [
                "Permission denied. Try saying 'sudo please'.",
                "User is not in the sudoers file. This incident will be logged.",
                "Attempting unauthorized access... [FAIL]"
            ];
            output = `<span style="color:#ffb86c">${sudoGags[Math.floor(Math.random() * sudoGags.length)]}</span>`;
            glitchCounter++; 
            if (glitchCounter >= 3) { triggerGlitch(); return; }
            break;

        case "pwd":
            output = currentPath === "root" ? "/home/guest" : `/home/guest/${currentPath}`;
            break;

        case "frqisefetch":
            output = `
<div class="fetch-container">
    <div class="fetch-logo">
      __
    <(o )___
     ( ._> /
      \`---' 
    </div>
    <div class="fetch-info">
        <span class="user-part">guest</span>@<span class="user-part">frqise_web</span><br>
        -----------------------<br>
        <b>OS</b>: FrqiseOS v2.9<br>
        <b>Shell</b>: frqise_shell 2.0<br>
        <b>Filesystem</b>: Initialized<br>
        <b>Uptime</b>: ${Math.floor(performance.now()/60000)}m<br><br>
        <span style="background:#bd93f9">&nbsp;&nbsp;&nbsp;</span><span style="background:#8be9fd">&nbsp;&nbsp;&nbsp;</span><span style="background:#f1fa8c">&nbsp;&nbsp;&nbsp;</span>
    </div>
</div>`;
            break;

        case "ls":
            const dir = fileSystem[currentPath];
            output = dir.directories.map(d => `<span class="dir-text">${d}/</span>`).join('  ') + "  " + dir.files.join('  ');
            break;

        case "cd":
            if (!arg || arg === "~") currentPath = "root";
            else if (arg === "..") currentPath = fileSystem[currentPath].parent || "root";
            else if (fileSystem[currentPath].directories.includes(arg)) currentPath = arg;
            else output = `frqise_shell: cd: ${arg}: No such directory`;
            updatePrompt();
            break;

        case "cat":
            if (fileSystem[currentPath].files.includes(arg)) {
                output = `<div class="file-content">${fileData[arg]}</div>`;
            } else if (fileSystem[currentPath].directories.includes(arg)) {
                output = `cat: ${arg}: Is a directory`;
            } else {
                output = `cat: ${arg}: No such file`;
            }
            break;

        case "clear":
            outputBuffer.innerHTML = "";
            return;

        case "help":
            output = "Available: " + commands.join(", ");
            break;

        case "history":
            output = commandHistory.map((c, i) => `${i + 1}  ${c}`).join('\n');
            break;

        case "": break;

        default:
            if (cmd) {
                glitchCounter++;
                if (glitchCounter >= 3) { triggerGlitch(); return; }
                output = `frqise_shell: ${cmd}: command not found`;
            }
    }

    outputBuffer.innerHTML += echo + `<div class="command-output">${output}</div>`;
    historyContainer.scrollTop = historyContainer.scrollHeight;
}

function triggerGlitch() {
    document.body.classList.add('glitch-mode');
    outputBuffer.innerHTML += `<div style="color:#ff8080; font-weight:bold; margin-top:10px;">
        [!] SYSTEM_CRASH: Illegal operation.<br>
        [!] EMERGENCY_RESET: Initiating...
    </div>`;
    input.disabled = true;
    setTimeout(() => {
        document.body.classList.remove('glitch-mode');
        outputBuffer.innerHTML = `<div class="dim-text">--- Session Restored ---</div>`;
        glitchCounter = 0;
        input.disabled = false;
        input.focus();
    }, 1500);
}

function updatePrompt() {
    dirDisplay.textContent = currentPath === "root" ? "~" : `~/${currentPath}`;
}