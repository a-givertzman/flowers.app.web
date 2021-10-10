import { clearCookie, getCookie, setCookie } from './cookie';
import { getData, getJoinData } from './mysql';
import '@plugins/slick-slider/slick.css';
// import '@plugins/jquery-form-styler/jquery.formstyler.css';
// import '@plugins/jquery-form-styler/jquery.formstyler.theme.css';
import './css/style.css';
import './css/media.css';
// import slider_1_background_img from '@img/slider-background.png';
// import header_logo_img from '@img/header-logo.png';
import { User } from './user';

// JQUERY FORM STYLER
// (function($) {
//     $(function() {
//         $('select').styler({
//             selectSmartPositioning: true,
//         });
//     });
// })(jQuery);

var data = null;

function matchCustom(params, data) {
    // If there are no search terms, return all of the data
    if ($.trim(params.term) === '') {
      return data;
    }
    // Do not display the item if there is no 'text' property
    if (typeof data.text === 'undefined') {
      return null;
    }
    // `params.term` should be the term that is used for searching
    // `data.text` is the text that is displayed for the data object
    if (data.text.indexOf(params.term) > -1) {
      var modifiedData = $.extend({}, data, true);
      modifiedData.text.replace(params.term, '<span class="search_term_hilite">' + params.term + '</span>');
      // You can return modified objects from here
      // This includes matching the `children` how you want in nested data sets
      return modifiedData;
    }
    // Return `null` if the term should not be displayed
    return null;
}

$(function() {
    $('.search-purchase-select').select2({
        placeholder: 'ID / ФИО / номер телефона',
        width: 'resolve', // need to override the changed default
        matcher: matchCustom
    });
});


const app_form = document.querySelector('#booking-form');
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
        getData('client', ['*'], 'id', 'ASC', [], '%', 0).then(responseData => {
            data = responseData;
            for(var key in data) {
                let item = data[key];
                $('.search-purchase-select')
                    .append(new Option(item.id + ' | ' + item.name + ' | ' + item.phone , item.id, false))
                    .trigger('change');
            }
        });

        $('.search-purchase-select').on('select2:select', e => {
            var selectedId = e.params.data.id;
            getJoinData(
                'purchase_member', 
                ['id','purchase/id','client/id','client/group','client/name','client/phone','client/account','purchase_content/id','product/id','product/group','product/name','product/order_quantity','count','distributed','product/primary_price','product/primary_currency','purchase_content/sale_price','purchase_content/sale_currency','purchase_content/shipping','cost','paid','torefound','refounded'], 
                'purchase/id', 'ASC', 
                ['client/id'], selectedId, 
                0
            ).then(responseData => {

                console.log('responseData:', responseData);
                var table = document.querySelector('table.purchase-items');
                for (var key in responseData) {
                    var rowData = responseData[key];
                    
                    console.log('rowData:', rowData);
                    var row = renderRow(rowData);
                    console.log('row:', row);
                    table.append(row);
                };
            });
            getData('purchase_member', ['*'], 'id', 'ASC', ['client/id'], selectedId, 0).then(responseData => {
                
                console.log('responseData:', responseData);
            });
            console.log('selection id:', e.params.data);
        });
        
        $('.search-purchase-select').on('select2:unselect', e => {
            var table = document.querySelector('table.purchase-items');
            table.innerHTML = '';
        });

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


function renderRow(row) {
    var rowHtml = `
        <tr class="purchase-row">
            <td class="id">${row['id']}</td>
            <td class="client-id">${row['client/id']}</td>
            <td class="client-group">${row['client/group']}</td>
            <td class="client-name">${row['client/name']}</td>
            <td class="client-phone">${row['client/phone']}</td>
            <td class="client-account">${row['client/account']}</td>
            <td class="purchase_content/id">${row['purchase_content/id']}</td>
            <td class="product-id">${row['product/id']}</td>
            <td class="product-group">${row['product/group']}</td>
            <td class="product-name">${row['product/name']}</td>
            <td class="product-order_quantity">${row['product/order_quantity']}</td>
            <td class="count">${row['count']}</td>
            <td class="distributed">${row['distributed']}</td>
            <td class="product-primary_price">${row['product/primary_price']}</td>
            <td class="product-primary_currency">${row['product/primary_currency']}</td>
            <td class="purchase_content-sale_price">${row['purchase_content/sale_price']}</td>
            <td class="purchase_content-sale_currency">${row['purchase_content/sale_currency']}</td>
            <td class="purchase_content-shipping">${row['purchase_content/shipping']}</td>
            <td class="cost">${row['cost']}</td>
            <td class="paid">${row['paid']}</td>
            <td class="torefound">${row['torefound']}</td>
            <td class="refounded">${row['refounded']}</td>
        </tr>
    `;
    var newRow = document.createElement('tr');
    newRow.innerHTML = rowHtml.trim();
    return newRow;
}