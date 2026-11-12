const components = [
    "header",
    "hero",
    "about",
    "portfolio",
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

    initializePortfolio();
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
}

function initializeActiveNavigation() {
    const sectionIds = ["home", "about", "portfolio", "contact"];
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
