'use strict';

/* ============================================================
   Константы и DOM-элементы
   ============================================================ */

const GET_URL  = 'https://jsonplaceholder.typicode.com/posts?_limit=5';
const POST_URL = 'https://jsonplaceholder.typicode.com/posts';

const loadBtn    = document.querySelector('#load-btn');
const createBtn  = document.querySelector('#create-btn');
const form       = document.querySelector('#create-form');
const titleInput = document.querySelector('#title');
const bodyInput  = document.querySelector('#body');
const postsEl    = document.querySelector('#posts');
const messageEl  = document.querySelector('#message');

/* ============================================================
   Утилиты
   ============================================================ */

/**
 * Показать сообщение в области #message.
 * @param {string} text
 * @param {'info'|'success'|'error'} type
 */
function setMessage(text, type = 'info') {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

function clearMessage() {
    messageEl.textContent = '';
    messageEl.className = 'message';
}

/**
 * Отрисовка одной публикации в контейнере.
 * @param {{ id: number, title: string, body: string }} post
 */
function renderPost(post) {
    const article = document.createElement('article');
    article.className = 'post';

    const title = document.createElement('div');
    title.className = 'post-title';
    title.textContent = post.title;

    const body = document.createElement('div');
    body.className = 'post-body';
    body.textContent = post.body;

    const id = document.createElement('div');
    id.className = 'post-id';
    id.textContent = `ID: ${post.id}`;

    article.append(title, body, id);
    postsEl.append(article);
}

/* ============================================================
   GET
   ============================================================ */

async function loadPosts() {
    clearMessage();
    postsEl.textContent = '';
    loadBtn.disabled = true;
    setMessage('Загрузка публикаций…', 'info');

    try {
        const response = await fetch(GET_URL);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const posts = await response.json();
        posts.forEach(renderPost);
        setMessage(`Загружено публикаций: ${posts.length}`, 'success');
    } catch (error) {
        setMessage(`Не удалось загрузить публикации: ${error.message}`, 'error');
    } finally {
        loadBtn.disabled = false;
    }
}

/* ============================================================
   POST
   ============================================================ */

function validateCreate() {
    const title = titleInput.value.trim();
    const body  = bodyInput.value.trim();

    if (!title) return { ok: false, message: 'Введите заголовок публикации.' };
    if (!body)  return { ok: false, message: 'Введите текст публикации.' };

    return { ok: true, data: { title, body } };
}

async function handleCreate(event) {
    event.preventDefault();

    const result = validateCreate();
    if (!result.ok) {
        setMessage(result.message, 'error');
        return;
    }

    createBtn.disabled = true;
    setMessage('Отправка публикации…', 'info');

    try {
        const response = await fetch(POST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: result.data.title,
                body:  result.data.body,
                userId: 1,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const created = await response.json();

        renderPost(created);
        form.reset();

        setMessage(
            `Публикация создана: «${created.title}» (ID ${created.id})`,
            'success',
        );
    } catch (error) {
        setMessage(`Не удалось создать публикацию: ${error.message}`, 'error');
    } finally {
        createBtn.disabled = false;
    }
}

/* ============================================================
   Инициализация
   ============================================================ */

function init() {
    loadBtn.addEventListener('click', loadPosts);
    form.addEventListener('submit', handleCreate);
}

init();