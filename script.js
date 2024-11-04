let prd = null;
let uuid = '';

const API_KEY = '184E246C448E0B2A88D604EB9A6A31DF';
const SECRET_KEY = '1B35D150713F893B0625D02F5A4D540E';

function headers() {
    return {
        'X-Key': 'Key ' + API_KEY,
        'X-Secret': 'Secret ' + SECRET_KEY,
    }
}
function params() {
    return {    
        type: "GENERATE",
        style: style.value,
        width: width.value,
        height: height.value,
        num_images: 1,
        negativePromptUnclip: negative.value,
        generateParams: {
            query: query.value,
        }
    }
}

async function generate() {
    document.getElementById('statusMessage').textContent = "Wait please...";
    document.getElementById('statusMessage').style.color = "#b3b3b3";

    let model_id = 0;
    {
        let res = await fetch('https://api-key.fusionbrain.ai/key/api/v1/models', {
            method: 'GET',
            headers: headers(),
        });
        res = await res.json();
        model_id = res[0].id;
    }

    let formData = new FormData();
    formData.append('model_id', model_id);
    formData.append('params', new Blob([JSON.stringify(params())], { type: "application/json" }));

    let res = await fetch('https://api-key.fusionbrain.ai/key/api/v1/text2image/run', {
        method: 'POST',
        headers: headers(),
        body: formData,
    });
    let json = await res.json();
    console.log(json);

    uuid = json.uuid;
    if (json.uuid) prd = setInterval(check, 3000);
}

async function check() {
    let res = await fetch('https://api-key.fusionbrain.ai/key/api/v1/text2image/status/' + uuid, {
        method: 'GET',
        headers: headers(),
    });
    let json = await res.json();
    console.log(json);

    switch (json.status) {
        case 'INITIAL':
        case 'PROCESSING':
            break;

        case 'DONE':
            const imgElement = document.getElementById('img');
            imgElement.src = 'data:image/jpeg;charset=utf-8;base64,' + json.images[0];
            imgElement.style.display = 'block';

            document.getElementById('statusMessage').textContent = "Done!";
            document.getElementById('statusMessage').style.color = "#4CAF50";

            clearInterval(prd);
            break;

        case 'FAIL':
            clearInterval(prd);
            console.error("Ошибка при генерации изображения.");

            document.getElementById('statusMessage').textContent = "Error";
            document.getElementById('statusMessage').style.color = "#FF0000";
            break;
    }
}

// Получаем элементы ввода и кнопку
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const generateButton = document.getElementById('generate');

// Проверка и корректировка значений после потери фокуса
function validateInput(input) {
    let value = parseInt(input.value, 10);
    if (isNaN(value)) return;

    if (value < 128) {
        input.value = 128;
    }
    else if (value > 1024) {
        input.value = 1024;
    }
}

widthInput.addEventListener('blur', () => validateInput(widthInput));
heightInput.addEventListener('blur', () => validateInput(heightInput));

function toggleClearButton() {
    const queryInput = document.getElementById('query');
    const clearButton = document.getElementById('clearButton');
    clearButton.style.display = queryInput.value ? 'inline' : 'none';
}

function clearInput() {
    const queryInput = document.getElementById('query');
    queryInput.value = '';
    toggleClearButton();
}

document.getElementById("clearQuery").addEventListener("click", function () {
    document.getElementById("query").value = "";
});

document.getElementById("clearNegative").addEventListener("click", function () {
    document.getElementById("negative").value = "";
});

window.onload = async () => {
    let res = await fetch('https://cdn.fusionbrain.ai/static/styles/web');
    res = await res.json();
    for (let style of res) {
        document.getElementById('style').innerHTML += `<option value="${style.name}">${style.name}</option>`;
    }
};
