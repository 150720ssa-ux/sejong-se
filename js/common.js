// 공통 헤더/푸터와 각 페이지 내용을 data.js 값으로 그린다.
const MENU = [
  { href: "about.html", label: "협의회 소개" },
  { href: "members.html", label: "기업현황" },
  { href: "news.html", label: "활동·소식" },
  { href: "about.html#location", label: "오시는 길" },
];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = (sel) => document.querySelector(sel);
const byDateDesc = (a, b) => b.date.localeCompare(a.date);

// field는 문자열 또는 배열(여러 분야)
const fieldsOf = (m) => [].concat(m.field || []);

function filterMembers(list, field, keyword) {
  const k = keyword.trim().toLowerCase();
  return list.filter((m) =>
    (field === "전체" || fieldsOf(m).includes(field)) &&
    (!k || (m.name + m.desc).toLowerCase().includes(k)));
}

function renderLayout() {
  const page = location.pathname.split("/").pop() || "index.html";
  $("#site-header").innerHTML = `
    <div class="wrap util"><a href="index.html">홈으로</a><a href="about.html#location">오시는 길</a><a href="mailto:${esc(SITE.email)}">문의하기</a></div>
    <div class="wrap header-inner">
      <a class="logo" href="index.html"><img src="${esc(SITE.logo)}" alt="${esc(SITE.name)}"></a>
      <button class="menu-btn" aria-expanded="false" aria-controls="gnb" aria-label="메뉴 열기">☰</button>
      <nav id="gnb"><ul>
        ${MENU.map((m) => `<li><a href="${m.href}"${m.href === page ? ' aria-current="page"' : ""}>${m.label}</a></li>`).join("")}
      </ul></nav>
    </div>`;
  const btn = $(".menu-btn");
  btn.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    btn.setAttribute("aria-expanded", open);
  });

  const sns = Object.entries({ 블로그: SITE.sns.blog, 인스타그램: SITE.sns.instagram, 유튜브: SITE.sns.youtube })
    .filter(([, url]) => url)
    .map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`).join("");
  $("#site-footer").innerHTML = `
    <div class="wrap">
      <nav class="foot-links" aria-label="하단 메뉴">${MENU.map((m) => `<a href="${m.href}">${m.label}</a>`).join("")}</nav>
      <p>${esc(SITE.name)} · 주소 : ${esc(SITE.address)}</p>
      <p>대표전화 : <b class="tel">${esc(SITE.tel)}</b> · 팩스 : ${esc(SITE.fax)} · 이메일 : ${esc(SITE.email)} · 회장 ${esc(SITE.ceo)}</p>
      ${sns ? `<p class="sns">${sns}</p>` : ""}
      <p class="copy">COPYRIGHT © ${new Date().getFullYear()} ${esc(SITE.nameEn)}. ALL RIGHTS RESERVED.</p>
    </div>`;
}

const memberCard = (m) => `
  <article class="card member">
    ${m.svi ? `<span class="svi-badge" title="2026 사회적가치지표(SVI) 측정 우수"><img src="images/svi-excellent.png" alt=""><b>SVI 우수</b></span>` : ""}
    ${m.logo ? `<div class="member-logo"><img src="${esc(m.logo)}" alt="${esc(m.name)} 로고" loading="lazy"></div>` : ""}
    <div class="tags">${m.type ? `<span class="tag tag-${m.type === "인증" ? "cert" : "pre"}">${esc(m.type)}사회적기업</span>` : ""}${fieldsOf(m).map((f) => `<span class="tag">${esc(f)}</span>`).join("")}</div>
    <h3>${m.url ? `<a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.name)}</a>` : esc(m.name)}</h3>
    <p>${esc(m.desc)}</p>
    ${m.ceo ? `<p class="meta">대표 ${esc(m.ceo)}</p>` : ""}
    ${m.tel ? `<p class="meta">☎ ${esc(m.tel)}</p>` : ""}
  </article>`;

const postCard = (p) => `
  <article class="card post">
    ${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy">` : ""}
    ${p.credit ? `<small class="credit">${esc(p.credit)}</small>` : ""}
    <div class="tags"><span class="tag tag-${p.category === "공지" ? "notice" : "cert"}">${esc(p.category)}</span><time>${esc(p.date)}</time></div>
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.body)}</p>
    ${p.link ? `<p class="post-link"><a class="btn" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.linkLabel || "바로가기")}</a></p>` : ""}
  </article>`;

const PAGES = {
  home() {
    $("#hero-title").textContent = "함께 성장하는 세종, 사회적기업이 만들어갑니다";
    $("#hero-desc").textContent = SITE.slogan;
    $("#hero-slides").innerHTML = HERO_IMAGES.map((src, i) => `<img src="${esc(src)}" alt=""${i ? ' loading="lazy"' : ' class="on"'}>`).join("");
    $("#hero-dots").innerHTML = HERO_IMAGES.map((_, i) => `<button type="button" aria-label="${i + 1}번 사진"${i ? "" : ' aria-current="true"'}></button>`).join("");
    const slides = document.querySelectorAll("#hero-slides img"), dots = document.querySelectorAll("#hero-dots button");
    let cur = 0;
    const show = (n) => {
      slides[cur].classList.remove("on"); dots[cur].removeAttribute("aria-current");
      cur = n % slides.length;
      slides[cur].classList.add("on"); dots[cur].setAttribute("aria-current", "true");
    };
    dots.forEach((d, i) => d.addEventListener("click", () => show(i)));
    if (slides.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(() => show(cur + 1), 5000);

    $("#quick-members").innerHTML = `인증 ${MEMBERS.filter((m) => m.type === "인증").length} · 예비 ${MEMBERS.filter((m) => m.type === "예비").length}<br>총 ${MEMBERS.length}개 회원사`;
    const posts = [...POSTS].sort(byDateDesc);
    $("#home-notices").innerHTML = posts.filter((p) => p.category !== "활동").slice(0, 5)
      .map((p) => `<li><a href="news.html">${esc(p.title)}</a><time>${esc(p.date)}</time></li>`).join("");
    const act = posts.find((p) => p.home) || posts.find((p) => p.category === "활동" && p.image) || posts.find((p) => p.category === "활동");
    $("#home-activity").innerHTML = act ? `<a class="activity" href="news.html">${act.image ? `<img src="${esc(act.image)}" alt="${esc(act.title)}">` : ""}<strong>${esc(act.title)}</strong><time>${esc(act.date)}</time></a>` : "";
    $("#home-members").innerHTML = MEMBERS.slice(0, 6).map(memberCard).join("");
    $("#home-orgs").innerHTML = RELATED_ORGS.map((o) => `<a href="${esc(o.url)}" target="_blank" rel="noopener">${esc(o.name)}</a>`).join("");
  },

  about() {
    $("#about-intro").textContent = SITE.intro;
    $("#greeting").innerHTML = (GREETING.photo ? `<img class="greeting-photo" src="${esc(GREETING.photo)}" alt="${esc(GREETING.name)}">` : "") +
      `<div>${GREETING.paragraphs.map((t) => `<p>${esc(t)}</p>`).join("")}<p class="sign">${esc(GREETING.name)}</p></div>`;
    $("#business").innerHTML = BUSINESS.map((b) => `<article class="card"><h3>${esc(b.title)}</h3><p>${esc(b.desc)}</p></article>`).join("");
    $("#history").innerHTML = HISTORY.map((h) => `<li><strong>${esc(h.year)}</strong><ul>${h.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></li>`).join("");
    $("#schedule").innerHTML = SCHEDULE.map((s) => `<div class="org-row"><strong>${esc(s.month)}</strong><span>${esc(s.items)}</span></div>`).join("");
    $("#organization").innerHTML = ORGANIZATION.map((o) => `<div class="org-row"><strong>${esc(o.role)}</strong><span>${o.names.map(esc).join(", ")}</span></div>`).join("");
    $("#location-info").innerHTML = `<p><strong>주소</strong> ${esc(SITE.address)}</p><p><strong>전화</strong> ${esc(SITE.tel)} · <strong>팩스</strong> ${esc(SITE.fax)}</p><p><strong>이메일</strong> ${esc(SITE.email)}</p><p><a class="btn" href="${esc(SITE.mapUrl)}" target="_blank" rel="noopener">지도에서 보기</a></p>`;
  },

  members() {
    let field = "전체";
    const draw = () => {
      const list = filterMembers(MEMBERS, field, $("#member-search").value);
      $("#member-count").textContent = `${list.length}개 기업`;
      $("#member-list").innerHTML = list.map(memberCard).join("") || `<p class="empty">검색 결과가 없습니다.</p>`;
    };
    $("#member-filters").innerHTML = ["전체", ...FIELDS].map((f) => `<button type="button" aria-pressed="${f === field}">${esc(f)}</button>`).join("");
    $("#member-filters").addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") return;
      field = e.target.textContent;
      $("#member-filters").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === e.target));
      draw();
    });
    $("#member-search").addEventListener("input", draw);
    draw();
  },

  news() {
    let cat = "전체";
    const draw = () => {
      const list = POSTS.filter((p) => cat === "전체" || p.category === cat).sort(byDateDesc);
      $("#post-list").innerHTML = list.map(postCard).join("") || `<p class="empty">등록된 글이 없습니다.</p>`;
    };
    $("#post-filters").addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") return;
      cat = e.target.textContent;
      $("#post-filters").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === e.target));
      draw();
    });
    draw();
  },
};

// 필터 자체 점검 (콘솔에 실패만 표시)
console.assert(filterMembers([{ name: "가", desc: "환경", field: "환경" }, { name: "나", desc: "", field: "교육" }], "환경", "").length === 1, "filterMembers: field");
console.assert(filterMembers([{ name: "다", desc: "", field: ["제조", "교육"] }], "교육", "").length === 1, "filterMembers: multi field");
console.assert(filterMembers([{ name: "초록", desc: "", field: "환경" }], "전체", " 초록 ").length === 1, "filterMembers: keyword");

renderLayout();
PAGES[document.body.dataset.page]?.();
