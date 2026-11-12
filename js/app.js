const components = [
    "header",
    "hero",
    "about",
    "portfolio",
    "games",
    "contact",
    "social",
    "footer",
    "image-modal"
];

async function loadComponents() {
    await Promise.all(components.map(async (name) => {
        const response = await fetch(`components/${name}.html`);
        if (!response.ok) {
            throw new Error(`Gagal memuat komponen ${name}: ${response.status}`);
        }

        document.getElementById(`component-${name}`).innerHTML = await response.text();
    }));

    await loadGameComponents();
    initializePortfolio();
}

async function loadGameComponents() {
    const games = ["memory", "reaction", "number", "snake", "tictactoe", "whack", "pong"];
    const stage = document.getElementById("game-stage");
    if (!stage) throw new Error("Area pilihan game tidak ditemukan.");

    await Promise.all(games.map(async (game) => {
        const response = await fetch(`components/games/${game}.html`);
        if (!response.ok) {
            throw new Error(`Gagal memuat game ${game}: ${response.status}`);
        }

        const panel = document.createElement("div");
        panel.className = "game-panel-slot";
        panel.dataset.gamePanel = game;
        panel.hidden = game !== "memory";
        panel.innerHTML = await response.text();
        stage.append(panel);
    }));
}

function toggleDoc(id) {
    document.getElementById(id)?.classList.toggle("hidden");
}

function showImgModal(src, alt = "") {
    const modal = document.getElementById("img-modal");
    const image = document.getElementById("img-modal-src");

    if (!modal || !image) return;

    image.src = src;
    image.alt = alt;
    modal.classList.remove("hidden");
}

function closeImgModal() {
    const modal = document.getElementById("img-modal");
    const image = document.getElementById("img-modal-src");

    modal?.classList.add("hidden");
    if (image) image.src = "";
}

function initializePortfolio() {
    // Preview gambar dokumentasi project.
    document.querySelectorAll(".project-stagger img, .project-stagger picture img")
        .forEach((image) => {
            image.style.cursor = "zoom-in";
            image.addEventListener("click", () => showImgModal(image.src, image.alt));
        });

    // Tutup modal ketika area backdrop diklik.
    document.getElementById("img-modal")?.addEventListener("click", (event) => {
        if (event.target === event.currentTarget) closeImgModal();
    });

    // Tutup modal dengan tombol Escape.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeImgModal();
    });

    initializeActiveNavigation();
    initializeHeaderScrollEffect();
    initializeScrollAnimations();
    initializeMobileNavigation();
    initializeGamesMenu();
    initializeBackToTop();
    initializeMiniGames();
}

function initializeMiniGames() {
    initializeMemoryGame();
    initializeReactionGame();
    initializeNumberGame();
    initializeSnakeGame();
    initializeTicTacToe();
    initializeWhackAMole();
    initializePong();
    initializeGamePicker();
}

function initializeBackToTop() {
    const button = document.getElementById("back-to-top");
    if (!button) return;

    function updateVisibility() {
        const isVisible = window.scrollY > 300;
        button.classList.toggle("is-visible", isVisible);
        button.setAttribute("aria-hidden", String(!isVisible));
        button.tabIndex = isVisible ? 0 : -1;
    }

    window.addEventListener("scroll", updateVisibility, { passive: true });
    button.addEventListener("click", () => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });

    updateVisibility();
}

function initializeGamesMenu() {
    const toggle = document.getElementById("games-menu-toggle");
    const menu = document.getElementById("games-menu");
    if (!toggle || !menu) return;

    function closeMenu() {
        menu.classList.add("hidden");
        toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", () => {
        const isExpanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isExpanded));
        menu.classList.toggle("hidden", isExpanded);
    });

    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            selectGame(link.dataset.gameSelect);
            closeMenu();
        });
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".games-menu-wrapper")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || menu.classList.contains("hidden")) return;
        closeMenu();
        toggle.focus();
    });
}

function initializeMobileNavigation() {
    const header = document.getElementById("main-header");
    const toggle = document.getElementById("mobile-nav-toggle");
    const navigation = document.getElementById("primary-navigation");
    if (!header || !toggle || !navigation) return;

    function closeNavigation() {
        navigation.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Buka menu navigasi");
    }

    toggle.addEventListener("click", () => {
        const isExpanded = toggle.getAttribute("aria-expanded") === "true";
        navigation.classList.toggle("is-open", !isExpanded);
        toggle.setAttribute("aria-expanded", String(!isExpanded));
        toggle.setAttribute("aria-label", isExpanded ? "Buka menu navigasi" : "Tutup menu navigasi");
    });

    navigation.addEventListener("click", (event) => {
        if (event.target.closest("a[href]")) closeNavigation();
    });

    document.addEventListener("click", (event) => {
        if (!header.contains(event.target)) closeNavigation();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !navigation.classList.contains("is-open")) return;
        closeNavigation();
        toggle.focus();
    });

    window.matchMedia("(min-width: 641px)").addEventListener("change", closeNavigation);
}

function selectGame(game) {
    const panels = document.querySelectorAll("[data-game-panel]");
    if (![...panels].some((panel) => panel.dataset.gamePanel === game)) return;

    panels.forEach((panel) => {
        panel.hidden = panel.dataset.gamePanel !== game;
    });

    document.querySelectorAll("[data-game-select]").forEach((button) => {
        const isSelected = button.dataset.gameSelect === game;
        if (button instanceof HTMLButtonElement) {
            button.classList.toggle("is-active", isSelected);
            button.setAttribute("aria-pressed", String(isSelected));
        }
    });

    document.dispatchEvent(new CustomEvent("game:change", { detail: { game } }));
}

function initializeGamePicker() {
    document.querySelectorAll(".game-picker [data-game-select]").forEach((button) => {
        button.addEventListener("click", () => selectGame(button.dataset.gameSelect));
    });
}

function initializeMemoryGame() {
    const board = document.getElementById("memory-board");
    const status = document.getElementById("memory-status");
    const restart = document.getElementById("memory-restart");
    if (!board || !status || !restart) return;

    const symbols = ["🎨", "🚀", "🎧", "🌙", "⚡", "🐳"];
    let firstCard = null;
    let locked = false;
    let matchedPairs = 0;
    let mismatchTimer;

    function startGame() {
        window.clearTimeout(mismatchTimer);
        firstCard = null;
        locked = false;
        matchedPairs = 0;
        status.textContent = "Temukan semua pasangan kartu.";
        const cards = [...symbols, ...symbols]
            .map((symbol, index) => ({ symbol, key: index }))
            .sort(() => Math.random() - 0.5);

        board.replaceChildren(...cards.map(({ symbol }, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "memory-card";
            button.dataset.symbol = symbol;
            button.setAttribute("aria-label", `Kartu ${index + 1}, tertutup`);
            button.textContent = "?";
            button.addEventListener("click", () => {
                if (locked || button.classList.contains("is-matched")
                    || button === firstCard || button.classList.contains("is-revealed")) return;

                button.classList.add("is-revealed");
                button.textContent = symbol;
                button.setAttribute("aria-label", `Kartu ${index + 1}: ${symbol}`);

                if (!firstCard) {
                    firstCard = button;
                    return;
                }

                if (firstCard.dataset.symbol === symbol) {
                    firstCard.classList.add("is-matched");
                    button.classList.add("is-matched");
                    firstCard = null;
                    matchedPairs += 1;
                    status.textContent = matchedPairs === symbols.length
                        ? "Keren! Semua pasangan berhasil ditemukan 🎉"
                        : `Pasangan ditemukan: ${matchedPairs} dari ${symbols.length}.`;
                    return;
                }

                locked = true;
                const previousCard = firstCard;
                firstCard = null;
                status.textContent = "Belum cocok. Coba ingat posisinya!";
                mismatchTimer = window.setTimeout(() => {
                    [previousCard, button].forEach((card) => {
                        card.classList.remove("is-revealed");
                        card.textContent = "?";
                        card.setAttribute("aria-label", "Kartu tertutup");
                    });
                    locked = false;
                }, 800);
            });
            return button;
        }));
    }

    restart.addEventListener("click", startGame);
    startGame();
}

function initializeReactionGame() {
    const button = document.getElementById("reaction-button");
    const status = document.getElementById("reaction-status");
    if (!button || !status) return;

    let timeout;
    let startedAt = 0;
    let state = "ready";

    document.addEventListener("game:change", (event) => {
        if (event.detail.game === "reaction" || state !== "waiting") return;
        window.clearTimeout(timeout);
        state = "ready";
        button.className = "reaction-button";
        button.textContent = "Mulai tes";
        status.textContent = "Siap? Mulai tes dan tunggu aba-aba.";
    });

    button.addEventListener("click", () => {
        if (state === "ready" || state === "result") {
            window.clearTimeout(timeout);
            state = "waiting";
            button.className = "reaction-button is-waiting";
            button.textContent = "Tunggu warna hijau...";
            status.textContent = "Fokus dan tunggu sampai tombol berubah hijau.";
            timeout = window.setTimeout(() => {
                state = "go";
                startedAt = performance.now();
                button.disabled = false;
                button.className = "reaction-button is-go";
                button.textContent = "KLIK SEKARANG!";
                status.textContent = "Sekarang! Klik secepat mungkin.";
            }, 1200 + Math.random() * 2800);
            return;
        }

        if (state === "waiting") {
            window.clearTimeout(timeout);
            state = "result";
            button.disabled = false;
            button.className = "reaction-button is-early";
            button.textContent = "Mulai lagi";
            status.textContent = "Terlalu cepat! Klik untuk mencoba lagi.";
            return;
        }

        if (state === "go") {
            const elapsed = Math.round(performance.now() - startedAt);
            state = "result";
            button.className = "reaction-button";
            button.textContent = "Coba lagi";
            status.textContent = `Waktu reaksimu ${elapsed} ms. Klik untuk bermain lagi!`;
        }
    });
}

function initializeNumberGame() {
    const form = document.getElementById("number-form");
    const input = document.getElementById("number-input");
    const status = document.getElementById("number-status");
    const restart = document.getElementById("number-restart");
    if (!form || !input || !status || !restart) return;

    let answer;
    let attempts;

    function startGame() {
        answer = Math.floor(Math.random() * 20) + 1;
        attempts = 0;
        input.disabled = false;
        input.value = "";
        status.textContent = "Masukkan angka dari 1 sampai 20.";
        form.querySelector("button[type='submit']").disabled = false;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const guess = Number(input.value);
        if (!Number.isInteger(guess) || guess < 1 || guess > 20) {
            status.textContent = "Masukkan angka bulat antara 1 dan 20.";
            input.focus();
            return;
        }

        attempts += 1;
        if (guess === answer) {
            status.textContent = `Tepat! Angkanya ${answer}. Kamu berhasil dalam ${attempts} tebakan 🎉`;
            input.disabled = true;
            form.querySelector("button[type='submit']").disabled = true;
        } else {
            status.textContent = guess < answer ? "Terlalu kecil, coba angka lebih besar!" : "Terlalu besar, coba angka lebih kecil!";
            input.select();
        }
    });

    restart.addEventListener("click", startGame);
    startGame();
}

function initializeSnakeGame() {
    const canvas = document.getElementById("snake-canvas");
    const status = document.getElementById("snake-status");
    const scoreDisplay = document.getElementById("snake-score");
    const startButton = document.getElementById("snake-start");
    const controls = document.querySelectorAll("[data-snake-direction]");
    if (!(canvas instanceof HTMLCanvasElement) || !status || !scoreDisplay || !startButton) return;

    const context = canvas.getContext("2d");
    if (!context) {
        status.textContent = "Game Snake tidak dapat dimuat di browser ini.";
        startButton.disabled = true;
        return;
    }

    const cellSize = 16;
    const cellCount = canvas.width / cellSize;
    const directions = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }
    };
    let snake = [];
    let food = { x: 14, y: 10 };
    let direction = directions.right;
    let nextDirection = direction;
    let score = 0;
    let timer;
    let running = false;

    document.addEventListener("game:change", (event) => {
        if (event.detail.game === "snake" || !running) return;
        running = false;
        window.clearInterval(timer);
        status.textContent = `Game dihentikan. Skormu ${score}. Tekan Main lagi untuk mencoba kembali.`;
        startButton.textContent = "Main lagi";
    });

    function drawBoard() {
        context.fillStyle = "#030712";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.strokeStyle = "#1f2937";
        context.lineWidth = 0.5;
        for (let position = 0; position <= canvas.width; position += cellSize) {
            context.beginPath();
            context.moveTo(position, 0);
            context.lineTo(position, canvas.height);
            context.stroke();
            context.beginPath();
            context.moveTo(0, position);
            context.lineTo(canvas.width, position);
            context.stroke();
        }

        context.fillStyle = "#f472b6";
        context.beginPath();
        context.arc(
            food.x * cellSize + cellSize / 2,
            food.y * cellSize + cellSize / 2,
            cellSize * 0.36,
            0,
            Math.PI * 2
        );
        context.fill();

        snake.forEach((segment, index) => {
            context.fillStyle = index === 0 ? "#67e8f9" : "#3b82f6";
            context.fillRect(
                segment.x * cellSize + 1,
                segment.y * cellSize + 1,
                cellSize - 2,
                cellSize - 2
            );
        });
    }

    function placeFood() {
        const emptyCells = [];
        for (let y = 0; y < cellCount; y += 1) {
            for (let x = 0; x < cellCount; x += 1) {
                if (!snake.some((segment) => segment.x === x && segment.y === y)) {
                    emptyCells.push({ x, y });
                }
            }
        }

        if (emptyCells.length === 0) return false;
        food = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        return true;
    }

    function endGame(message) {
        running = false;
        window.clearInterval(timer);
        status.textContent = message;
        startButton.textContent = "Main lagi";
    }

    function moveSnake() {
        direction = nextDirection;
        const head = {
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y
        };
        const ateFood = head.x === food.x && head.y === food.y;
        const bodyToCheck = ateFood ? snake : snake.slice(0, -1);
        const hitWall = head.x < 0 || head.x >= cellCount || head.y < 0 || head.y >= cellCount;

        if (hitWall || bodyToCheck.some((segment) => segment.x === head.x && segment.y === head.y)) {
            endGame(`Game over! Skormu ${score}. Tekan Main lagi untuk mencoba kembali.`);
            return;
        }

        snake.unshift(head);
        if (ateFood) {
            score += 1;
            scoreDisplay.textContent = String(score);
            if (!placeFood()) {
                endGame(`Kamu menang! Skor sempurna: ${score} 🎉`);
                return;
            }
        } else {
            snake.pop();
        }

        drawBoard();
    }

    function changeDirection(name) {
        const requestedDirection = directions[name];
        if (!requestedDirection || !running) return;
        if (requestedDirection.x + nextDirection.x === 0
            && requestedDirection.y + nextDirection.y === 0) return;
        nextDirection = requestedDirection;
    }

    startButton.addEventListener("click", () => {
        window.clearInterval(timer);
        snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        direction = directions.right;
        nextDirection = direction;
        score = 0;
        scoreDisplay.textContent = "0";
        placeFood();
        drawBoard();
        running = true;
        status.textContent = "Game dimulai! Arahkan ular ke buah.";
        startButton.textContent = "Ulangi game";
        canvas.focus();
        timer = window.setInterval(moveSnake, 130);
    });

    controls.forEach((button) => {
        button.addEventListener("click", () => changeDirection(button.dataset.snakeDirection));
    });

    document.addEventListener("keydown", (event) => {
        if (!running || !canvas.closest("#snake-game").contains(document.activeElement)) return;
        const keyDirections = {
            ArrowUp: "up",
            w: "up",
            ArrowDown: "down",
            s: "down",
            ArrowLeft: "left",
            a: "left",
            ArrowRight: "right",
            d: "right"
        };
        const requestedDirection = keyDirections[event.key] || keyDirections[event.key.toLowerCase()];
        if (!requestedDirection) return;
        event.preventDefault();
        changeDirection(requestedDirection);
    });

    drawBoard();
}

function initializeTicTacToe() {
    const board = document.getElementById("tictactoe-board");
    const status = document.getElementById("tictactoe-status");
    const restart = document.getElementById("tictactoe-restart");
    if (!board || !status || !restart) return;

    const winningLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    let cells = Array(9).fill("");
    let currentPlayer = "X";
    let finished = false;

    function resetGame() {
        cells = Array(9).fill("");
        currentPlayer = "X";
        finished = false;
        status.textContent = "Giliran pemain X.";
        board.querySelectorAll("button").forEach((cell, index) => {
            cell.textContent = "";
            cell.disabled = false;
            cell.classList.remove("is-winning");
            cell.setAttribute("aria-label", `Kotak ${index + 1}, kosong`);
        });
    }

    board.querySelectorAll("button").forEach((cell, index) => {
        cell.addEventListener("click", () => {
            if (finished || cells[index]) return;

            cells[index] = currentPlayer;
            cell.textContent = currentPlayer;
            cell.setAttribute("aria-label", `Kotak ${index + 1}, ${currentPlayer}`);

            const winningLine = winningLines.find((line) => line.every((position) =>
                cells[position] === currentPlayer
            ));

            if (winningLine) {
                finished = true;
                winningLine.forEach((position) => {
                    board.querySelectorAll("button")[position].classList.add("is-winning");
                });
                status.textContent = `Pemain ${currentPlayer} menang! 🎉`;
                board.querySelectorAll("button").forEach((button) => {
                    button.disabled = true;
                });
                return;
            }

            if (cells.every(Boolean)) {
                finished = true;
                status.textContent = "Seri! Tekan Main lagi untuk mengulang.";
                return;
            }

            currentPlayer = currentPlayer === "X" ? "O" : "X";
            status.textContent = `Giliran pemain ${currentPlayer}.`;
        });
    });

    restart.addEventListener("click", resetGame);
    resetGame();
}

function initializeWhackAMole() {
    const board = document.getElementById("whack-board");
    const status = document.getElementById("whack-status");
    const scoreDisplay = document.getElementById("whack-score");
    const startButton = document.getElementById("whack-start");
    if (!board || !status || !scoreDisplay || !startButton) return;

    const holes = [...board.querySelectorAll("[data-whack-hole]")];
    let score = 0;
    let timeLeft = 20;
    let moleIndex = -1;
    let moveTimer;
    let clockTimer;
    let running = false;

    function clearMole() {
        window.clearInterval(moveTimer);
        window.clearInterval(clockTimer);
        running = false;
        moleIndex = -1;
        holes.forEach((hole) => {
            hole.classList.remove("has-mole");
            hole.textContent = "•";
            hole.setAttribute("aria-label", "Lubang kosong");
        });
    }

    function finishGame() {
        clearMole();
        status.textContent = `Waktu habis! Skormu ${score}. Tekan Main lagi untuk mencoba kembali.`;
        startButton.textContent = "Main lagi";
    }

    function moveMole() {
        let nextIndex = Math.floor(Math.random() * holes.length);
        if (holes.length > 1 && nextIndex === moleIndex) {
            nextIndex = (nextIndex + 1) % holes.length;
        }
        holes.forEach((hole, index) => {
            const isMole = index === nextIndex;
            hole.classList.toggle("has-mole", isMole);
            hole.textContent = isMole ? "🐹" : "•";
            hole.setAttribute("aria-label", isMole ? "Pukul tikus tanah" : "Lubang kosong");
        });
        moleIndex = nextIndex;
    }

    document.addEventListener("game:change", (event) => {
        if (event.detail.game === "whack" || !running) return;
        clearMole();
        status.textContent = `Game dihentikan. Skormu ${score}. Tekan Main lagi untuk mencoba kembali.`;
        startButton.textContent = "Main lagi";
    });

    holes.forEach((hole, index) => {
        hole.addEventListener("click", () => {
            if (!running || index !== moleIndex) return;
            score += 1;
            scoreDisplay.textContent = String(score);
            hole.classList.remove("has-mole");
            hole.textContent = "✨";
            hole.setAttribute("aria-label", "Tikus terkena");
            moleIndex = -1;
            status.textContent = `Bagus! Skor: ${score}. Waktu tersisa ${timeLeft} detik.`;
        });
    });

    startButton.addEventListener("click", () => {
        clearMole();
        score = 0;
        timeLeft = 20;
        scoreDisplay.textContent = "0";
        running = true;
        startButton.textContent = "Mulai ulang";
        status.textContent = `Pukul tikus yang muncul! Waktu: ${timeLeft} detik.`;
        moveMole();
        moveTimer = window.setInterval(moveMole, 800);
        clockTimer = window.setInterval(() => {
            timeLeft -= 1;
            if (timeLeft <= 0) {
                finishGame();
                return;
            }
            status.textContent = `Pukul tikus yang muncul! Waktu: ${timeLeft} detik. Skor: ${score}.`;
        }, 1000);
    });
}

function initializePong() {
    const canvas = document.getElementById("pong-canvas");
    const status = document.getElementById("pong-status");
    const scoreDisplay = document.getElementById("pong-score");
    const startButton = document.getElementById("pong-start");
    const controls = document.querySelectorAll("[data-pong-move]");
    if (!(canvas instanceof HTMLCanvasElement) || !status || !scoreDisplay || !startButton) return;

    const context = canvas.getContext("2d");
    if (!context) {
        status.textContent = "Game Pong tidak dapat dimuat di browser ini.";
        startButton.disabled = true;
        return;
    }

    const paddleWidth = 10;
    const paddleHeight = 68;
    const paddleInset = 20;
    const winningScore = 5;
    let playerY = (canvas.height - paddleHeight) / 2;
    let computerY = playerY;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballVelocityX = 4;
    let ballVelocityY = 2.5;
    let playerScore = 0;
    let computerScore = 0;
    let timer;
    let running = false;

    function drawCourt() {
        context.fillStyle = "#030712";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = "#374151";
        context.setLineDash([8, 8]);
        context.beginPath();
        context.moveTo(canvas.width / 2, 0);
        context.lineTo(canvas.width / 2, canvas.height);
        context.stroke();
        context.setLineDash([]);

        context.fillStyle = "#67e8f9";
        context.fillRect(paddleInset, playerY, paddleWidth, paddleHeight);
        context.fillStyle = "#a78bfa";
        context.fillRect(canvas.width - paddleInset - paddleWidth, computerY, paddleWidth, paddleHeight);
        context.fillStyle = "#f9fafb";
        context.beginPath();
        context.arc(ballX, ballY, 7, 0, Math.PI * 2);
        context.fill();
    }

    function updateScore() {
        scoreDisplay.textContent = `${playerScore} - ${computerScore}`;
    }

    function resetBall(direction) {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballVelocityX = 4 * direction;
        ballVelocityY = (Math.random() * 4) - 2;
    }

    function stopGame(message) {
        running = false;
        window.clearInterval(timer);
        status.textContent = message;
        startButton.textContent = "Main lagi";
        drawCourt();
    }

    function tick() {
        ballX += ballVelocityX;
        ballY += ballVelocityY;

        if (ballY <= 7 || ballY >= canvas.height - 7) {
            ballVelocityY *= -1;
            ballY = Math.max(7, Math.min(canvas.height - 7, ballY));
        }

        const computerMovement = (ballY - (computerY + paddleHeight / 2)) * 0.075;
        computerY += Math.max(-3.2, Math.min(3.2, computerMovement));
        computerY = Math.max(0, Math.min(canvas.height - paddleHeight, computerY));

        const playerCollisionX = paddleInset + paddleWidth + 7;
        if (ballVelocityX < 0 && ballX <= playerCollisionX
            && ballY >= playerY && ballY <= playerY + paddleHeight) {
            ballX = playerCollisionX;
            ballVelocityX = Math.min(8, Math.abs(ballVelocityX) * 1.04);
            ballVelocityY = Math.max(-6, Math.min(6,
                ballVelocityY + ((ballY - (playerY + paddleHeight / 2)) / (paddleHeight / 2)) * 1.5
            ));
        }

        const computerCollisionX = canvas.width - paddleInset - paddleWidth - 7;
        if (ballVelocityX > 0 && ballX >= computerCollisionX
            && ballY >= computerY && ballY <= computerY + paddleHeight) {
            ballX = computerCollisionX;
            ballVelocityX = -Math.min(8, Math.abs(ballVelocityX) * 1.04);
            ballVelocityY = Math.max(-6, Math.min(6,
                ballVelocityY + ((ballY - (computerY + paddleHeight / 2)) / (paddleHeight / 2)) * 1.5
            ));
        }

        if (ballX < 0) {
            computerScore += 1;
            updateScore();
            if (computerScore >= winningScore) {
                stopGame("Poin untuk komputer! Coba lagi untuk membalas.");
                return;
            }
            resetBall(1);
        } else if (ballX > canvas.width) {
            playerScore += 1;
            updateScore();
            if (playerScore >= winningScore) {
                stopGame("Kamu menang! 🏆 Tekan Main lagi untuk pertandingan baru.");
                return;
            }
            resetBall(-1);
        }

        drawCourt();
    }

    function movePlayerPaddle(position) {
        playerY = Math.max(0, Math.min(canvas.height - paddleHeight, position));
        drawCourt();
    }

    document.addEventListener("game:change", (event) => {
        if (event.detail.game === "pong" || !running) return;
        stopGame(`Game dihentikan. Skor ${playerScore} - ${computerScore}.`);
    });

    startButton.addEventListener("click", () => {
        window.clearInterval(timer);
        playerScore = 0;
        computerScore = 0;
        playerY = (canvas.height - paddleHeight) / 2;
        computerY = playerY;
        resetBall(Math.random() < 0.5 ? -1 : 1);
        updateScore();
        running = true;
        status.textContent = "Gunakan ↑/↓ atau W/S, atau gerakkan mouse di area permainan.";
        startButton.textContent = "Ulangi pertandingan";
        canvas.focus();
        drawCourt();
        timer = window.setInterval(tick, 16);
    });

    canvas.addEventListener("pointermove", (event) => {
        const bounds = canvas.getBoundingClientRect();
        const scaleY = canvas.height / bounds.height;
        movePlayerPaddle((event.clientY - bounds.top) * scaleY - paddleHeight / 2);
    });

    controls.forEach((button) => {
        button.addEventListener("click", () => {
            movePlayerPaddle(playerY + Number(button.dataset.pongMove) * 44);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (!running || !canvas.closest("#pong-game").contains(document.activeElement)) return;
        const key = event.key.toLowerCase();
        if (event.key === "ArrowUp" || key === "w") {
            event.preventDefault();
            movePlayerPaddle(playerY - 30);
        } else if (event.key === "ArrowDown" || key === "s") {
            event.preventDefault();
            movePlayerPaddle(playerY + 30);
        }
    });

    updateScore();
    drawCourt();
}

function initializeActiveNavigation() {
    const sectionIds = ["home", "about", "portfolio", "games", "contact"];
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let current = "";

        sectionIds.forEach((id) => {
            const section = document.getElementById(id);
            if (section && window.scrollY >= section.offsetTop - 80) {
                current = id;
            }
        });

        navLinks.forEach((link) => {
            link.classList.toggle(
                "text-blue-400",
                link.getAttribute("href") === `#${current}`
            );
        });
    }, { passive: true });
}

function initializeHeaderScrollEffect() {
    const header = document.getElementById("main-header");

    window.addEventListener("scroll", () => {
        if (!header) return;

        header.classList.toggle("backdrop-blur-lg", window.scrollY > 30);
        header.classList.toggle("shadow-2xl", window.scrollY > 30);
        header.classList.toggle("bg-opacity-90", window.scrollY > 30);
    }, { passive: true });
}

function initializeScrollAnimations() {
    const elements = document.querySelectorAll(".fade-in-section");

    if (!("IntersectionObserver" in window)) {
        elements.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const element = entry.target;
            const isStaggered = element.classList.contains("project-stagger")
                || element.classList.contains("about-stagger")
                || element.classList.contains("contact-stagger");

            if (isStaggered) {
                const delay = Number.parseInt(element.dataset.delay || "0", 10);
                window.setTimeout(() => {
                    element.classList.add("is-visible");
                    element.style.opacity = "1";
                    element.style.transform = "none";
                }, delay * 220);
            } else {
                element.classList.add("is-visible");
            }

            currentObserver.unobserve(element);
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
    });

    elements.forEach((element) => observer.observe(element));
}

loadComponents().catch((error) => {
    console.error(error);
    document.body.insertAdjacentHTML(
        "afterbegin",
        `<p style="padding:1rem;color:#fca5a5">Komponen halaman gagal dimuat. Jalankan website melalui local server.</p>`
    );
});

// Dibuat global karena dipanggil dari atribut onclick pada komponen HTML.
window.toggleDoc = toggleDoc;
window.showImgModal = showImgModal;
window.closeImgModal = closeImgModal;
