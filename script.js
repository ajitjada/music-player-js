console.log("lets start javascript");

let currentsong = new Audio();
let songs;
let currfolder;


function secondtominute(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingseconds = Math.floor(seconds % 60);

    const formattedminutes = String(minutes).padStart(2, '0');
    const formattedseconds = String(remainingseconds).padStart(2, '0');

    return `${formattedminutes}:${formattedseconds}`
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`${folder}/`)
    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(element.href.split("cs").slice(-1)[0]))    // %5Cncs%5C     %5Ccs%5C
        }
    }


    // Show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" width="34px" src="https://ico.hugeicons.com/music-note-01-stroke-rounded@2x.webp?v=1.0.0" alt="">
                            <div class="info">
                                <div class="cen" > ${song} </div>
                                <div>artist</div>
                            </div>
                            <div class="playnow">
                                <img class="invert" width="30px" src="https://ico.hugeicons.com/play-circle-stroke-rounded@2x.webp?v=1.0.0" alt="">
                            </div>
                        </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    return songs

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentsong.src = `/${currfolder}/${encodeURIComponent(track)}`
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}


async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("songs")) {
            let folder = e.href.split("%5C").slice(-1)[0].replaceAll("/", "")
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            // console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
                         <div  class="play">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                 <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                     stroke-linejoin="round" />
                             </svg>
                        </div>

                         <img src="/songs/${folder}/cover.jpg" alt="">
                         <h2>${response.title}</h2>
                         <p>${response.description} </p>
                     </div>`
        }
    }



}


async function main() {
    // Get the list of all the songs
    await getsongs("songs/cs")
    playMusic(songs[0], true)

    //displaying album
    await displayAlbums()


    // Attach an event listner to play, next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate eventAdd an event listener
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondtominute(currentsong.currentTime)}/${secondtominute(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";


    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    })

    //Add an event listener for humburger
    document.querySelector(".humbarger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0";
    })

    // Add an event listener for close
    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Previous
    previous.addEventListener("click", e => {
        let index = songs.indexOf(decodeURIComponent(currentsong.src.split("/").slice(-1)[0]))
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Next
    next.addEventListener("click", e => {
        let index = songs.indexOf(decodeURIComponent(currentsong.src.split("/").slice(-1)[0]))
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log("Setting volume to", e.target.value, "/ 100")
        currentsong.volume = parseInt(e.target.value) / 100
        if (currentsong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item, item.currentTarget.dataset.folder)
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }

        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 30;
        }
    })

    currentsong.addEventListener("ended", () => {
        let index = songs.indexOf(decodeURIComponent(currentsong.src.split("/").slice(-1)[0]))

        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
        else {
            playMusic(songs[0]);
        }
    });

}

main();