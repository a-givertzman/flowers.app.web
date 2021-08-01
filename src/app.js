import { 
    signInWithEmailAndPassword, 
    signUpWithEmailAndPassword, 
    getAuthForm, 
    renderModalAfterAuth 
} from './auth';
import { Booking, bookingStatus, renderBookings } from './booking';
import { closeModalWindow, createModalWindow, hideElement, renderAuthBtn, renderSelectUserBtn, showElement } from './ui-util';
import { 
    validateAddressInput, 
    validateDateInput, 
    validateNumberInput, 
    validateWorkDescriptionInput 
} from './value_validators';
import { clearCookie, getCookie, setCookie } from './cookie';
import './styles.css';
import { User } from './user';


const form = document.querySelector('#booking-form');
const dateInput = document.querySelector('#date-input');
const timeInput = document.querySelector('#time-input');
const daurationInput = document.querySelector('#dauration-input');
const addressInput = document.querySelector('#address-input');
const workDescriptionInput = document.querySelector('#work-description-input');
const submitBtn = document.querySelector('#submit-btn');
const authBtn = document.querySelector('#auth-btn');
const showAllBtn = document.querySelector('#show-all-btn');

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
submitBtn.disabled = true;
let date = new Date();
dateInput.value = date;
timeInput.value = `${date.getHours()}:${date.getMinutes()}`;

window.addEventListener(                                            // ON LOAD WINDOW
    'load', (event) => {
        USER.name = getCookie('name');
        USER.email = getCookie('email');
        USER.group = getCookie('group');
        // console.log('[window.onLoad] userName:', userName);
        ID_TOKEN = USER.email ? getCookie(USER.email) : null;
        // console.log('[window.onLoad] idToken:', idToken);
        
        setFormState(USER);
});

form.addEventListener('submit', submitFormHandler);
authBtn.addEventListener('click', signInHandler);
showAllBtn.addEventListener('click', showAllHandler);

//
function signInHandler(event) {
    signInWindow = createModalWindow('Авторизация', getAuthForm(), 'modal-window');

    let modalForm = document.querySelector('#auth-form');
    modalForm.addEventListener('submit', submitAuthFormHandler);

    let modalSignUpForm = document.querySelector('#sign-up-form');
    modalSignUpForm.addEventListener('submit', submitSignUpFormHandler);
}

//
function submitSignUpFormHandler(event) {
    console.log('submiiting sign up form');
    event.preventDefault();
    const name = event.target.querySelector('#name-input').value;
    const email = event.target.querySelector('#email-input').value;
    const password = event.target.querySelector('#password-input').value;
    const signUpFormBtn = event.target.querySelector('#sign-up-form-btn');
    signUpFormBtn.disabled = true;
    console.log('[submitSignUpFormHandler] name', name);
    console.log('[submitSignUpFormHandler] email', email);
    console.log('[submitSignUpFormHandler] password', password);
    signUpWithEmailAndPassword(name, email, password)
    .then((response) => {
        if (response.error) {                                       // error message
            createModalWindow(
                'Ошибка', 
                renderModalAfterAuth(response.error.message),
                'modal-window'
            );
            clearCookie();
        } else {                                                    // authorized
            closeModalWindow();
            setCurrentUser(response.user, response.idToken);
            renderBookings(ID_TOKEN, USER.email);
        }
        signUpFormBtn.disabled = false;
    })
}

//
function submitAuthFormHandler(event) {
    console.log('submiiting auth form');
    event.preventDefault();
    const email = event.target.querySelector('#email-input').value;
    const password = event.target.querySelector('#password-input').value;
    const signInFormBtn = event.target.querySelector('#sign-in-form-btn');
    signInFormBtn.disabled = true;
    console.log('[submitAuthFormHandler] email', email);
    console.log('[submitAuthFormHandler] password', password);
    signInWithEmailAndPassword(email, password)
    .then((response) => {
        if (response.error) {                                       // error message
            createModalWindow(
                'Ошибка авторизации', 
                renderModalAfterAuth(response.error.message),
                'modal-window',
            );
            clearCookie();
        } else {                                                    // authorized
            User.getUser(email, response.idToken)
                .then(user => {
                    closeModalWindow();
                    setCurrentUser(user, response.idToken);
                    renderBookings(ID_TOKEN, USER.email);
                });
        }
        signInFormBtn.disabled = false;
    })
}

//
export function submitSelectUserHandler(event) {
    console.log('[submitSelectUserHandler] target: ', event.target.parentElement);
    let email = event.target.parentElement.getAttribute('email');
    console.log('[submitSelectUserHandler] email: ', email);
    renderBookings(ID_TOKEN, email);
}

//
function setCurrentUser(user, token) {
    console.log('[setCurrentUser] user', user);
    ID_TOKEN = token;
    USER = user;
    setCookie('name', USER.name, 1);
    setCookie('group', USER.group, 1);
    setCookie('email', USER.email, 1);
    setCookie(USER.email, ID_TOKEN, 1);
    setFormState(USER);
}

//
function setFormState(user) {
    
    let userIsAdmin = (user.group && user.group == 'admin') ? true : false;
    
    // authBtn.innerHTML = renderAuthBtn(user.name, user.email);
    authBtn.innerHTML = USER.email ? renderAuthBtn(USER.name, USER.email) : 'Авторизация';
    showAllBtn.disabled = !userIsAdmin;
    if (ID_TOKEN) {
        renderBookings(ID_TOKEN, userIsAdmin ? '' : USER.email);
        if (userIsAdmin) {
            showElement(document.querySelector('#user-navigator-top'));
            showElement(document.querySelector('#user-navigator'));
            User.getUsers(ID_TOKEN)
            .then(users => renderSelectUserBtn(users));
        } else {
            hideElement(document.querySelector('#user-navigator-top'));
            hideElement(document.querySelector('#user-navigator'));
        }
    } else {
        signInHandler();
    }
}

//
function showAllHandler(event) {

}

function submitFormHandler(event) {
    event.preventDefault();
    
    let booking = {
        date: '',
        time: '',
        dauration: '',
        address: '',
        workDescription: '',
        status: bookingStatus.pending,
        comments: [],
    }

    let date = new Date(dateInput.value + ` ${timeInput.value}:00`);
    console.log('[submitFormHandler] date: ', date);
    
    booking = {
        date: date.toJSON(),
        dauration: daurationInput.value,
        address: addressInput.value.trim(),
        workDescription: workDescriptionInput.value.trim(),
        status: bookingStatus.pending,
        user: USER.email,
    }

    console.log('submiting....');
    
    submitBtn.disabled = true;
    
    Booking.create(booking, ID_TOKEN, USER.email)
        .then(response => {
            console.log('[submitFormHandler] response:', response);
            console.log('[submitFormHandler] booking:', booking);
            
            submitBtn.disabled = false;
            dateInput.value = new Date().toDateInputValue();
            timeInput.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            daurationInput.value = 1;
            addressInput.value = '';
            workDescriptionInput.value = '';
            renderBookings(ID_TOKEN, USER.email);
        });
}

function validateAllFields() {
    let isValid = true;

    if (validateDateInput(dateInput.value, true)) {
        console.log(`[validateAllFields] date: ${dateInput.value} - valid`);
    } else {
        isValid = false;
    }
    
    if (validateNumberInput(daurationInput.value, true)) {
        console.log(`[validateAllFields] dauration: ${daurationInput.value} - valid`);
    } else {
        isValid = false;
    }

    if (validateAddressInput(addressInput.value, true)) {
        console.log(`[validateAllFields] address: ${addressInput.value} - valid`);
    } else {
        isValid = false;
    }

    if (validateWorkDescriptionInput(workDescriptionInput.value, true)) {
        console.log(`[validateAllFields] workDescription: ${workDescriptionInput.value} - valid`);
    } else {
        isValid = false;
    }

    if (isValid) {
        console.log('all valid');
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

daurationInput.addEventListener('beforeinput', (event) => {
    if (event) {
        if (!validateNumberInput(event.data)) {
            event.preventDefault();
        }
    }
});

dateInput.addEventListener('input', (event) => {
    validateAllFields();
});

daurationInput.addEventListener('input', (event) => {
    validateAllFields();
});

addressInput.addEventListener('input', (event) => {
    validateAllFields();
});

workDescriptionInput.addEventListener('input', (event) => {
    validateAllFields();
});