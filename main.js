const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const formatNaira = (amount) => "\u20A6" + Math.round(amount).toLocaleString("en-NG");

const year = $("#y");
if (year) {
    year.textContent = new Date().getFullYear();
}

const header = $("header");
if (header) {
    const updateHeader = () => header.classList.toggle("s", window.scrollY > 10);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
}

const menuButton = $(".menu");
const navigation = $("#nav");
if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    $$("nav a").forEach((link) => {
        link.addEventListener("click", () => {
            navigation.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
        });
    });
}

const status = $("#status");
if (status) {
    const lagosHour = Number(new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        hour12: false,
        timeZone: "Africa/Lagos"
    }).format(new Date()));

    const isOpen = lagosHour >= 8 && lagosHour < 22;
    status.classList.toggle("off", !isOpen);
    $("span", status).textContent = isOpen
        ? "Open now, closes 10:00 PM"
        : "Closed now, opens 8:00 AM";
}

const hero = $(".hero");
if (hero) {
    hero.addEventListener("mousemove", (event) => {
        const bounds = hero.getBoundingClientRect();
        hero.style.setProperty("--hx", `${event.clientX - bounds.left}px`);
        hero.style.setProperty("--hy", `${event.clientY - bounds.top}px`);
    });
}

const timer = $("#tm");
if (timer) {
    let seconds = 0;

    setInterval(() => {
        seconds += 1;
        const pad = (value) => String(value).padStart(2, "0");

        timer.textContent = `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
        $("#cost").textContent = formatNaira(Math.ceil(seconds / 60) * 500 / 60);
        $("#pb").style.width = `${Math.min(100, seconds / 36)}%`;

        if (seconds >= 3600) seconds = 0;
    }, 1000);
}

$$(".card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
        card.style.setProperty("--my", `${event.clientY - bounds.top}px`);
    });
});

const revealElements = $$(".rv");
if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    revealElements.forEach((element) => revealObserver.observe(element));
} else {
    revealElements.forEach((element) => element.classList.add("in"));
}

const statElements = $$("[data-n]");
statElements.forEach((element) => {
    const target = Number(element.dataset.n);
    const prefix = element.dataset.p || "";
    const suffix = element.dataset.s || "";

    if (target === 0) {
        element.textContent = prefix + "0" + suffix;
        return;
    }

    let value = 0;
    const counter = setInterval(() => {
        value += Math.ceil(target / 30);
        if (value >= target) {
            value = target;
            clearInterval(counter);
        }
        element.textContent = prefix + value.toLocaleString("en-NG") + suffix;
    }, 30);
});

const prices = {
    internet: {
        name: "Internet",
        rate: 500,
        list: [
            ["1 hour", 500],
            ["2 hours", 1000],
            ["3 hours", 1500],
            ["5 hours", 2500],
            ["Full day (up to 10 hours)", 4500]
        ]
    },
    ps4: {
        name: "PS4",
        rate: 1000,
        list: [
            ["1 hour", 1000],
            ["2 hours", 2000],
            ["3 hours", 3000],
            ["5 hours", 5000],
            ["Extra controller", 500]
        ]
    },
    ps5: {
        name: "PS5",
        rate: 1500,
        list: [
            ["1 hour", 1500],
            ["2 hours", 3000],
            ["3 hours", 4500],
            ["5 hours", 7500],
            ["Extra controller", 500]
        ]
    }
};

const priceList = $("#plist");
if (priceList) {
    const hoursInput = $("#hrs");
    const totalOutput = $("#tot");
    const hoursOutput = $("#hv");
    let currentService = "internet";
    let displayedTotal = 0;

    const calculateTotal = () => {
        const hours = Number(hoursInput.value);
        const service = prices[currentService];

        hoursOutput.textContent = `${hours} ${hours > 1 ? "hours" : "hour"}`;

        const targetTotal = currentService === "internet"
            ? Math.min(hours * service.rate, 4500)
            : hours * service.rate;

        const startingTotal = displayedTotal;
        let step = 0;

        const animation = setInterval(() => {
            step += 1;
            displayedTotal = startingTotal + (targetTotal - startingTotal) * step / 12;
            totalOutput.textContent = formatNaira(displayedTotal);

            if (step >= 12) {
                clearInterval(animation);
                displayedTotal = targetTotal;
                totalOutput.textContent = formatNaira(targetTotal);
            }
        }, 20);
    };

    const drawPrices = () => {
        priceList.innerHTML = prices[currentService].list
            .map((item, index) => `
                <div style="animation-delay:${index * 60}ms">
                    <span>${item[0]}</span>
                    <b>${formatNaira(item[1])}</b>
                </div>
            `)
            .join("");

        $$("#tabs button").forEach((button) => {
            button.classList.toggle("on", button.dataset.k === currentService);
        });

        $$("#chips button").forEach((button) => {
            button.classList.toggle("on", button.dataset.k === currentService);
        });

        calculateTotal();
    };

    $$("#tabs button, #chips button").forEach((button) => {
        button.addEventListener("click", () => {
            currentService = button.dataset.k;
            drawPrices();
        });
    });

    hoursInput.addEventListener("input", calculateTotal);
    drawPrices();
}

const contactForm = $("#cf");
if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const message = `Hello MOLA Solutions, my name is ${formData.get("n")}. I want: ${formData.get("s")}. ${formData.get("m") || ""}`;

        window.open(
            `https://wa.me/2348153155081?text=${encodeURIComponent(message)}`,
            "_blank",
            "noopener,noreferrer"
        );
    });
}
