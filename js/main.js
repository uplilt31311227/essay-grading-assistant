// ===== DOM Elements =====
const navMenu = document.querySelector('.nav-menu');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelectorAll('.nav-link');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const gradingForm = document.getElementById('grading-form');
const essayContent = document.getElementById('essay-content');
const charCount = document.getElementById('char-count');
const resultSection = document.getElementById('result-section');
const resultContent = document.getElementById('result-content');

// ===== Mobile Navigation =====
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ===== Active Navigation on Scroll =====
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        if (section.offsetTop <= scrollPos &&
            section.offsetTop + section.offsetHeight > scrollPos) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + section.id) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// ===== Tab Switching =====
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;

        // Update active button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    });
});

// ===== Character Count =====
essayContent.addEventListener('input', () => {
    const count = essayContent.value.length;
    charCount.textContent = count;
});

// ===== Clear Form =====
function clearForm() {
    document.getElementById('essay-topic').value = '';
    document.getElementById('essay-content').value = '';
    charCount.textContent = '0';
    resultSection.classList.add('hidden');
}

// ===== Copy Result =====
function copyResult() {
    const text = resultContent.innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert('已複製到剪貼簿！');
    }).catch(err => {
        console.error('複製失敗:', err);
    });
}

// ===== Form Submission =====
gradingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const examType = document.querySelector('input[name="exam-type"]:checked').value;
    const topic = document.getElementById('essay-topic').value.trim();
    const content = document.getElementById('essay-content').value.trim();

    if (!topic) {
        alert('請輸入作文題目');
        return;
    }

    if (!content) {
        alert('請輸入學生作文內容');
        return;
    }

    // Generate result based on exam type
    const result = generateGradingResult(examType, topic, content);
    displayResult(result);
});

// ===== Generate Grading Result =====
function generateGradingResult(examType, topic, content) {
    const charLength = content.length;
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim()).length;

    // Get exam type name
    const examNames = {
        'gsat-intellectual': '學測知性題',
        'gsat-emotional': '學測情意題',
        'cap': '會考作文'
    };

    // Basic analysis (simplified demo)
    let analysis = {
        examType: examNames[examType],
        topic: topic,
        charCount: charLength,
        paragraphCount: paragraphs,
        grade: '',
        score: 0,
        dimensions: {}
    };

    // Simple scoring logic (demo purposes)
    if (examType === 'cap') {
        // 會考六級分制
        if (charLength >= 600 && paragraphs >= 4) {
            analysis.grade = '5 級分';
            analysis.score = 5;
            analysis.dimensions = {
                '立意取材': '能適當統整運用材料，闡述主旨',
                '結構組織': '結構完整，偶有轉折不流暢',
                '遣詞造句': '能正確使用語詞，文句通順',
                '錯別字格式標點': '少有錯誤'
            };
        } else if (charLength >= 400 && paragraphs >= 3) {
            analysis.grade = '4 級分';
            analysis.score = 4;
            analysis.dimensions = {
                '立意取材': '尚能統整運用材料說明主旨',
                '結構組織': '大致完整，偶有不連貫',
                '遣詞造句': '文意尚清楚，有冗詞贅句',
                '錯別字格式標點': '有一些錯誤'
            };
        } else if (charLength >= 200) {
            analysis.grade = '3 級分';
            analysis.score = 3;
            analysis.dimensions = {
                '立意取材': '材料運用不甚適當',
                '結構組織': '結構鬆散',
                '遣詞造句': '用詞不太恰當',
                '錯別字格式標點': '有些錯誤造成理解困難'
            };
        } else {
            analysis.grade = '2 級分';
            analysis.score = 2;
            analysis.dimensions = {
                '立意取材': '發展有限',
                '結構組織': '結構不完整',
                '遣詞造句': '遣詞造句常有錯誤',
                '錯別字格式標點': '錯別字頗多'
            };
        }
    } else {
        // 學測三等六級制
        if (charLength >= 500 && paragraphs >= 4) {
            analysis.grade = 'A';
            analysis.score = examType === 'gsat-emotional' ? 20 : 17;
            analysis.dimensions = {
                '立意取材': '8/10 - 觀點明確，材料適切',
                '組織結構': '6/7.5 - 結構完整，脈絡分明',
                '遣詞造句': '5/6.25 - 文辭流暢',
                '標點錯字': '1/1.25 - 少有錯誤'
            };
        } else if (charLength >= 300 && paragraphs >= 3) {
            analysis.grade = 'B+';
            analysis.score = examType === 'gsat-emotional' ? 15 : 13;
            analysis.dimensions = {
                '立意取材': '6/10 - 論述尚稱適當',
                '組織結構': '4.5/7.5 - 結構大致完整',
                '遣詞造句': '4/6.25 - 文辭通順',
                '標點錯字': '0.5/1.25 - 有些錯誤'
            };
        } else if (charLength >= 150) {
            analysis.grade = 'B';
            analysis.score = examType === 'gsat-emotional' ? 12 : 10;
            analysis.dimensions = {
                '立意取材': '4/10 - 論述平平',
                '組織結構': '3/7.5 - 結構尚可',
                '遣詞造句': '2.5/6.25 - 文辭平順',
                '標點錯字': '0.5/1.25 - 有些錯誤'
            };
        } else {
            analysis.grade = 'C+';
            analysis.score = examType === 'gsat-emotional' ? 8 : 6;
            analysis.dimensions = {
                '立意取材': '2/10 - 發展不足',
                '組織結構': '2/7.5 - 結構鬆散',
                '遣詞造句': '1.5/6.25 - 文辭欠通順',
                '標點錯字': '0.5/1.25 - 錯誤較多'
            };
        }
    }

    return analysis;
}

// ===== Display Result =====
function displayResult(analysis) {
    let html = `
        <h4>📊 基本資訊</h4>
        <table>
            <tr>
                <th>評分標準</th>
                <td>${analysis.examType}</td>
            </tr>
            <tr>
                <th>作文題目</th>
                <td>${analysis.topic}</td>
            </tr>
            <tr>
                <th>字數統計</th>
                <td>${analysis.charCount} 字</td>
            </tr>
            <tr>
                <th>段落數</th>
                <td>${analysis.paragraphCount} 段</td>
            </tr>
        </table>

        <h4>📝 四大面向評分</h4>
        <table>
            <thead>
                <tr>
                    <th>評分面向</th>
                    <th>評語</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const [dimension, comment] of Object.entries(analysis.dimensions)) {
        html += `
            <tr>
                <td><strong>${dimension}</strong></td>
                <td>${comment}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>

        <h4>🏆 評分結果</h4>
        <div style="text-align: center; padding: 2rem; background: var(--bg-color); border-radius: var(--radius-lg); margin-top: 1rem;">
            <div style="font-size: 3rem; font-weight: 700; color: var(--primary-color); margin-bottom: 0.5rem;">
                ${analysis.grade}
            </div>
            <div style="font-size: 1.5rem; color: var(--text-secondary);">
                ${analysis.score} 分
            </div>
        </div>

        <h4>💡 改進建議</h4>
        <ul style="padding-left: 1.5rem;">
            <li>建議增加文章篇幅，充實內容</li>
            <li>注意段落之間的銜接與過渡</li>
            <li>善用具體事例支撐論點或增添情感</li>
            <li>檢查錯別字與標點符號使用</li>
        </ul>

        <div style="margin-top: 2rem; padding: 1rem; background: #FEF3C7; border-radius: var(--radius-md); border-left: 4px solid #F59E0B;">
            <strong>⚠️ 注意：</strong>此為系統初步分析結果，僅供參考。實際評分請以專業教師判斷為準。
        </div>
    `;

    resultContent.innerHTML = html;
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
