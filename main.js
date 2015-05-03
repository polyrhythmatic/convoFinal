var rilexicon = new RiLexicon;

var transcript;
var pictureBlob = {};
var body;

$.getJSON('data/transcrips.js').done(function(data) {
    body = data;
    for (var i = 0; i < body.length; i++) {
        body[i].recording = loadSound('data/' + body[i].recording);
        getTranscript(body[i].transcript, i);
    }
});

function getTranscript(transcriptName, num) {
    $.getJSON('data/' + transcriptName).done(function(data) {
        body[num].loadedTranscript = data;
        console.log("successfully loaded " + data);
        associatePictures(data);
    });
}

function associatePictures(data) {
    for (var i = 0, max = data.length; i < max; i++) {
        for (var j = 0, jmax = data[i].words.length; j < jmax; j++) {
            searchWord = data[i].words[j][0];
            if (rilexicon.isNoun(searchWord) && !String.isStopWord(searchWord)) {
                if (!pictureBlob[searchWord]) {
                    pictureBlob[searchWord] = [];
                    getUrl(searchWord);
                }
            }
        }
    }
};

var startTime = 0;
var counter = 0;
var currentConvoNum = 0;
var isPlaying = false;
var countMax = 0;

function draw() {
    //console.log(counter + " at time " + currTime(Date.now()))
    if (body[currentConvoNum].loadedTranscript) {
        countMax = body[currentConvoNum].loadedTranscript.length;
        if (!isPlaying) {
            body[currentConvoNum].recording.play();
            startTime = Date.now();
            isPlaying = true;
            counter = 0;
        }
        console.log(counter + " and countmax " + countMax)
        if (body[currentConvoNum].loadedTranscript[counter].start < currTime(Date.now())) {
            var subTranscript = body[currentConvoNum].loadedTranscript[counter].words;
            var line = '';
            for (var i = 0, max = subTranscript.length; i < max; i++) {
                word = subTranscript[i][0];
                line += word + ' ';
                if (pictureBlob[word]) {
                    //console.log(word);
                    $("#imageDiv").html('<img src=' + pictureBlob[word] + ' style=\"height:500px\"/>');
                }
            }
            $("#subtitle").html(line);
        }
        if (body[currentConvoNum].loadedTranscript[counter].end < currTime(Date.now()) && counter < countMax-1) {
            counter++;
        }
        if (body[currentConvoNum].recording.duration() < currTime(Date.now())) {
            currentConvoNum++
            isPlaying = false;
        }
    }
}

function getUrl(searchString) {
    //console.log('request for ' + searchString);
    var photoUrl = '';
    $.getJSON("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=572dfbfd0b23648fd7b366ab2750668f&tags=" + searchString + "&page=1&format=json&nojsoncallback=1").done(function(data) {

        var pic = {
            id: data.photos.photo[0].id,
            owner: data.photos.photo[0].owner,
            secret: data.photos.photo[0].secret,
            server: data.photos.photo[0].server,
            farm: data.photos.photo[0].farm,
            title: data.photos.photo[0].title,
        }
        photoUrl = "https://farm" + pic.farm + ".staticflickr.com/" + pic.server + "/" + pic.id + "_" + pic.secret + "_b.jpg";
        //console.log(photoUrl);
        pictureBlob[searchString].push(photoUrl);
        //console.log(searchString + ' and ' + photoUrl);
    });
}

function currTime(time) {
    return (time - startTime) / 1000;
}
