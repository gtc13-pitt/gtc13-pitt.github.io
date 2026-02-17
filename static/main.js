document.addEventListener('DOMContentLoaded', () => {
    // Intercept clicks on links
    document.body.addEventListener('click', e => {
        const link = e.target.closest('a');

        // Only intercept internal links that are not hash links or download links
        if (link &&
            link.href.startsWith(window.location.origin) &&
            !link.hash &&
            !link.hasAttribute('download') &&
            link.target !== '_blank') {

            e.preventDefault();
            navigateTo(link.href);
        }
    });

    // Handle Back/Forward buttons
    window.addEventListener('popstate', () => {
        loadPage(window.location.href, false);
    });

    // Initial Fade In
    setTimeout(() => {
        const main = document.querySelector('main');
        if (main) main.classList.remove('fade-out');
    }, 100); // Short delay to ensure transition triggers
});

async function navigateTo(url) {
    try {
        await loadPage(url, true);
    } catch (error) {
        console.error('Navigation failed, falling back to normal load', error);
        window.location.href = url;
    }
}

async function loadPage(url, pushState) {
    // 1. Fetch the new page
    const response = await fetch(url);
    if (!response.ok) throw new Error('Page not found');
    const text = await response.text();

    // 2. Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // 3. Fade Out current content
    const currentMain = document.querySelector('main');
    currentMain.classList.add('fade-out');

    // Wait for the transition to finish (matches css 0.3s)
    await new Promise(r => setTimeout(r, 300));

    // 4. Swap the Content
    const newContent = doc.querySelector('main').innerHTML;
    const newTitle = doc.querySelector('title').innerText;

    currentMain.innerHTML = newContent;
    document.title = newTitle;

    // 5. Update History
    if (pushState) {
        history.pushState({}, '', url);
    }

    // 6. Scroll to top and Fade In
    window.scrollTo(0, 0);
    currentMain.classList.remove('fade-out');

    // 7. Re-initialize scripts based on page content
    initPageScripts();
}

// Flag to track if the landing animation has run
window.hasRunLandingAnimation = false;

function initPageScripts() {
    // Typewriter Effect
    const typewriterEl = document.getElementById("typewriter");
    if (typewriterEl) {
        const text = "Hello, World.";
        typewriterEl.textContent = ""; // Clear existing text

        // If it has already run, just show the text immediately
        // if (window.hasRunLandingAnimation) {
        //    typewriterEl.textContent = text;
        //    return;
        // }
        // REMOVED at user request to play animation every time

        let i = 0;

        function typeWriter() {
            if (i < text.length) {
                typewriterEl.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 80);
            } else {
                // Animation finished
                window.hasRunLandingAnimation = true;
            }
        }

        // Start typing after a short delay
        setTimeout(typeWriter, 500);
    }
}

// Initial load check
initPageScripts();
