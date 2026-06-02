const burgerBtn = document.getElementById('burgerBtn');
const mainNav = document.getElementById('mainNav');

function openMenu() {
    burgerBtn.classList.add('open');
    mainNav.classList.add('open');
}

function closeMenu() {
    burgerBtn.classList.remove('open');
    mainNav.classList.remove('open');
}

function toggleMenu() {
    burgerBtn.classList.toggle('open');
    mainNav.classList.toggle('open');
}

/* Открытие / закрытие по кнопке */
burgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
});

/* Закрытие по клику на ссылку */
document.querySelectorAll('#mainNav a').forEach(link => {
    link.addEventListener('click', () => {
        closeMenu();
    });
});

/* Закрытие по клику вне меню */
document.addEventListener('click', (e) => {
    const isClickInsideMenu = mainNav.contains(e.target);
    const isClickOnButton = burgerBtn.contains(e.target);

    if (!isClickInsideMenu && !isClickOnButton) {
        closeMenu();
    }
});

/* Закрытие по ESC */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMenu();
    }
});