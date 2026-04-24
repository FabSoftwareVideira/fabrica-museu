export const setupNavbarMenu = () => {
    const burger = document.getElementById('navbar-burger');
    const menu = document.getElementById('main-navbar-menu');

    if (!burger || !menu) return;

    const closeMenu = () => {
        burger.classList.remove('is-active');
        menu.classList.remove('is-active');
        burger.setAttribute('aria-expanded', 'false');
    };

    const toggleMenu = () => {
        const open = !burger.classList.contains('is-active');
        burger.classList.toggle('is-active', open);
        menu.classList.toggle('is-active', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    burger.addEventListener('click', toggleMenu);

    menu.querySelectorAll('.navbar-item[href]').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) closeMenu();
    });
};