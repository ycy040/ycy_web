/* script.js 
   - 서버(localhost:3000)와 통신하여 데이터를 처리합니다.
*/

const API_URL = "http://localhost:3000/api/projects";

/* ==============================================
   [MySQL] 프로젝트 관리 기능 (CRUD)
   ============================================== */

// 1. 프로젝트 목록 불러오기 (Read List)
async function fetchProjects() {
    try {
        const response = await fetch(API_URL);
        const projects = await response.json();
        const projectGrid = document.querySelector('.project-grid');
        projectGrid.innerHTML = ''; 

        // [1] 실제 프로젝트 카드들 생성
        projects.forEach(p => {
            const firstTag = p.tags ? p.tags.split(',')[0] : 'Project';
            const card = document.createElement('div');
            card.className = 'project-card';
            card.onclick = () => window.location.href = `project.html?id=${p.p_code}`;

            card.innerHTML = `
                <div class="img-wrapper"><img src="${p.img_url}" alt="${p.title}"></div>
                <div class="card-info">
                    <div class="p-tag">${firstTag}</div>
                    <div class="p-title">${p.title}</div>
                </div>
            `;
            projectGrid.appendChild(card);
        });

        // [2] 프로젝트 추가(+) 카드 생성
        const addCard = document.createElement('div');
        addCard.className = 'project-card add-card';
        addCard.onclick = () => window.location.href = 'write.html'; // 작성 페이지로 이동
        addCard.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; height:100%; font-size:50px; color:#ccc;">
                <i class="fa-solid fa-plus"></i>
            </div>
        `;
        projectGrid.appendChild(addCard);

    } catch (error) { console.error(error); }
}

/* ---------------- 상세 페이지 & 관리 (수정/삭제) ---------------- */
async function loadProjectDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    if (!projectId) return;

    try {
        const response = await fetch(`${API_URL}/${projectId}`);
        const data = await response.json();

        document.getElementById('p-title').innerText = data.title;
        document.getElementById('p-date').innerText = data.period;
        document.getElementById('p-link').href = data.github_url;
        document.getElementById('p-content').innerHTML = data.content;

        // [수정됨] 버튼 스타일을 심플하게 변경 (simple-btn 클래스 사용)
        const btnContainer = document.getElementById('admin-btns');
        if(btnContainer) {
            btnContainer.innerHTML = `
                <button class="simple-btn edit" onclick="location.href='write.html?id=${data.p_code}'">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="simple-btn delete" onclick="deleteProject('${data.p_code}')">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            `;
        }

        const tagContainer = document.getElementById('p-tags');
        tagContainer.innerHTML = '';
        if (data.tags) {
            data.tags.split(',').forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.innerText = tag.trim();
                tagContainer.appendChild(span);
            });
        }
    } catch (e) { console.error(e); }
}

/* ---------------- 상세 페이지 & 관리 (수정/삭제) ---------------- */
async function loadProjectDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    if (!projectId) return;

    try {
        const response = await fetch(`${API_URL}/${projectId}`);
        const data = await response.json();

        document.getElementById('p-title').innerText = data.title;
        document.getElementById('p-date').innerText = data.period;
        document.getElementById('p-link').href = data.github_url;
        document.getElementById('p-content').innerHTML = data.content;

        // [수정됨] 작고 심플한 버튼 적용
        const btnContainer = document.getElementById('admin-btns');
        if(btnContainer) {
            btnContainer.innerHTML = `
                <button class="simple-btn edit" onclick="location.href='write.html?id=${data.p_code}'">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="simple-btn delete" onclick="deleteProject('${data.p_code}')">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            `;
        }

        const tagContainer = document.getElementById('p-tags');
        tagContainer.innerHTML = '';
        if (data.tags) {
            data.tags.split(',').forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.innerText = tag.trim();
                tagContainer.appendChild(span);
            });
        }
    } catch (e) { console.error(e); }
}

/* ---------------- 작성/수정 페이지 로직 (write.html) ---------------- */
async function checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    if (projectId) {
        document.getElementById('form-title').innerText = "Edit Project";
        document.getElementById('p_code').value = projectId;
        document.getElementById('p_code').disabled = true;

        const response = await fetch(`${API_URL}/${projectId}`);
        const data = await response.json();
        
        document.getElementById('title').value = data.title;
        document.getElementById('period').value = data.period;
        document.getElementById('tags').value = data.tags;
        document.getElementById('github_url').value = data.github_url;
        document.getElementById('img_url').value = data.img_url;

        // [핵심 수정] DB에 있는 <br>을 다시 줄바꿈(\n)으로 바꿔서 보여줌
        // 사용자는 HTML 태그를 보지 않고 글만 수정하면 됨
        let plainText = data.content.replaceAll('<br>', '\n');
        // 혹시 모를 <h2> 같은 태그도 제거하고 내용만 남기고 싶다면 아래 주석 해제
        // plainText = plainText.replace(/<[^>]*>?/gm, ''); 
        document.getElementById('content').value = plainText;
    }
}

async function handleSaveProject(event) {
    event.preventDefault();
    const p_code = document.getElementById('p_code').value;
    
    // [핵심 수정] 사용자가 입력한 줄바꿈(\n)을 <br> 태그로 변환해서 저장
    const rawContent = document.getElementById('content').value;
    const htmlContent = rawContent.replace(/\n/g, '<br>');

    const data = {
        p_code,
        title: document.getElementById('title').value,
        period: document.getElementById('period').value,
        tags: document.getElementById('tags').value,
        github_url: document.getElementById('github_url').value,
        img_url: document.getElementById('img_url').value,
        content: htmlContent // 변환된 내용 전송
    };

    const isEdit = document.getElementById('p_code').disabled;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${API_URL}/${p_code}` : API_URL;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            alert("저장 완료!");
            location.href = 'index.html';
        } else {
            alert("저장 실패 (코드 중복 등)");
        }
    } catch (e) { console.error(e); }
}

/* ==============================================
   [MongoDB] 방명록 기능
   ============================================== */

// 1. 방명록 목록 불러오기 (Read)
async function loadGuestbook() {
    try {
        const response = await fetch('http://localhost:3000/api/guests');
        const guests = await response.json();

        const list = document.getElementById('guestbook-list');
        list.innerHTML = ''; 

        guests.forEach(g => {
            const dateStr = new Date(g.date).toLocaleDateString();

            const card = document.createElement('div');
            card.className = 'guest-card';
            
            // 삭제 버튼에 ID 연결
            card.innerHTML = `
                <div class="g-header">
                    <span class="g-user">${g.name}</span>
                    <div class="g-right">
                        <span class="g-date">${dateStr}</span>
                        <button class="del-btn" onclick="deleteGuest('${g._id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="g-msg">${g.message}</div>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        console.error("방명록 로딩 실패:", error);
    }
}

// 2. 방명록 작성하기 (Create)
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
        const response = await fetch('http://localhost:3000/api/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, message })
        });

        if (response.ok) {
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

// 3. 방명록 삭제 (Delete)
async function deleteGuest(id) {
    if (!confirm("정말 삭제하시겠습니까?")) return; 

    try {
        const response = await fetch(`http://localhost:3000/api/guests/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadGuestbook();
        } else {
            alert("삭제에 실패했습니다.");
        }
    } catch (error) {
        console.error("삭제 에러:", error);
    }
}


/* ==============================================
   [페이지 초기화] 페이지 로드 시 실행될 함수들
   ============================================== */
document.addEventListener('DOMContentLoaded', () => {
    // index.html (메인 페이지)
    if (document.querySelector('.project-grid')) {
        fetchProjects();   // 프로젝트 목록
        if (document.getElementById('guestbook-list')) {
            loadGuestbook(); // 방명록 목록
        }
    }

    // project.html (상세 페이지)
    if (document.getElementById('p-title')) {
        loadProjectDetails();
    }
    
    // write.html (작성/수정 페이지)
    if (document.getElementById('project-form')) {
        checkEditMode();
    }
});