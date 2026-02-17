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
}
