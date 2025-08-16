class MemoApp {
    constructor() {
        this.memos = JSON.parse(localStorage.getItem('memos')) || [];
        this.categories = JSON.parse(localStorage.getItem('categories')) || this.getDefaultCategories();
        this.headerTitle = localStorage.getItem('headerTitle') || '🥰 오늘도 럭키비키 🍀';
        this.currentEditId = null;
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.isImportant = false;
        this.init();
    }

    getDefaultCategories() {
        return [
            { name: '건강', emoji: '🏃‍♀️', color: '#28a745' },
            { name: '경제공부', emoji: '💰', color: '#ffc107' },
            { name: 'AI 공부', emoji: '🤖', color: '#6f42c1' },
            { name: '약속', emoji: '📅', color: '#fd7e14' },
            { name: '집안일', emoji: '🏠', color: '#e83e8c' },
            { name: '기타', emoji: '📝', color: '#6c757d' },
            { name: '자기개발', emoji: '🚀', color: '#17a2b8' }
        ];
    }

    init() {
        this.bindEvents();
        this.renderHeader();
        this.renderCalendar();
        this.renderMemos();
        this.updateSelectedDateText();
        this.renderCategories();
    }

    bindEvents() {
        const addButton = document.getElementById('addMemo');
        const memoText = document.getElementById('memoText');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        const starButton = document.getElementById('starButton');
        const monthStatsBtn = document.getElementById('monthStatsBtn');
        const closeStatsModal = document.getElementById('closeStatsModal');
        const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
        const closeCategoryModal = document.getElementById('closeCategoryModal');
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        const headerTitle = document.getElementById('headerTitle');

        addButton.addEventListener('click', () => this.addMemo());
        memoText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.addMemo();
            }
        });
        
        prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        starButton.addEventListener('click', () => this.toggleImportance());
        monthStatsBtn.addEventListener('click', () => this.showMonthlyStats());
        closeStatsModal.addEventListener('click', () => this.hideMonthlyStats());
        manageCategoriesBtn.addEventListener('click', () => this.showCategoryModal());
        closeCategoryModal.addEventListener('click', () => this.hideCategoryModal());
        addCategoryBtn.addEventListener('click', () => this.addNewCategory());
        
        // 헤더 편집 이벤트
        if (headerTitle) {
            // 편집 시작 시 맞춤법 검사 비활성화
            headerTitle.addEventListener('focus', () => {
                headerTitle.setAttribute('spellcheck', 'false');
                headerTitle.setAttribute('autocomplete', 'off');
                headerTitle.setAttribute('autocorrect', 'off');
                headerTitle.setAttribute('autocapitalize', 'off');
            });
            
            headerTitle.addEventListener('blur', () => this.saveHeaderTitle());
            headerTitle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    headerTitle.blur();
                }
            });
        }
        
        // 모달 외부 클릭 시 닫기
        document.getElementById('monthStatsModal').addEventListener('click', (e) => {
            if (e.target.id === 'monthStatsModal') {
                this.hideMonthlyStats();
            }
        });
        
        document.getElementById('categoryModal').addEventListener('click', (e) => {
            if (e.target.id === 'categoryModal') {
                this.hideCategoryModal();
            }
        });
    }

    toggleImportance() {
        this.isImportant = !this.isImportant;
        const starButton = document.getElementById('starButton');
        
        if (this.isImportant) {
            starButton.classList.add('active');
            starButton.textContent = '⭐';
        } else {
            starButton.classList.remove('active');
            starButton.textContent = '☆';
        }
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderCalendar();
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonthText = document.getElementById('currentMonth');
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        currentMonthText.textContent = `${year}년 ${month + 1}월`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        let calendarHTML = '';
        
        // 요일 헤더
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        weekdays.forEach(day => {
            calendarHTML += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // 달력 날짜들
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = this.isSameDate(currentDate, new Date());
            const isSelected = this.isSameDate(currentDate, this.selectedDate);
            const memoCount = this.getMemoCountForDate(currentDate);
            const completedCount = this.getCompletedMemoCountForDate(currentDate);
            const hasMemo = memoCount > 0;
            
            let dayClass = 'calendar-day';
            if (!isCurrentMonth) dayClass += ' other-month';
            if (isToday) dayClass += ' today';
            if (isSelected) dayClass += ' selected';
            if (hasMemo) dayClass += ' has-memo';
            
            // 날짜를 YYYY-MM-DD 형태로 변환 (로컬 시간 기준)
            const dateStr = this.formatDateString(currentDate);
            
            calendarHTML += `
                <div class="${dayClass}" data-date="${dateStr}">
                    ${currentDate.getDate()}
                    ${hasMemo ? `<div class="memo-count-badge">${completedCount}/${memoCount}</div>` : ''}
                </div>
            `;
        }
        
        calendarGrid.innerHTML = calendarHTML;
        
        // 날짜 클릭 이벤트 추가
        const dateCells = calendarGrid.querySelectorAll('.calendar-day');
        dateCells.forEach(cell => {
            cell.addEventListener('click', () => {
                const dateStr = cell.dataset.date;
                this.selectDate(this.parseDateString(dateStr));
            });
        });
    }

    selectDate(date) {
        this.selectedDate = date;
        this.renderCalendar();
        this.renderMemos();
        this.updateSelectedDateText();
        
        // 편집 모드 해제
        if (this.currentEditId !== null) {
            this.cancelEdit();
        }
        
        // 메모 입력 영역 초기화
        this.clearMemoInput();
        
        // 선택된 날짜에 포커스
        document.getElementById('memoText').focus();
    }

    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    hasMemoForDate(date) {
        const dateStr = this.formatDateString(date);
        return this.memos.some(memo => memo.dateStr === dateStr);
    }

    getMemoCountForDate(date) {
        const dateStr = this.formatDateString(date);
        return this.memos.filter(memo => memo.dateStr === dateStr).length;
    }

    getCompletedMemoCountForDate(date) {
        const dateStr = this.formatDateString(date);
        return this.memos.filter(memo => memo.dateStr === dateStr && memo.completed).length;
    }

    updateSelectedDateText() {
        const selectedDateText = document.getElementById('selectedDateText');
        const today = new Date();
        
        if (this.isSameDate(this.selectedDate, today)) {
            selectedDateText.textContent = '오늘';
        } else {
            const year = this.selectedDate.getFullYear();
            const month = this.selectedDate.getMonth() + 1;
            const date = this.selectedDate.getDate();
            const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][this.selectedDate.getDay()];
            
            // 현재 연도가 아닌 경우 연도도 표시
            if (year === today.getFullYear()) {
                selectedDateText.textContent = `${month}월 ${date}일 (${dayOfWeek})`;
            } else {
                selectedDateText.textContent = `${year}년 ${month}월 ${date}일 (${dayOfWeek})`;
            }
        }
    }

    addMemo() {
        const memoText = document.getElementById('memoText');
        const memoCategory = document.getElementById('memoCategory');
        const memoTime = document.getElementById('memoTime');
        const content = memoText.value.trim();
        const category = memoCategory.value;
        const time = memoTime.value;

        if (!content) {
            alert('메모 내용을 입력해주세요.');
            return;
        }

        if (!category) {
            alert('카테고리를 선택해주세요.');
            return;
        }

        if (!time) {
            alert('소요 시간을 선택해주세요.');
            return;
        }

        if (this.currentEditId !== null) {
            // 편집 모드
            this.updateMemo(this.currentEditId, content, category, time);
            this.currentEditId = null;
            document.getElementById('addMemo').textContent = '추가';
        } else {
            // 새 메모 추가
            const memo = {
                id: Date.now(),
                content: content,
                category: category,
                time: parseFloat(time),
                date: new Date().toLocaleString('ko-KR'),
                dateStr: this.formatDateString(this.selectedDate),
                important: this.isImportant,
                completed: false,
                timestamp: Date.now()
            };
            this.memos.unshift(memo);
        }

        memoText.value = '';
        memoCategory.value = '';
        memoTime.value = '';
        this.resetImportance();
        this.saveMemos();
        this.renderCalendar();
        this.renderMemos();
    }

    updateMemo(id, content, category, time) {
        const memoIndex = this.memos.findIndex(memo => memo.id === id);
        if (memoIndex !== -1) {
            this.memos[memoIndex].content = content;
            this.memos[memoIndex].category = category;
            this.memos[memoIndex].time = parseFloat(time);
            this.memos[memoIndex].date = new Date().toLocaleString('ko-KR');
        }
    }

    toggleMemoImportance(id) {
        const memoIndex = this.memos.findIndex(memo => memo.id === id);
        if (memoIndex !== -1) {
            this.memos[memoIndex].important = !this.memos[memoIndex].important;
            this.saveMemos();
            this.renderMemos();
        }
    }

    toggleMemoComplete(id) {
        const memoIndex = this.memos.findIndex(memo => memo.id === id);
        if (memoIndex !== -1) {
            this.memos[memoIndex].completed = !this.memos[memoIndex].completed;
            this.saveMemos();
            this.renderMemos();
        }
    }

    deleteMemo(id) {
        if (confirm('정말로 이 메모를 삭제하시겠습니까?')) {
            this.memos = this.memos.filter(memo => memo.id !== id);
            this.saveMemos();
            this.renderCalendar();
            this.renderMemos();
        }
    }

    editMemo(id) {
        const memo = this.memos.find(memo => memo.id === id);
        if (memo) {
            const memoText = document.getElementById('memoText');
            const memoCategory = document.getElementById('memoCategory');
            const memoTime = document.getElementById('memoTime'); // Added memoTime
            const addButton = document.getElementById('addMemo');
            const starButton = document.getElementById('starButton');
            
            memoText.value = memo.content;
            memoCategory.value = memo.category;
            memoTime.value = memo.time; // Set memoTime value
            memoText.focus();
            this.currentEditId = id;
            addButton.textContent = '수정';
            
            // 중요도 표시 설정
            if (memo.important) {
                starButton.classList.add('active');
                this.isImportant = true;
            } else {
                starButton.classList.remove('active');
                this.isImportant = false;
            }
            
            // 완료 상태는 편집 시 변경하지 않음 (완료 버튼으로만 제어)
        }
    }

    cancelEdit() {
        this.currentEditId = null;
        document.getElementById('addMemo').textContent = '추가';
        document.getElementById('memoText').value = '';
        this.resetImportance();
    }

    resetImportance() {
        this.isImportant = false;
        const starButton = document.getElementById('starButton');
        starButton.classList.remove('active');
        starButton.textContent = '☆';
    }

    saveMemos() {
        localStorage.setItem('memos', JSON.stringify(this.memos));
    }

    renderMemos() {
        const memoList = document.getElementById('memoList');
        const selectedDateStr = this.formatDateString(this.selectedDate);
        const dateMemos = this.memos.filter(memo => memo.dateStr === selectedDateStr);
        
        if (dateMemos.length === 0) {
            const today = new Date();
            const isToday = this.isSameDate(this.selectedDate, today);
            
            memoList.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📝</div>
                    <p>${isToday ? '오늘' : '이 날짜'}에는 메모가 없습니다.</p>
                    <p>위에 메모를 작성해보세요!</p>
                    <div class="selected-date-info">
                        <small>선택된 날짜: ${this.selectedDate.toLocaleDateString('ko-KR')}</small>
                    </div>
                </div>
            `;
            return;
        }

        // 메모를 중요도와 시간순으로 정렬 (중요한 메모가 먼저, 그 다음 시간순)
        const sortedMemos = dateMemos.sort((a, b) => {
            if (a.important !== b.important) {
                return b.important ? 1 : -1; // 중요한 메모가 먼저
            }
            return b.timestamp - a.timestamp; // 최신 메모가 먼저
        });

        memoList.innerHTML = `
            <div class="memo-count">
                <small>${this.selectedDate.toLocaleDateString('ko-KR')} - ${sortedMemos.length}개의 메모</small>
            </div>
            ${sortedMemos.map(memo => `
                <div class="memo-item ${memo.important ? 'important' : ''} ${memo.completed ? 'completed' : ''}" data-id="${memo.id}">
                    <div class="memo-category ${memo.category.replace(/\s+/g, '')}">${memo.category}</div>
                    <div class="memo-time">${this.formatTimeDisplay(memo.time)}</div>
                    <div class="memo-header">
                        <div class="memo-date">${memo.date}</div>
                        <div class="memo-importance ${memo.important ? '' : 'not-important'}" 
                             onclick="memoApp.toggleMemoImportance(${memo.id})" 
                             title="${memo.important ? '중요 메모' : '중요 메모로 표시'}">
                            ${memo.important ? '⭐' : '☆'}
                        </div>
                    </div>
                    <div class="memo-content">${this.escapeHtml(memo.content)}</div>
                    <div class="memo-actions">
                        <button class="complete-btn ${memo.completed ? 'completed' : ''}" 
                                onclick="memoApp.toggleMemoComplete(${memo.id})"
                                title="${memo.completed ? '완료됨' : '완료로 표시'}">
                            ${memo.completed ? '✅ 완료됨' : '✅ 완료'}
                        </button>
                        <button class="edit-btn" onclick="memoApp.editMemo(${memo.id})">
                            ✏️ 수정
                        </button>
                        <button class="delete-btn" onclick="memoApp.deleteMemo(${memo.id})">
                            🗑️ 삭제
                        </button>
                    </div>
                </div>
            `).join('')}
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearMemoInput() {
        const memoText = document.getElementById('memoText');
        const memoCategory = document.getElementById('memoCategory');
        const memoTime = document.getElementById('memoTime'); // Added memoTime
        const addButton = document.getElementById('addMemo');
        
        memoText.value = '';
        memoCategory.value = '';
        memoTime.value = ''; // Clear memoTime
        addButton.textContent = '추가';
        this.resetImportance();
        
        // 편집 모드 해제
        this.currentEditId = null;
    }

    formatDateString(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    parseDateString(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return new Date(year, month - 1, day); // getMonth()는 0부터 시작
    }

    formatTimeDisplay(timeInHours) {
        if (timeInHours === 0) {
            return '0~30분';
        } else if (timeInHours === 0.5) {
            return '30분~1시간';
        } else if (timeInHours === 1) {
            return '1~1.5시간';
        } else if (timeInHours === 1.5) {
            return '1.5~2시간';
        } else if (timeInHours === 2) {
            return '2~2.5시간';
        } else if (timeInHours === 2.5) {
            return '2.5~3시간';
        } else if (timeInHours === 3) {
            return '3~3.5시간';
        } else if (timeInHours === 3.5) {
            return '3.5~4시간';
        } else if (timeInHours === 4) {
            return '4시간+';
        }
        return `${timeInHours}시간`;
    }

    showMonthlyStats() {
        const modal = document.getElementById('monthStatsModal');
        const modalTitle = document.getElementById('modalMonthTitle');
        const statsContent = document.getElementById('statsContent');
        
        // 모달 제목 설정
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth() + 1;
        modalTitle.textContent = `${year}년 ${month}월 통계`;
        
        // 통계 계산 및 표시
        const stats = this.calculateMonthlyStats(year, month);
        statsContent.innerHTML = this.renderMonthlyStats(stats);
        
        // 원그래프 이벤트 바인딩
        setTimeout(() => this.bindPieChartEvents(), 100);
        
        // 모달 표시
        modal.classList.add('show');
    }

    hideMonthlyStats() {
        const modal = document.getElementById('monthStatsModal');
        modal.classList.remove('show');
    }

    calculateMonthlyStats(year, month) {
        const monthMemos = this.memos.filter(memo => {
            const memoDate = new Date(memo.dateStr);
            return memoDate.getFullYear() === year && memoDate.getMonth() === month - 1 && memo.completed;
        });

        const stats = {
            totalTime: 0,
            totalMemos: monthMemos.length,
            categories: {}
        };

        // 카테고리별 통계 계산 (완료된 메모만)
        monthMemos.forEach(memo => {
            const category = memo.category;
            const time = this.getUpperBoundTime(memo.time) || 0;
            
            if (!stats.categories[category]) {
                stats.categories[category] = {
                    time: 0,
                    count: 0
                };
            }
            
            stats.categories[category].time += time;
            stats.categories[category].count += 1;
            stats.totalTime += time;
        });

        return stats;
    }

    renderMonthlyStats(stats) {
        if (stats.totalMemos === 0) {
            return `
                <div class="no-stats">
                    <div class="icon">📊</div>
                    <p>이번 달에는 완료된 메모가 없습니다.</p>
                    <p>메모를 완료하면 통계에 반영됩니다!</p>
                </div>
            `;
        }

        // 동적으로 생성된 카테고리 목록 사용
        const allCategories = {};
        this.categories.forEach(category => {
            allCategories[category.name] = category.color;
        });

        // 원그래프 데이터 생성
        const pieChartData = this.generatePieChartData(stats.categories, allCategories);
        
        const categoryItems = Object.entries(allCategories)
            .map(([category, color]) => {
                const data = stats.categories[category] || { time: 0, count: 0 };
                const percentage = stats.totalTime > 0 ? ((data.time / stats.totalTime) * 100).toFixed(1) : '0.0';
                
                return `
                    <div class="category-stat-item">
                        <h5>${category}</h5>
                        <div class="category-time">${this.formatTimeForStats(data.time)}</div>
                        <div class="category-count">${data.count}개의 메모 (${percentage}%)</div>
                    </div>
                `;
            }).join('');

        return `
            <div class="stats-summary">
                <h4>멋진 미래 오늘도 적립!</h4>
                <div class="total-time">${this.formatTimeForStats(stats.totalTime)}</div>
                <div class="total-memos">총 ${stats.totalMemos}개의 완료된 메모</div>
            </div>
            
            <div class="pie-chart-section">
                <h4>카테고리별 완료 시간 분포</h4>
                <div class="pie-chart-container">
                    ${this.generateSVGPieChart(stats.categories, allCategories)}
                </div>
                <div class="pie-chart-legend">
                    ${pieChartData.legend}
                </div>
            </div>
            
            <div class="category-stats">
                ${categoryItems}
            </div>
        `;
    }

    formatTimeForStats(timeInHours) {
        if (timeInHours === 0) {
            return '0시간';
        } else if (timeInHours < 1) {
            return `${Math.round(timeInHours * 60)}분`;
        } else {
            const hours = Math.floor(timeInHours);
            const minutes = Math.round((timeInHours - hours) * 60);
            if (minutes === 0) {
                return `${hours}시간`;
            } else {
                return `${hours}시간 ${minutes}분`;
            }
        }
    }

    getUpperBoundTime(timeInHours) {
        if (timeInHours === 0) {
            return 0.5; // 0~30분 → 30분 (0.5시간)
        } else if (timeInHours === 0.5) {
            return 1; // 30분~1시간 → 1시간
        } else if (timeInHours === 1) {
            return 1.5; // 1시간~1.5시간 → 1.5시간
        } else if (timeInHours === 1.5) {
            return 2; // 1.5시간~2시간 → 2시간
        } else if (timeInHours === 2) {
            return 2.5; // 2시간~2.5시간 → 2.5시간
        } else if (timeInHours === 2.5) {
            return 3; // 2.5시간~3시간 → 3시간
        } else if (timeInHours === 3) {
            return 3.5; // 3시간~3.5시간 → 3.5시간
        } else if (timeInHours === 3.5) {
            return 4; // 3.5시간~4시간 → 4시간
        } else if (timeInHours === 4) {
            return 4; // 4시간 이상 → 4시간
        }
        return timeInHours;
    }

    generatePieChartData(categoryStats, allCategories) {
        const totalTime = Object.values(categoryStats).reduce((sum, data) => sum + data.time, 0);
        
        if (totalTime === 0) {
            return {
                gradient: 'conic-gradient(#e9ecef 0deg 360deg)',
                legend: Object.entries(allCategories).map(([category, color]) => `
                    <div class="legend-item">
                        <div class="legend-color" style="background: ${color};"></div>
                        <div class="legend-text">
                            <div class="legend-category">${category}</div>
                            <div class="legend-percentage">0.0%</div>
                        </div>
                    </div>
                `).join('')
            };
        }

        let currentAngle = 0;
        const gradientParts = [];
        const legendItems = [];

        Object.entries(allCategories).forEach(([category, color]) => {
            const data = categoryStats[category] || { time: 0 };
            const percentage = ((data.time / totalTime) * 100).toFixed(1);
            const angle = (data.time / totalTime) * 360;
            
            if (data.time > 0) {
                gradientParts.push(`${color} ${currentAngle}deg ${currentAngle + angle}deg`);
                currentAngle += angle;
            }

            legendItems.push(`
                <div class="legend-item">
                    <div class="legend-color" style="background: ${color};"></div>
                    <div class="legend-text">
                        <div class="legend-category">${category}</div>
                        <div class="legend-percentage">${percentage}%</div>
                    </div>
                </div>
            `);
        });

        // 남은 공간을 회색으로 채우기
        if (currentAngle < 360) {
            gradientParts.push(`#e9ecef ${currentAngle}deg 360deg`);
        }

        return {
            gradient: `conic-gradient(${gradientParts.join(', ')})`,
            legend: legendItems.join('')
        };
    }

    generateSVGPieChart(categoryStats, allCategories) {
        const totalTime = Object.values(categoryStats).reduce((sum, data) => sum + data.time, 0);
        const radius = 80;
        const centerX = 100;
        const centerY = 100;
        let currentAngle = 0;
        let svgHTML = '';

        if (totalTime === 0) {
            // 데이터가 없을 때 빈 원그래프 표시
            return `
                <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#e9ecef" stroke="#dee2e6" stroke-width="2"/>
                    <text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="middle" fill="#6c757d" font-size="14">
                        데이터 없음
                    </text>
                </svg>
            `;
        }

        // 실제 데이터가 있는 카테고리만 필터링
        const validCategories = Object.entries(allCategories).filter(([category, color]) => {
            const data = categoryStats[category] || { time: 0 };
            return data.time > 0;
        });

        if (validCategories.length === 0) {
            return `
                <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#e9ecef" stroke="#dee2e6" stroke-width="2"/>
                    <text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="middle" fill="#6c757d" font-size="14">
                        데이터 없음
                    </text>
                </svg>
            `;
        }

        // 각 카테고리별로 원형 조각 생성 (CSS conic-gradient 대신 여러 개의 원형 요소 사용)
        validCategories.forEach(([category, color]) => {
            const data = categoryStats[category] || { time: 0 };
            const angle = (data.time / totalTime) * 360;
            
            if (angle > 0) {
                // 원형 조각을 위한 SVG 요소 생성
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                
                // 각도가 360도에 가까우면 전체 원으로 표시
                if (angle >= 359) {
                    svgHTML += `
                        <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${color}" stroke="white" stroke-width="2"/>
                    `;
                } else {
                    // 부분 원형 조각 생성
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    
                    // 시작점과 끝점 좌표
                    const x1 = centerX + radius * Math.cos(startRad);
                    const y1 = centerY - radius * Math.sin(startRad);
                    const x2 = centerX + radius * Math.cos(endRad);
                    const y2 = centerY - radius * Math.sin(endRad);
                    
                    // 큰 각도인지 확인
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    
                    // SVG path 데이터 생성 (올바른 sweep-flag 사용)
                    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y2} Z`;
                    
                    svgHTML += `
                        <path d="${pathData}" fill="${color}" stroke="white" stroke-width="2"/>
                    `;
                }
                
                // 라벨 추가 (각도가 충분히 클 때만)
                if (angle > 30) {
                    const labelAngle = (currentAngle + angle / 2) * Math.PI / 180;
                    const labelRadius = radius * 0.6;
                    const labelX = centerX + labelRadius * Math.cos(labelAngle);
                    const labelY = centerY - labelRadius * Math.sin(labelAngle);
                    
                    svgHTML += `
                        <text x="${labelX}" y="${labelY}" 
                              text-anchor="middle" 
                              dominant-baseline="middle"
                              font-size="11"
                              font-weight="600"
                              fill="white">
                            ${category}
                        </text>
                    `;
                }
                
                currentAngle += angle;
            }
        });

        return `
            <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#e9ecef" stroke-width="2"/>
                ${svgHTML}
            </svg>
        `;
    }

    bindPieChartEvents() {
        // 호버 기능 제거 - 이벤트 바인딩 없음
    }

    renderCategories() {
        const categorySelect = document.getElementById('memoCategory');
        const categoriesList = document.getElementById('categoriesList');
        const colorOptions = document.getElementById('colorOptions');
        
        // 카테고리 선택 옵션 업데이트
        categorySelect.innerHTML = '<option value="">카테고리 선택</option>';
        this.categories.forEach(category => {
            categorySelect.innerHTML += `
                <option value="${category.name}">${category.emoji} ${category.name}</option>
            `;
        });

        // 카테고리 목록 렌더링
        if (categoriesList) {
            categoriesList.innerHTML = '';
            this.categories.forEach(category => {
                categoriesList.innerHTML += `
                    <div class="category-item" data-name="${category.name}">
                        <span class="category-emoji">${category.emoji}</span>
                        <span class="category-name">${category.name}</span>
                        <span class="category-color" style="background-color: ${category.color};"></span>
                        <button class="edit-category-btn" onclick="memoApp.editCategory('${category.name}')" title="수정">✏️</button>
                        <button class="delete-category-btn" onclick="memoApp.deleteCategory('${category.name}')" title="삭제">🗑️</button>
                    </div>
                `;
            });
        }

        // 색상 옵션 렌더링
        if (colorOptions) {
            const colors = [
                '#28a745', '#ffc107', '#6f42c1', '#fd7e14', '#e83e8c', '#6c757d', '#17a2b8',
                '#dc3545', '#20c997', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'
            ];
            
            colorOptions.innerHTML = '';
            colors.forEach(color => {
                colorOptions.innerHTML += `
                    <div class="color-option" style="background-color: ${color};" 
                         data-color="${color}" onclick="memoApp.selectColor('${color}')"></div>
                `;
            });
        }
    }

    showCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.classList.add('show');
        this.renderCategories(); // 모달 열릴 때 카테고리 목록 다시 렌더링
        
        // 입력 필드 초기화
        document.getElementById('newCategoryName').value = '';
        document.getElementById('newCategoryEmoji').value = '';
        this.selectedColor = '#28a745'; // 기본 색상 설정
        this.updateColorSelection();
    }

    hideCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.classList.remove('show');
    }

    selectColor(color) {
        this.selectedColor = color;
        this.updateColorSelection();
    }

    updateColorSelection() {
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === this.selectedColor) {
                option.classList.add('selected');
            }
        });
    }

    addNewCategory() {
        const categoryNameInput = document.getElementById('newCategoryName');
        const categoryEmojiInput = document.getElementById('newCategoryEmoji');

        const name = categoryNameInput.value.trim();
        const emoji = categoryEmojiInput.value.trim() || '📝'; // 기본 이모지

        if (!name) {
            alert('카테고리 이름을 입력해주세요.');
            return;
        }

        if (this.categories.some(cat => cat.name === name)) {
            alert('이미 존재하는 카테고리 이름입니다.');
            return;
        }

        // 새 카테고리 추가
        const newCategory = {
            name: name,
            emoji: emoji,
            color: this.selectedColor || '#28a745'
        };

        this.categories.push(newCategory);
        this.saveCategories();
        this.renderCategories();
        
        // 입력 필드 초기화
        categoryNameInput.value = '';
        categoryEmojiInput.value = '';
        
        // 성공 메시지
        alert(`"${name}" 카테고리가 추가되었습니다!`);
    }

    editCategory(name) {
        const category = this.categories.find(cat => cat.name === name);
        if (category) {
            const newName = prompt('새 카테고리 이름을 입력하세요:', category.name);
            if (newName && newName.trim() && newName !== category.name) {
                if (this.categories.some(cat => cat.name === newName.trim())) {
                    alert('이미 존재하는 카테고리 이름입니다.');
                    return;
                }
                
                // 기존 메모들의 카테고리도 업데이트
                this.memos.forEach(memo => {
                    if (memo.category === category.name) {
                        memo.category = newName.trim();
                    }
                });
                
                category.name = newName.trim();
                this.saveCategories();
                this.saveMemos();
                this.renderCategories();
                this.renderMemos();
                alert('카테고리가 수정되었습니다!');
            }
        }
    }

    updateCategory(name, newName, newEmoji, newColor) {
        const categoryIndex = this.categories.findIndex(cat => cat.name === name);
        if (categoryIndex !== -1) {
            this.categories[categoryIndex].name = newName;
            this.categories[categoryIndex].emoji = newEmoji;
            this.categories[categoryIndex].color = newColor;
            this.saveCategories();
            this.renderCategories();
        }
    }

    deleteCategory(name) {
        // 해당 카테고리를 사용하는 메모가 있는지 확인
        const memoCount = this.memos.filter(memo => memo.category === name).length;
        
        if (memoCount > 0) {
            if (!confirm(`"${name}" 카테고리를 사용하는 메모가 ${memoCount}개 있습니다. 정말로 삭제하시겠습니까?`)) {
                return;
            }
            
            // 해당 카테고리의 메모들을 '기타'로 변경
            this.memos.forEach(memo => {
                if (memo.category === name) {
                    memo.category = '기타';
                }
            });
            this.saveMemos();
        } else {
            if (!confirm(`"${name}" 카테고리를 삭제하시겠습니까?`)) {
                return;
            }
        }

        // 카테고리 삭제
        this.categories = this.categories.filter(cat => cat.name !== name);
        this.saveCategories();
        this.renderCategories();
        this.renderMemos();
        alert('카테고리가 삭제되었습니다!');
    }

    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    saveHeaderTitle() {
        const headerTitle = document.getElementById('headerTitle');
        if (headerTitle) {
            localStorage.setItem('headerTitle', headerTitle.textContent);
        }
    }

    renderHeader() {
        const headerTitle = document.getElementById('headerTitle');
        if (headerTitle) {
            headerTitle.textContent = this.headerTitle;
        }
    }
}

// 앱 초기화
const memoApp = new MemoApp();

// 페이지 로드 시 포커스 설정
window.addEventListener('load', () => {
    document.getElementById('memoText').focus();
});
