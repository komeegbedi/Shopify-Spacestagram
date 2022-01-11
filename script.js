'use strict';

const gallery = document.querySelector('section.gallery div.row');
const loadingScreen = document.querySelector('p.loading-text');

/*  Fecthing the Data from the APOD API and returning data
    The Data returned contains all the posts for the current month(copyright , title, date , explanation, 
    the type of media[video or image] , url to media) and the index of the post.
*/
const fetchData = async () =>{

    const API_KEY = 'OYrC1WZg8vIJ3RwcdxfXPNaR8DKKNijv5qfsxgqt';
    const URL = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;
    const query = `&start_date=2022-${new Date().getMonth()+1}-01`;

    const response = await fetch(URL+query);

    if (response.status !== 200) {
        throw new Error('there was an error getting the information');
    }

    const data = await response.json();
    return data;
}//fetchData()


const loadPost = () =>{

    const maxLength = 50; //max lenght of number of words to show initial , will only affect screen sizes <= 992
    let isLiked;
    let ignoredMedia = 0; // this is used to keep the design of the page continuous (on large screens like a desktop). 
                         // The design of the page is that the even-numbered post will align it's image to the left while the odd-numbered post will be aligned to the right
                         // since we are only going to be accepting images, if a video skipped two  posts in a row will have it's images aligned at the same side.

    fetchData()
    .then(data => {

        data.forEach((post , index) => {

            if (post.media_type === 'image') { // videos will be ignored

               
                // for mobile devices the explanation might be long and users may not want to read that post, they may want to read the next post
                // if the explanation of a post is long, it going take a longer time for the user to reach the post they actually want to read causing tiredness in the hands from scrolling
                // Solution: have a max lenght for the numbers of words that should show then if users want to read that post, they can click "read more" to expand the explanation

                let text = post.explanation.trim();

                //Spliting the explanation in order to count how many words are there and also to hide some part of the text if it passes the max lenght. (affected only by screen sizes <= 992)
                let splitText = text.split(' ');
                let displayText = text;
                let hiddenText = '';

                isLiked = localStorage.getItem(index); // check if the post has been liked by the user previously. 

                
                if (splitText.length > maxLength &&  window.innerWidth <= 992){ 
    
                    displayText = splitText.slice(0 , maxLength).join(' ');
                    hiddenText = `<span class="hidden">${splitText.slice(maxLength , text.length).join(' ')}</span>`;
                }

                let html = `
                    <article class="col-lg-3 col-sm-12" id="${index}">

                        <img src="${post.url}" class="${(index + ignoredMedia) % 2 === 0 ? "left-align": "right-align"}" alt="${post.title}">
                        <div class="container info-wrapper">
                            <h3 class="title">${post.title}</h3>
                            <time>${post.date}</time>

                            <p>${displayText +' '+ hiddenText} `;
                        
                if(hiddenText.length !== 0){
                    html+= `<a href='javascript:void(0)' class="read-more">read more</a>`;
                }

                html+= `</p>

                            <button  class="like-btn">
                                <i class="${isLiked ? 'fas fa-heart' : 'far fa-heart'}"></i>
                            </button>
                        </div>
                    </article>`;

                gallery.innerHTML += html;
            }
            else{
                ignoredMedia++;
            }//if-else

        });

        loadingScreen.style.display = "none";
    })
    .catch(err => console.log(err));
}

//this function listens for click on the gallery section
//I added the event listener to just the galery and not each indiviual post to improvement performance over time
const listenForEvents = () => {

    gallery.addEventListener('click' , e => {

        let parentTag;

        if (e.target.tagName === 'I' || e.target.tagName === 'BUTTON' ){

            parentTag = e.target.parentNode;

            if(parentTag.tagName !== 'ARTICLE'){

                parentTag = parentTag.parentNode.parentNode;
            }

            likeBtn(parentTag.getAttribute('id'));
        }
        else if(e.target.tagName === 'A'){

            parentTag = e.target.parentNode.parentNode.parentNode;

            readMore(parentTag.getAttribute('id'));
        }
        
    });
}

const likeBtn = id =>{

    const likeBtn = document.getElementById(id).querySelector('i');

    if (likeBtn.classList.contains('far')){ // the post has not liked yet

        likeBtn.setAttribute('class', 'fas fa-heart');
        localStorage.setItem(id , 'liked');
    }
    else{//post has been liked already

        likeBtn.setAttribute('class', 'far fa-heart');
        localStorage.removeItem(id); //removing the item from local storage in order to space
    }
}

const readMore = id => {

    const linkClicked = document.getElementById(id).querySelector('a');
    const paragraph = document.getElementById(id).querySelector('p span');

    paragraph.classList.toggle('hidden');

    if(paragraph.classList.contains('hidden')){
        linkClicked.innerHTML = 'read more';
    }
    else{
        linkClicked.innerHTML = 'read less';
    }
}


const scrollFunction = () => {
    const scrollUp = document.getElementById("scrollUp");

    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollUp.style.display = "block";
    }
    else {
        scrollUp.style.display = "none";
    }
}

const clickHandler = function (e) {
    e.preventDefault();
    const href = this.getAttribute("href");
    const offsetTop = document.querySelector(href).offsetTop;
    scroll({
        top: offsetTop,
        behavior: "smooth"
    });
}


const main = () => {

    loadPost();
    listenForEvents();

    onscroll = () => {
        scrollFunction();
    };

    particlesJS.load('particles-js', 'assets/particles.json');

    //helps to force smooth scroll on devices that don't support it
    window.__forceSmoothScrollPolyfill__ = true;
    document.querySelectorAll(".smooth-scroll").forEach(link => {
        link.addEventListener("click", clickHandler)
    });

}

main();

