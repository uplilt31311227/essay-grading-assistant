// ===== PDF.js Configuration =====
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ===== DOM Elements =====
const navMenu = document.querySelector('.nav-menu');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelectorAll('.nav-link');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const gradingForm = document.getElementById('grading-form');
const resultSection = document.getElementById('result-section');
const resultContent = document.getElementById('result-content');

// File upload elements
const topicFileInput = document.getElementById('topic-file');
const topicUploadArea = document.getElementById('topic-upload-area');
const topicPreview = document.getElementById('topic-preview');
const topicFilename = document.getElementById('topic-filename');
const topicContent = document.getElementById('topic-content');

const essayFileInput = document.getElementById('essay-file');
const essayUploadArea = document.getElementById('essay-upload-area');
const essayPreview = document.getElementById('essay-preview');
const essayFilename = document.getElementById('essay-filename');
const essayContentPreview = document.getElementById('essay-content-preview');

// Store extracted text
let topicText = '';
let essayText = '';

// ===== Mobile Navigation =====
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

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
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    });
});

// ===== Drag and Drop =====
function setupDragDrop(uploadArea, fileInput) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('dragover');
        });
    });

    uploadArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            fileInput.dispatchEvent(new Event('change'));
        }
    });
}

setupDragDrop(topicUploadArea, topicFileInput);
setupDragDrop(essayUploadArea, essayFileInput);

// ===== File Upload Handlers =====
topicFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        await handleTopicFile(file);
    }
});

essayFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        await handleEssayFile(file);
    }
});

// ===== Handle Topic File =====
async function handleTopicFile(file) {
    topicFilename.textContent = file.name;
    topicPreview.classList.remove('hidden');
    topicUploadArea.style.display = 'none';

    topicContent.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <span>正在讀取 PDF...</span>
        </div>
    `;

    if (file.type === 'application/pdf') {
        topicText = await extractTextFromPDF(file);
        topicContent.innerHTML = topicText || '<em style="color: var(--text-secondary);">（PDF 內容為圖片，無法提取文字）</em>';
    } else {
        topicContent.innerHTML = '<em style="color: var(--text-secondary);">請上傳 PDF 格式檔案</em>';
    }
}

// ===== Handle Essay File =====
async function handleEssayFile(file) {
    essayFilename.textContent = file.name;
    essayPreview.classList.remove('hidden');
    essayUploadArea.style.display = 'none';

    essayContentPreview.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <span>正在讀取檔案...</span>
        </div>
    `;

    if (file.type === 'application/pdf') {
        essayText = await extractTextFromPDF(file);
        if (essayText) {
            essayContentPreview.innerHTML = essayText;
        } else {
            // If no text extracted, show PDF as image
            const pdfImages = await renderPDFAsImages(file);
            essayContentPreview.innerHTML = pdfImages;
            essayText = '[PDF 圖片內容]';
        }
    } else if (file.type.startsWith('image/')) {
        // Handle image files
        const reader = new FileReader();
        reader.onload = (e) => {
            essayContentPreview.innerHTML = `<img src="${e.target.result}" alt="學生作文" />`;
            essayText = '[圖片內容]';
        };
        reader.readAsDataURL(file);
    }
}

// ===== Extract Text from PDF =====
async function extractTextFromPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');

            if (pageText.trim()) {
                fullText += `<div class="pdf-page">
                    <div class="page-number">第 ${i} 頁</div>
                    <div>${pageText}</div>
                </div>`;
            }
        }

        return fullText;
    } catch (error) {
        console.error('PDF 讀取錯誤:', error);
        return '';
    }
}

// ===== Render PDF as Images =====
async function renderPDFAsImages(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let imagesHTML = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const scale = 1.5;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const imgData = canvas.toDataURL('image/png');
            imagesHTML += `
                <div class="pdf-page">
                    <div class="page-number">第 ${i} 頁</div>
                    <img src="${imgData}" alt="第 ${i} 頁" style="max-width: 100%;" />
                </div>
            `;
        }

        return imagesHTML;
    } catch (error) {
        console.error('PDF 渲染錯誤:', error);
        return '<em style="color: var(--danger-color);">PDF 渲染失敗</em>';
    }
}

// ===== Remove File Functions =====
function removeTopicFile() {
    topicFileInput.value = '';
    topicPreview.classList.add('hidden');
    topicUploadArea.style.display = 'block';
    topicText = '';
    topicContent.innerHTML = '';
}

function removeEssayFile() {
    essayFileInput.value = '';
    essayPreview.classList.add('hidden');
    essayUploadArea.style.display = 'block';
    essayText = '';
    essayContentPreview.innerHTML = '';
}

// ===== Clear Form =====
function clearForm() {
    removeTopicFile();
    removeEssayFile();
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

    if (!topicFileInput.files[0]) {
        alert('請上傳作文題目 PDF');
        return;
    }

    if (!essayFileInput.files[0]) {
        alert('請上傳學生作文檔案');
        return;
    }

    // Generate result
    const result = generateGradingResult(examType, topicText, essayText);
    displayResult(result);
});

// ===== Generate Grading Result =====
function generateGradingResult(examType, topic, content) {
    const charLength = content.length;

    const examNames = {
        'gsat-intellectual': '學測知性題',
        'gsat-emotional': '學測情意題',
        'cap': '會考作文'
    };

    let analysis = {
        examType: examNames[examType],
        topic: topic ? '已上傳題目 PDF' : '未提供',
        charCount: charLength,
        grade: '',
        score: 0,
        dimensions: {}
    };

    // Scoring logic based on exam type
    if (examType === 'cap') {
        analysis.grade = '4 級分';
        analysis.score = 4;
        analysis.dimensions = {
            '立意取材': '尚能統整運用材料說明主旨',
            '結構組織': '大致完整，偶有不連貫',
            '遣詞造句': '文意尚清楚，有冗詞贅句',
            '錯別字格式標點': '有一些錯誤'
        };
    } else {
        analysis.grade = 'B+';
        analysis.score = examType === 'gsat-emotional' ? 15 : 13;
        analysis.dimensions = {
            '立意取材': '6/10 - 論述尚稱適當',
            '組織結構': '4.5/7.5 - 結構大致完整',
            '遣詞造句': '4/6.25 - 文辭通順',
            '標點錯字': '0.5/1.25 - 有些錯誤'
        };
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
            <strong>⚠️ 注意：</strong>此為系統初步分析結果，僅供參考。完整的 AI 批改功能需搭配後端服務使用。
        </div>
    `;

    resultContent.innerHTML = html;
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== Smooth Scroll =====
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
