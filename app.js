// Simple tabbed site that renders JSON data without any framework
async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v);
  });
  children.forEach(c => node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return node;
}

function parseDate(d){
  // Accept YYYY-MM-DD or YYYY-MM or YYYY
  const parts = (d||'').split('-').map(x=>parseInt(x,10));
  const y = parts[0]||0, m=(parts[1]||1)-1, day=parts[2]||1;
  return new Date(y,m,day);
}

function renderJobs(jobs) {
  const sorted = [...jobs].sort((a,b)=> parseDate(b.date)-parseDate(a.date));
  return el('div', { class: 'section' }, sorted.map(j => {
    const header = el('div', { class: 'item-header' }, [
      el('h3', {}, [j.title + ' ']),
      el('span', { class: 'muted' }, [`@ ${j.company}`]),
    ]);
    const meta = el('div', { class: 'meta' }, [
      el('span', {}, [j.range]),
      j.location ? el('span', { class: 'dot' }, ['•']) : null,
      j.location ? el('span', {}, [j.location]) : null,
    ].filter(Boolean));

    const bullets = el('ul', {}, (j.bullets || []).map(b => el('li', {}, [b])));
    const link = j.url ? el('p', {}, [el('a', { href: j.url, class: 'inline' }, ['Website'])]) : null;
    return el('article', { class: 'card' }, [header, meta, bullets, link].filter(Boolean));
  }));
}

function renderProjects(projects, featured) {
  const container = el('div', {}, []);
  if (featured && featured.length) {
    container.appendChild(el('h2', {}, ['Featured']));
    container.appendChild(renderFeatured(featured));
    container.appendChild(el('hr'));
  }
  const ul = el('ul', { class: 'project-list' });
  projects.filter(p => p.showInProjects !== false).forEach(p => {
    const title = el('div', { class: 'project-title' }, [
      el('h3', {}, [p.title]),
      el('span', { class: 'project-links' }, [
        p.github ? el('a', { href: p.github, class: 'inline' }, ['GitHub']) : null,
        p.external ? el('span', { class: 'sep' }, ['·']) : null,
        p.external ? el('a', { href: p.external, class: 'inline' }, ['Live']) : null,
      ].filter(Boolean)),
    ]);
    const summary = p.summary ? el('p', { class: 'muted' }, [p.summary]) : null;
    const chips = (p.tech && p.tech.length)
      ? el('div', { class: 'chips' }, p.tech.map(t => el('span', { class: 'chip' }, [t])))
      : null;
    const li = el('li', { class: 'project-row' }, [title, summary, chips].filter(Boolean));
    ul.appendChild(li);
  });
  container.appendChild(ul);
  return container;
}

function renderFeatured(items) {
  return el('div', { class: 'gallery' }, items.map(it => {
    const img = el('img', { src: it.image, alt: it.title, loading: 'lazy' });
    const cap = el('div', { class: 'caption' }, [el('strong', {}, [it.title]), it.summary ? el('p', {}, [it.summary]) : null].filter(Boolean));
    const card = el('figure', { class: 'figure' }, [img, cap]);
    return it.link ? el('a', { href: it.link, class: 'no-underline' }, [card]) : card;
  }));
}

function renderPosts(posts) {
  return el('div', { class: 'section' }, posts.map(p => {
    const title = el('h3', {}, [el('a', { href: p.slug, class: 'inline' }, [p.title])]);
    const meta = el('p', { class: 'muted' }, [p.date + (p.tags && p.tags.length ? ` • ${p.tags.join(', ')}` : '')]);
    const desc = p.description ? el('p', {}, [p.description]) : null;
    return el('article', { class: 'card' }, [title, meta, desc].filter(Boolean));
  }));
}

async function main() {
  const tabs = document.querySelectorAll('[data-tab]');
  const panel = document.getElementById('panel');

  const datasets = {
    about: null,
    jobs: () => fetchJSON('/data/jobs.json').then(renderJobs),
    projects: async () => {
      const [projects, featured] = await Promise.all([
        fetchJSON('/data/projects.json'),
        fetchJSON('/data/featured.json').catch(()=>[]),
      ]);
      return renderProjects(projects, featured);
    },
    posts: () => fetchJSON('/data/posts.json').then(renderPosts),
  };

  async function activate(tab) {
    tabs.forEach(t => t.classList.toggle('active', t === tab));
    panel.innerHTML = '';
    const key = tab.getAttribute('data-tab');
    if (key === 'about') {
      // We now render the About summary (Interests/Education) inline in the hero.
      // Keep panel empty for About.
      return;
    }
    const renderer = datasets[key];
    if (!renderer) return;
    const node = await renderer();
    panel.appendChild(node);
  }

  tabs.forEach(t => t.addEventListener('click', () => activate(t)));
  // default tab
  activate(document.querySelector('[data-tab="about"]'));
}

window.addEventListener('DOMContentLoaded', main);
