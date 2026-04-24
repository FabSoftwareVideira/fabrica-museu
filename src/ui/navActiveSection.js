export const setupNavActiveSection = () => {
    const navLinks = Array.from(
        document.querySelectorAll('.navbar-end .navbar-item[href]')
    ).filter((a) => (a.getAttribute('href') || '').startsWith('#'));

    if (navLinks.length === 0) return;

    const sections = navLinks
        .map((a) => {
            const hash = a.getAttribute('href').replace(/^.*#/, '');
            const section = document.getElementById(hash);
            return section ? { id: hash, section } : null;
        })
        .filter(Boolean);

    if (sections.length === 0) return;

    const setActive = (id) => {
        navLinks.forEach((a) => {
            const hash = a.getAttribute('href').replace(/^.*#/, '');
            a.classList.toggle('is-active', hash === id);
        });
    };

    const getActiveSectionId = () => {
        const navHeight = document.querySelector('.navbar')?.offsetHeight || 64;
        const activationLine = navHeight + 20;
        let activeId = sections[0].id;

        sections.forEach(({ id, section }) => {
            if (section.getBoundingClientRect().top <= activationLine) activeId = id;
        });

        return activeId;
    };

    let rafScheduled = false;
    const updateFromScroll = () => {
        if (rafScheduled) return;
        rafScheduled = true;
        window.requestAnimationFrame(() => {
            setActive(getActiveSectionId());
            rafScheduled = false;
        });
    };

    navLinks.forEach((a) => {
        a.addEventListener('click', () => {
            setActive(a.getAttribute('href').replace(/^.*#/, ''));
            updateFromScroll();
        });
    });

    window.addEventListener('scroll', updateFromScroll, { passive: true });
    window.addEventListener('resize', updateFromScroll);
    updateFromScroll();
};
