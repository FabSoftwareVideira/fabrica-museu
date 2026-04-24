export const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);

    const label = theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro';
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
        const icon = btn.querySelector('i');
        if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        btn.setAttribute('title', label);
        btn.setAttribute('aria-label', label);
    });

    document.dispatchEvent(new CustomEvent('site-theme-changed', {
        detail: { theme },
    }));
};

export const setupTheme = () => {
    let stored = null;
    try { stored = localStorage.getItem('siteTheme'); } catch (e) { }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(stored || (prefersDark ? 'dark' : 'light'));

    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            try { localStorage.setItem('siteTheme', next); } catch (e) { }
            applyTheme(next);
        });
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        let saved = null;
        try { saved = localStorage.getItem('siteTheme'); } catch (err) { }
        if (!saved) applyTheme(e.matches ? 'dark' : 'light');
    });
};
