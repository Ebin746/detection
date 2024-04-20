let model;
//change to required images only

const imageInput = document.getElementById('imageInput');
const detectButton = document.getElementById('detectButton');
const resultContainer = document.getElementById('resultContainer');
const displayedImage = document.getElementById('displayedImage');
const resultList=document.getElementById('resultsList');

cocoSsd.load().then(loadedModel => {
  model = loadedModel;
  console.log('Model loaded successfully.');
}).catch(err => {
  console.error('Error loading the model:', err);
});

imageInput.addEventListener('change', handleImageInputChange);

function handleImageInputChange(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      displayedImage.onload = function () {
        detectObjects(displayedImage);
      };
      displayedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function detectObjects(image) {
  if (image.naturalWidth === 0 || image.naturalHeight === 0) {
    console.error('Error: Invalid image dimensions.');
    return;
  }
  model.detect(image).then(predictions => {
    displayResults(predictions);
  });
}


function displayResults(predictions) {
  resultContainer.innerHTML = '';
  resultList.innerHTML="";
  const chairs = predictions.filter(prediction => (prediction.class === 'chair' || prediction.class === 'bench' || prediction.class === 'bed'|| prediction.class === 'couch') && prediction.score > 0.1);
  const persons = predictions.filter(prediction => prediction.class === 'person' && prediction.score > 0.1);

  if (chairs.length === 0) {
    const noChairsMessage = document.createElement('p');
    noChairsMessage.textContent = 'No chairs or benches detected.';
    resultContainer.appendChild(noChairsMessage);
  } else {
    chairs.forEach(prediction => {
      const highlighter = document.createElement('div');
      highlighter.className = 'highlighter green';
      highlighter.style.left = prediction.bbox[0] + 'px';
      highlighter.style.top = prediction.bbox[1] + 'px';
      highlighter.style.width = prediction.bbox[2] + 'px';
      highlighter.style.height = prediction.bbox[3] + 'px';
      resultContainer.appendChild(highlighter);
    });
  }

  persons.forEach(prediction => {
    const highlighter = document.createElement('div');
    highlighter.className = 'highlighter red';
    highlighter.style.left = prediction.bbox[0] + 'px';
    highlighter.style.top = prediction.bbox[1] + 'px';
    highlighter.style.width = prediction.bbox[2] + 'px';
    highlighter.style.height = prediction.bbox[3] + 'px';
    resultContainer.appendChild(highlighter);
  });

  predictions.forEach(prediction => {
    const details = document.createElement('p');
    details.textContent = `${prediction.class} - Confidence: ${Math.round(prediction.score * 100)}%`;
    resultContainer.appendChild(details);
    resultList.appendChild(details);
    console.log(`Detected ${prediction.class} with confidence ${Math.round(prediction.score * 100)}%`);
  });
}

detectButton.addEventListener('click', () => {
  if (displayedImage.src) {
    detectObjects(displayedImage);
  } else {
    console.log('Please select an image first.');
  }
});
