

const width = 410;
const height = 380;

let img = null;

// SLIDERS
const rslider = $('#redslider');
const gslider = $('#greenslider');
const bslider = $('#blueslider');
const tslider = $('#toleranceslider');

// SELECTS
const presel = $('#pselect');

// BUTTON
const dwn = $('#download');

//COLOR SELECTOR
let sc_r = 0, sc_g = 0, sc_b = 0;
const ColBox = $('#colorbox');
let isSelectingColor = false;


function setup() {
    createCanvas(width, height).parent('canvas');
    pixelDensity(1);

    const htmldrop = select('#drop');

    htmldrop.dragOver(function (){
        htmldrop.addClass('dragOver');
    });
    htmldrop.dragLeave(function(){
        htmldrop.removeClass('dragOver');
    });
    htmldrop.drop(function(file){
        img = loadImage(file.data);

        htmldrop.removeClass('dragOver');
        clear();
    });

}
  



function draw() {
    background(150,0);
    // console.log(mouseInCanvas());

    if(img === null) return;

    let cRatio = width/height;

    let imgwidth = img.width;
    let imgheight = img.height;
    let imgRatio = imgwidth/imgheight;

    let x = 0, y = 0, w, h;

    if(imgRatio  > cRatio) {
        w = width;
        h = w/imgRatio;
        y = (height - h)/2;

    } else {
        h = height;
        w = imgRatio * h;
        x = (width - w)/2;
    }

    image(img, x, y, w, h);

    loadPixels();

    if(isSelectingColor && mouseInCanvas()) {
        x = Math.round(mouseX);
        y = Math.round(mouseY);

        let index = (y*width + x)*4;

        sc_r = pixels[index + 0];
        sc_g = pixels[index + 1];
        sc_b = pixels[index + 2];
        ColBox.css('background-color',  `rgb(${sc_r}, ${sc_g}, ${sc_b}) `);

    }

    if(presel.val() === 'gs') gs(pixels);
    else if(presel.val() === 'bw') blackwhite(pixels);
    else if(presel.val() === 'sic') singleColor(pixels);
    else defaultFilter(pixels);
    
    updatePixels();


}


//[]




////////FILTERS///////////

function gs(pixels) {
    for(let pixel = 0; pixel < pixels.length/4; pixel++){
        let i = pixel *4;
        let average = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
        pixels[i+0] = average;
        pixels[i+1] = average;
        pixels[i+2] = average;
        
    }
}

function blackwhite(pixels) {
    for(let pixel = 0; pixel < pixels.length/4; pixel++){
        let i = pixel *4;
        let average = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
        
        if(average > 127 ) {
            pixels[i+0] = 255;
            pixels[i+1] = 255;
            pixels[i+2] = 255;
        } else {
            pixels[i+0] = 0;
            pixels[i+1] = 0;
            pixels[i+2] = 0;
        }

        
    }
}

function singleColor(pixels) {
    for(let pixel = 0; pixel < pixels.length/4; pixel++){
        let i = pixel *4;

        let tolerance = Number(tslider.val());
        let difference = Math.abs(pixels[i+0] - sc_r) +  Math.abs(pixels[i + 1] - sc_g) +  Math.abs(pixels[ + 2] - sc_b);

        if (difference < tolerance) continue;

        let average = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
        pixels[i+0] = average;
        pixels[i+1] = average;
        pixels[i+2] = average;
    }   
}

function defaultFilter(pixels) {
    let r = Number(rslider.val());
    let g = Number(gslider.val());
    let b = Number(bslider.val());
        
        
     for(let pixel = 0; pixel < pixels.length/4; pixel++){
        let i = pixel *4;
        pixels[i+0] = pixels[i+0] + r;
        pixels[i+1] = pixels[i+1] + g;
        pixels[i+2] = pixels[i+2] + b;
    }


}


function mouseClicked() {
    if(mouseInCanvas()) {
        $('body').removeClass('picking-color');
        isSelectingColor=false;
    }
}

function mouseInCanvas(){
    if(mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) return true;
    else return false;
}

//Color Box//
ColBox.click(function() {
    isSelectingColor=true;
    $('body').addClass('picking-color');
});






/////// DONWLOAD BUTTON ///////

dwn.click(function() {

    img.loadPixels();

    //BACKUP PIXEL VALUES
    let pixelBackUp = [];

    for(let i = 0; i < img.pixels.length; i++){
        pixelBackUp.push(img.pixels[i]);
        
    }

    //APPLY FILTERS
    if(presel.val() === 'gs') gs(img.pixels);
    else if(presel.val() === 'bw') blackwhite(img.pixels);
    else if(presel.val() === 'sic') singleColor(img.pixels);
    else defaultFilter(img.pixels);

    
    img.updatePixels();

    //SAVE
    save(img, 'edit.png');

    //RESTORE IMAGE VALUES

    img.loadPixels();

    for(let i = 0; i < img.pixels.length; i++){
        img.pixels[i] = pixelBackUp[i];
        
    }
    img.updatePixels();
});






//GRADIENT AND TAGS IN SLIDERS

document.querySelectorAll('.scontainer').forEach(container => {
    let slider = container.querySelector('.slider');
    
    // Insert slider value tag and limit labels
    container.insertAdjacentHTML('beforeEnd', `  
    <div class="slider-value">
      ${slider.value}
    </div>
  
    <div class="slider-labels">
      <p>${slider.min}</p>
      <p>${slider.max}</p>
    </div>
    `);
    
    // Init slider background
    let percentage = 100*(slider.value-slider.min)/(slider.max-slider.min);
    slider.style.background = `linear-gradient(90deg, #e53333, #fda114, #e5f02d, #62ee43, #45bcf6, #f13ef2 ${percentage}%, aliceblue ${percentage}%)`;
    
    // Update when value changes
    slider.addEventListener('input', event => {
      // Update background gradient
      let s = event.target;
      let percentage = 100*(s.value-s.min)/(s.max-s.min);
      event.target.style.background = `linear-gradient(90deg, #e53333, #fda114, #e5f02d, #62ee43, #45bcf6, #f13ef2 ${percentage}%, aliceblue ${percentage}%)`;
      
      // Update value tag
      s.parentNode.querySelector('.slider-value').innerHTML = s.value;
    });
});


document.querySelectorAll('.sscontainer').forEach(container => {
    let slider = container.querySelector('.sslider');
    
    // Insert slider value tag and limit labels
    container.insertAdjacentHTML('beforeEnd', `<div class="sslider-value"> ${slider.value} </div> `);
  
  // Init slider background
  let percentage = 100*(slider.value-slider.min)/(slider.max-slider.min);
  slider.style.background = `linear-gradient(90deg, #e53333, #fda114, #e5f02d, #62ee43, #45bcf6, #f13ef2 ${percentage}%, aliceblue ${percentage}%)`;
  
  // Update when value changes
  slider.addEventListener('input', event => {
    // Update background gradient
    let s = event.target;
    let percentage = 100*(s.value-s.min)/(s.max-s.min);
    event.target.style.background = `linear-gradient(90deg, #e53333, #fda114, #e5f02d, #62ee43, #45bcf6, #f13ef2 ${percentage}%, aliceblue ${percentage}%)`;
    
    // Update value tag
    s.parentNode.querySelector('.sslider-value').innerHTML = s.value;
  });
});