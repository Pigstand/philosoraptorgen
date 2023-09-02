'use strict';

var gMeme;
var gCtx;
var gImgObj;

var isDragging = false;
var selectedTxtIdx = -1;
var initialMouseX;
var initialMouseY;

function createGmeme(imgId) {
    return {
        selectedImgId: imgId,
        txts: [createTxt('Your Text', 150, 70), createTxt('Your Text', 150, 300)]
    };
}

function createTxt(line, x, y) {
    return {
        // object txt = {property:value}
        line: line,
        size: 40,
        align: 'left',
        color: '#000000',
        fontFamily: 'Impact',
        isOutline: true,
        lineWidth: 2,
        strokeStyle: '#ffffff',
        isShadow: false,
        shadowColor: '#000000',
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        shadowBlur: 0,
        x: x,
        y: y
    };
}

function initMemeEditor(imgId) {
    toggleView();
    gMeme = createGmeme(imgId);
    initCanvas();
    renderTxtsEditor();
}

function initCanvas() {
    var canvas = document.querySelector('.memeCanvas');
    gCtx = canvas.getContext('2d');

    gImgObj = new Image();
    gImgObj.src = getImgSrc();

    gImgObj.onload = function () {
        canvas.width = gImgObj.width;
        canvas.height = gImgObj.height;
        gMeme.txts[1].y = gImgObj.height - 70;

        drawCanvas();
    };
    
    // Add event listeners for mouse and touch events
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchEnd);
}

function getImgSrc() {
    var imgIdx = gImgs.findIndex(function (img) {
        return gMeme.selectedImgId === img.id;
    });

    return gImgs[imgIdx].url;
}

function drawCanvas() {
    gCtx.drawImage(gImgObj, 0, 0);

    gMeme.txts.forEach(function (txt) {
        drawTxt(txt);
    });
}

function drawTxt(txt) {
    gCtx.font = txt.size + 'px ' + txt.fontFamily;
    gCtx.textAlign = txt.align;
    gCtx.fillStyle = txt.color;
    if (txt.isShadow) addTxtShadow(txt);
    if (txt.isOutline) addTxtOutline(txt);

    gCtx.fillText(txt.line, txt.x, txt.y);
}

function addTxtShadow(txt) {
    gCtx.shadowColor = txt.shadowColor;
    gCtx.shadowOffsetX = txt.shadowOffsetX;
    gCtx.shadowOffsetY = txt.shadowOffsetY;
    gCtx.shadowBlur = txt.shadowBlur;
}

function addTxtOutline(txt) {
    gCtx.strokeStyle = txt.strokeStyle;
    gCtx.lineWidth = txt.lineWidth;
    gCtx.strokeText(txt.line, txt.x, txt.y);
}

function editTxt(elinput, txtIdx) {
    var property = elinput.dataset.property;
    var value;

    switch (elinput.type) {
        case 'select-one':
            value = elinput.options[elinput.selectedIndex].value;
            break;
        case 'checkbox':
            value = elinput.checked;
            break;
        default:
            value = elinput.value;
            break;
    }
    gMeme.txts[txtIdx][property] = value;

    drawCanvas();
}

function renderTxtsEditor() {
    var strHtml = gMeme.txts.map(function (txt, idx) {
        return `
        <div class="txt-editor">
            <p>
                <button onclick="deleteTxt(${idx})"><i class="fas fa-eraser"></i></button>
                <input type="text" data-property="line" placeholder="${txt.line}" oninput="editTxt(this,${idx})">
                <i class="fas fa-text-height"></i> <input type="range" value="${txt.size}"  min="10" step="2" data-property="size" oninput="editTxt(this ,${idx})">
                <input type="color" value="${txt.color}" data-property="color" oninput="editTxt(this,${idx})">
                Family: 
                <select data-property="fontFamily" oninput="editTxt(this,${idx})">
                    <option value="${txt.fontFamily}">${txt.fontFamily}</option>
                    <option value="Tahoma">Tahoma</option>
                    <option value="Geneva">Geneva</option>
                    <option value="Verdana">Verdana</option>
                </select>
            </p>

            <p>
                <i class="fas fa-arrows-alt-h"></i> <input type="number" value="${txt.x}"  min="0" step="5" data-property="x" oninput="editTxt(this ,${idx})">
                <i class="fas fa-arrows-alt-v"></i> <input type="number" value="${txt.y}"  min="0" step="5" data-property="y" oninput="editTxt(this ,${idx})">
                <select data-property="align" oninput="editTxt(this,${idx})">
                    <option value="left">left</option>
                    <option value="center">center</option>
                    <option value="right">right</option>
                </select>
            </p>

            <p>
                <input id="outline" type="checkbox" data-property="isOutline" checked onclick="editTxt(this,${idx})">
                <label for="outline">Outline</label>
                Width: <input type="number" value="${txt.lineWidth}"  min="0" step="1" data-property="lineWidth" oninput="editTxt(this ,${idx})">
                <input type="color" value="${txt.strokeStyle}" data-property="strokeStyle" oninput="editTxt(this,${idx})">
            </p>
            <p>
                <input id="shadow" type="checkbox" data-property="isShadow" onclick="editTxt(this,${idx})">
                <label for="shadow">Shadow</label>
                <input type="color" value="${txt.shadowColor}" data-property="shadowColor" oninput="editTxt(this,${idx})">
                <i class="fas fa-arrows-alt-h"></i> <input type="number" value="${txt.shadowOffsetX}"  step="1" data-property="shadowOffsetX" oninput="editTxt(this ,${idx})">
                <i class="fas fa-arrows-alt-v"></i> <input type="number" value="${txt.shadowOffsetY}"  step="1" data-property="shadowOffsetY" oninput="editTxt(this ,${idx})">
                Blur: <input type="number" value="${txt.shadowBlur}" data-property="shadowBlur" oninput="editTxt(this,${idx})">
            </p>
        </div>
        `
    })
    .join(' ');

    document.querySelector('.txts-list').innerHTML = strHtml;
}

function newTxtBtnClicked() {
    gMeme.txts.push(createTxt('New Line', 150, 150));
    drawCanvas();
    renderTxtsEditor();
}

function deleteTxt(txtIdx) {
    gMeme.txts.splice(txtIdx, 1);
    drawCanvas();
    renderTxtsEditor();
}

/* REGISTER DOWNLOAD HANDLER */
function dlCanvas(eldllink) {
    var canvas = document.querySelector('.memeCanvas');

    var dt = canvas.toDataURL('image/png');
    dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
    dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=canvas.png');

    eldllink.href = dt;
}

function toggleView() {
    document.querySelector('.meme-container').classList.toggle('hidden');
    document.querySelector('.gallery').classList.toggle('hidden');
}

function handleMouseDown(event) {
    startDragging(event.clientX, event.clientY);
}

function handleMouseMove(event) {
    if (isDragging) {
        continueDragging(event.clientX, event.clientY);
    }
}

function handleMouseUp() {
    stopDragging();
}

function getTouchPos(canvas, touchEvent) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width / window.devicePixelRatio;
    const scaleY = canvas.height / rect.height / window.devicePixelRatio;
    const x = (touchEvent.touches[0].clientX - rect.left) * scaleX;
    const y = (touchEvent.touches[0].clientY - rect.top) * scaleY;
    return { x, y };
}

function handleTouchStart(event) {
    const touch = event.touches[0];
    startDragging(touch.clientX, touch.clientY);
}

function handleTouchMove(event) {
    if (isDragging) {
        const touch = event.touches[0];
        continueDragging(touch.clientX, touch.clientY);
    }
}

function handleTouchEnd() {
    stopDragging();
}

function startDragging(clientX, clientY) {
    const canvas = document.querySelector('.memeCanvas');
    const mouseX = clientX - canvas.getBoundingClientRect().left;
    const mouseY = clientY - canvas.getBoundingClientRect().top;

    // Iterate through all text elements
    for (let i = 0; i < gMeme.txts.length; i++) {
        const txt = gMeme.txts[i];
        const textWidth = gCtx.measureText(txt.line).width;
        const textHeight = txt.size;

        const minX = txt.x - textWidth / 2;
        const minY = txt.y - textHeight / 2;
        const maxX = txt.x + textWidth / 2;
        const maxY = txt.y + textHeight / 2;

        if (mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY) {
            isDragging = true;
            selectedTxtIdx = i;
            initialMouseX = mouseX;
            initialMouseY = mouseY;
            break; // Break the loop after the first match
        }
    }
}







function continueDragging(clientX, clientY) {
    const canvas = document.querySelector('.memeCanvas');
    const mouseX = clientX - canvas.getBoundingClientRect().left;
    const mouseY = clientY - canvas.getBoundingClientRect().top;

    const deltaX = mouseX - initialMouseX;
    const deltaY = mouseY - initialMouseY;

    gMeme.txts[selectedTxtIdx].x += deltaX;
    gMeme.txts[selectedTxtIdx].y += deltaY;

    initialMouseX = mouseX;
    initialMouseY = mouseY;

    drawCanvas();
}

function stopDragging() {
    isDragging = false;
    selectedTxtIdx = -1;
}

function getImgSrc() {
    // imgIdx needed to find img src url in gImg[]
    var imgIdx = gImgs.findIndex(function (img) {
        return gMeme.selectedImgId === img.id;
    });

    return gImgs[imgIdx].url;
}

function drawCanvas() {
    gCtx.drawImage(gImgObj, 0, 0);

    gMeme.txts.forEach(function (txt) {
        drawTxt(txt);
    });
}

function drawTxt(txt) {
    gCtx.font = txt.size + 'px' + ' ' + txt.fontFamily;
    gCtx.textAlign = txt.align;
    gCtx.fillStyle = txt.color;
    if (txt.isShadow) addTxtShadow(txt);
    if (txt.isOutline) addTxtOutline(txt);

    gCtx.fillText(txt.line, txt.x, txt.y);
}

function addTxtShadow(txt) {
    gCtx.shadowColor = txt.shadowColor;
    gCtx.shadowOffsetX = txt.shadowOffsetX;
    gCtx.shadowOffsetY = txt.shadowOffsetY;
    gCtx.shadowBlur = txt.shadowBlur;
}

function addTxtOutline(txt) {
    gCtx.strokeStyle = txt.strokeStyle;
    gCtx.lineWidth = txt.lineWidth;
    gCtx.strokeText(txt.line, txt.x, txt.y);
}

/**
 * editTxt() gets changes for txt and update gMeme model.
 * Update gMeme.txts[].txt = {property:value}
 * Redraws canvas.
 * Input types: text, number, checkbox, dropdown.
 * 
 *  txtIdx - the specific txt to change in []. it's line num -1 because idx starts with 0.
 *  property - (using data-* attributes) ex. line, size, align, color, isShadow.. 
 *  value - ex. 'text', 30, left, red, true..
 */
function editTxt(elinput, txtIdx) {
    var property = elinput.dataset.property;  // using data-* attributes
    var value;

    switch (elinput.type) {
        case 'select-one':
            value = elinput.options[elinput.selectedIndex].value;
            break;
        case 'checkbox':
            value = elinput.checked;
            break;
        default: // text, number
            value = elinput.value;
            break;
    }
    gMeme.txts[txtIdx][property] = value;

    drawCanvas();
}


function renderTxtsEditor() {
    var strHtml = gMeme.txts.map(function (txt, idx) {
        return `
        <div class="txt-editor">
                   
                    <p>
                    <button onclick="deleteTxt(${idx})"><i class="fas fa-eraser"></i></button>
                    <input type="text" data-property="line" placeholder="${txt.line}" oninput="editTxt(this,${idx})">
                    <i class="fas fa-text-height"></i> <input type="range" value="${txt.size}"  min="10" step="2" data-property="size" oninput="editTxt(this ,${idx})">
                    <input type="color" value="${txt.color}" data-property="color" oninput="editTxt(this,${idx})">
                    Family: 
                    <select data-property="fontFamily" oninput="editTxt(this,${idx})">
                    <option value="${txt.fontFamily}">${txt.fontFamily}</option>
                    <option value="Tahoma">Tahoma</option>
                    <option value="Geneva">Geneva</option>
                    <option value="Verdana">Verdana</option>
                    </select>
                    </p>

                
                    <p>
                    <input id="outline" type="checkbox" data-property="isOutline" checked onclick="editTxt(this,${idx})">
                    <label for="outline">Outline</label>
                    Width: <input type="number" value="${txt.lineWidth}"  min="0" step="1" data-property="lineWidth" oninput="editTxt(this ,${idx})">
                    <input type="color" value="${txt.strokeStyle}" data-property="strokeStyle" oninput="editTxt(this,${idx})">
                    </p>
                    <p>
                    
                    <input id="shadow" type="checkbox" data-property="isShadow" onclick="editTxt(this,${idx})">
                    <label for="shadow">Shadow</label>
                    <input type="color" value="${txt.shadowColor}" data-property="shadowColor" oninput="editTxt(this,${idx})">
                    <i class="fas fa-arrows-alt-h"></i> <input type="number" value="${txt.shadowOffsetX}"  step="1" data-property="shadowOffsetX" oninput="editTxt(this ,${idx})">
                    <i class="fas fa-arrows-alt-v"></i><input type="number" value="${txt.shadowOffsetY}"  step="1" data-property="shadowOffsetY" oninput="editTxt(this ,${idx})">
                    Blur: <input type="number" value="${txt.shadowBlur}" data-property="shadowBlur" oninput="editTxt(this,${idx})">
                    </p>
                 
                </div>
        `
    })
        .join(' ');

    document.querySelector('.txts-list').innerHTML = strHtml;

}

function newTxtBtnClicked() {
    gMeme.txts.push(createTxt('New Line', 150, 150));
    drawCanvas();
    renderTxtsEditor();
}

function deleteTxt(txtIdx) {
    gMeme.txts.splice(txtIdx, 1); //arr.splice(start, deleteCount)
    drawCanvas();
    renderTxtsEditor();
}


/* REGISTER DOWNLOAD HANDLER */
function dlCanvas(eldllink) {
    var canvas = document.querySelector('.memeCanvas');

    var dt = canvas.toDataURL('image/png');
    /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
    dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');

    /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
    dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=canvas.png');

    eldllink.href = dt;
}

function toggleView() {
    document.querySelector('.meme-container').classList.toggle('hidden');
    document.querySelector('.gallery').classList.toggle('hidden');
}
