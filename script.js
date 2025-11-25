/* script.js 
   - 이제 데이터(projectData)를 직접 갖고 있지 않습니다.
   - 서버(localhost:3000)에 요청해서 받아옵니다.
*/

const API_URL = "http://localhost:3000/api/projects";

/* ---------------- 메인 페이지: 프로젝트 목록 불러오기 ---------------- */
// 페이지가 로드되면 실행
document.addEventListener("DOMContentLoaded", () => {
    // 현재 페이지가 메인(index.html)이라면 프로젝트 목록을 가져옴
    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid) {
        fetchProjects();
    }
});

async function fetchProjects() {
    try {
        const response = await fetch(API_URL);
        const projects = await response.json();

        const projectGrid = document.querySelector('.project-grid');
        projectGrid.innerHTML = ''; // 기존 예시 내용 비우기

        // 서버에서 받아온 데이터로 카드 만들기
        projects.forEach(p => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.onclick = () => goToProject(p.p_code); // p_code (p1, p2) 사용

            // 태그가 문자열("JSP,Servlet")로 오므로 콤마로 잘라서 첫 번째만 보여줌
            const firstTag = p.tags ? p.tags.split(',')[0] : 'Project';

            card.innerHTML = `
                <div class="img-wrapper">
                    <img src="${p.img_url}" alt="${p.title}">
                </div>
                <div class="card-info">
                    <div class="p-tag">${firstTag}</div>
                    <div class="p-title">${p.title}</div>
                </div>
            `;
            projectGrid.appendChild(card);
        });

    } catch (error) {
        console.error("프로젝트 목록 로딩 실패:", error);
    }
}

function goToProject(id) {
    window.location.href = `project.html?id=${id}`;
}

function scrollToProjects() {
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
}


/* ---------------- 상세 페이지: 내용 불러오기 (project.html) ---------------- */
// 상세 페이지라면 실행
if (window.location.pathname.includes('project.html')) {
    loadProjectDetails();
}

async function loadProjectDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id'); // URL에서 ?id=p1 가져오기

    if (!projectId) return;

    try {
        // 상세 데이터 요청 (예: /api/projects/p1)
        const response = await fetch(`${API_URL}/${projectId}`);
        
        if (!response.ok) {
            throw new Error("프로젝트를 찾을 수 없습니다.");
        }

        const data = await response.json();

        // HTML에 데이터 채워넣기
        document.getElementById('p-title').innerText = data.title;
        document.getElementById('p-date').innerText = data.period; // DB 컬럼명 period
        document.getElementById('p-link').href = data.github_url;
        document.getElementById('p-content').innerHTML = data.content;

        // 태그 처리 (콤마로 분리)
        const tagContainer = document.getElementById('p-tags');
        tagContainer.innerHTML = '';
        
        if (data.tags) {
            const tagsArray = data.tags.split(','); // "JSP,Servlet" -> ["JSP", "Servlet"]
            tagsArray.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.innerText = tag.trim();
                tagContainer.appendChild(span);
            });
        }

    } catch (error) {
        console.error("상세 정보 로딩 실패:", error);
        document.getElementById('p-content').innerText = "프로젝트 정보를 불러오는데 실패했습니다.";
    }
}

/* ==============================================
   [MongoDB] 방명록 기능 추가
   ============================================== */

// 페이지 로드 시 방명록도 같이 불러오기
document.addEventListener("DOMContentLoaded", () => {
    // ... 기존 코드 ...
    const guestbookList = document.getElementById('guestbook-list');
    if (guestbookList) {
        loadGuestbook();
    }
});

// 1. 방명록 불러오기 (Read)
async function loadGuestbook() {
    try {
        const response = await fetch('http://localhost:3000/api/guests');
        const guests = await response.json();

        const list = document.getElementById('guestbook-list');
        list.innerHTML = ''; // 초기화

        guests.forEach(g => {
            // 날짜 예쁘게 변환 (2024-05-21)
            const dateStr = new Date(g.date).toLocaleDateString();

            const card = document.createElement('div');
            card.className = 'guest-card';
            card.innerHTML = `
                <div class="g-header">
                    <span class="g-user">${g.name}</span>
                    <span class="g-date">${dateStr}</span>
                </div>
                <div class="g-msg">${g.message}</div>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        console.error("방명록 로딩 실패:", error);
    }
}

// 2. 방명록 작성하기 (Write)
async function writeGuestbook() {
    const nameInput = document.getElementById('g-name');
    const msgInput = document.getElementById('g-message');

    const name = nameInput.value;
    const message = msgInput.value;

    if (!name || !message) {
        alert("이름과 메시지를 모두 입력해주세요!");
        return;
    }

    try {
        // 서버로 데이터 전송 (POST 요청)
        const response = await fetch('http://localhost:3000/api/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, message })
        });

        if (response.ok) {
            // 성공하면 입력창 비우고 목록 새로고침
            nameInput.value = '';
            msgInput.value = '';
            loadGuestbook(); 
        } else {
            alert("저장에 실패했습니다.");
        }
    } catch (error) {
        console.error("전송 에러:", error);
    }
}