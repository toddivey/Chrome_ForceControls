// import { ObjectDetection } from "../../src";

const video = document.getElementById("myvideo");
const handimg = document.getElementById("handimage");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let nextImageButton = document.getElementById("nextimagebutton");
let updateNote = document.getElementById("updatenote");

let imgindex = 1
let isVideo = false;
let model = null;

// video.width = 500
// video.height = 400

const modelParams = {
    flipHorizontal: true,   // flip e.g for video
    maxNumBoxes: 2,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.85,    // confidence threshold for predictions.
}


function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        video.style.display = 'none'
        if (status) {
            updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}

trackButton.addEventListener("click", function(){
    toggleVideo();
});

function nextImage() {

    imgindex++;
    handimg.src = "images/" + imgindex % 15 + ".jpg"
    // alert(handimg.src)
    runDetectionImage(handimg)
}


let arrOfXVal = [];
let arrOfYVal = [];

setInterval(function(){
    arrOfXVal = [];
    arrOfYVal = [];},
    2500);

function swipeX(anArrX){
    let leftVal,
        rightVal;
        if (anArrX[0] > 250){
            rightVal = anArrX[0];
            leftVal = anArrX[anArrX.length -1]
            if (rightVal - leftVal > 250){
                 console.log('LEFT SWIPE')
                //  window.history.back();
                arrOfXVal = [];
            }
        } else if (anArrX[0] < 250){
            leftVal = anArrX[0];
            rightVal = anArrX[anArrX.length -1]
            if (leftVal - rightVal < -100){
                 console.log('RIGHT SWIPE')
                //  window.history.forward();
                arrOfXVal = [];
            }
        }
    }

function swipeY (anArrY){
        let bottomVal,
            topVal;
         if (anArrY[0] > 170){
                bottomVal = anArrY[0]
                topVal = anArrY[anArrY.length - 1];
                    if (bottomVal - topVal > 100){
                    console.log('SWIPE UP');
                    window.scrollBy(0, 100)
                    }
            } else if (anArrY[0] < 170){
                bottomVal = anArrY[anArrY.length - 1];
                topVal = anArrY[0];
                    if (bottomVal + topVal > 300){
                    console.log('SWIPE DOWN');
                    window.scrollBy(0, -100)
            }
        }
    }

function doubleSwipe(anArr){
    let leftHand;
    let rightHand;
    for (let i = 0; i < anArr.length; i++){
    if (anArr[i].x1 > anArr[i].x2){
        leftHand = anArr[i].x2;
        rightHand = anArr[i].x1
        // console.log('LEFTHAND:', leftHand, 'RIGHTHAND:', rightHand)
        if ((rightHand - leftHand) > 400){
            console.log("RELOAD")
            arrOfXVal = [];
            // location.reload()
        }
    } else{
        leftHand = anArr[i].x1;
        rightHand = anArr[i].x2
         console.log('LEFTHAND:', leftHand, 'RIGHTHAND:', rightHand)
        if ((rightHand - leftHand) > 350){
            console.log("RELOAD")
            // location.reload()
            arrOfXVal = [];

        }
    }
    }
}

function runDetection() {
    model.detect(video).then(predictions => {
        //   console.log("Predictions: ", predictions);
        //Need a function to test whether a hand is being picked up in a certain part of the screen. If so then run the swipe function.
        if (predictions.length === 1){
            arrOfXVal.push(predictions[0].bbox[0] + (predictions[0].bbox[2] / 2));
            arrOfYVal.push(predictions[0].bbox[1] + (predictions[0].bbox[3] / 2))
             console.log('ARR OF X:', arrOfXVal, 'ARR OF Y', arrOfYVal)
            if (arrOfYVal[0] > 230 || arrOfYVal[0] < 270){
                swipeX(arrOfXVal)
            }
            if (arrOfXVal[0] > 300 || arrOfXVal[0] < 350){
                swipeY(arrOfYVal)
                }
            }
        if (predictions.length === 2){
            arrOfXVal.push({
                x1 :predictions[0].bbox[0] + (predictions[0].bbox[2] / 2),
                x2: predictions[1].bbox[0] + (predictions[1].bbox[2] / 2)
            })
            doubleSwipe(arrOfXVal)
        }
        //    swipeX(arrOfXVal)
        //    swipeY(arrOfYVal)

        model.renderPredictions(predictions, canvas, context, video);
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

function runDetectionImage(img) {
    model.detect(img).then(predictions => {
        // console.log("Predictions: ", predictions);
        model.renderPredictions(predictions, canvas, context, img);
    });
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    runDetectionImage(handimg)
    trackButton.disabled = false
    // nextImageButton.disabled = false
});




