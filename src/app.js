import { clearCookie, getCookie, setCookie } from './cookie';
import '@plugins/slick-slider/slick.css';
import '@plugins/jquery-form-styler/jquery.formstyler.css';
import '@plugins/jquery-form-styler/jquery.formstyler.theme.css';
import './css/style.css';
import './css/media.css';
// import slider_1_background_img from '@img/slider-background.png';
// import header_logo_img from '@img/header-logo.png';
import { User } from './user';

// JQUERY FORM STYLER
(function($) {
    $(function() {
        $('select').styler({
            selectSmartPositioning: true,
        });
    });
})(jQuery);

const form = document.querySelector('#booking-form');
const dateInput = document.querySelector('#date-input');
const timeInput = document.querySelector('#time-input');
const daurationInput = document.querySelector('#dauration-input');
const addressInput = document.querySelector('#address-input');
const workDescriptionInput = document.querySelector('#work-description-input');
const submitBtn = document.querySelector('#submit-btn');
const authBtn = document.querySelector('#auth-btn');
const showAllBtn = document.querySelector('#show-all-btn');
const showMenuBtn = document.querySelector('#header-menu-btn');


var USER = {};
var ID_TOKEN;
var signInWindow;

//
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

//
var isValid = false;
// submitBtn.disabled = true;
let date = new Date();
// dateInput.value = date;
// timeInput.value = `${date.getHours()}:${date.getMinutes()}`;


// click on menu icon
showMenuBtn.addEventListener('click',(event) => {
    let menu = document.querySelector('.menu ul');
    let menuStyle = window.getComputedStyle(menu);
    if (menuStyle.display == 'none') {
        menu.style.display = 'block'
    } else {
        menu.style.display = 'none';
    }
});

window.addEventListener(                                            // ON LOAD WINDOW
    'load', (event) => {
        USER.name = getCookie('name');
        USER.email = getCookie('email');
        USER.group = getCookie('group');
        // console.log('[window.onLoad] userName:', userName);
        ID_TOKEN = USER.email ? getCookie(USER.email) : null;
        // console.log('[window.onLoad] idToken:', idToken);
        // console.log('[window.onLoad] slider-1: ', document.querySelector('.slider-1'));
        // console.log('[window.onLoad] slider-1 image: ', header_logo_img);
        // let img = document.createElement('img');
        // img.src = slider_1_background_img;
        // document.querySelector('.slider-1').appendChild(img);
        // document.querySelector('.header__logo_image').src = header_logo_img;
        // document.querySelector('.slider-1').style.backgroundImage = slider_1_background_img;
        // setFormState(USER);
});