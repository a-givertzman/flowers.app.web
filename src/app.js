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
var busyIndicator;

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
if (showMenuBtn) {
    showMenuBtn.addEventListener('click',(event) => {
        let menu = document.querySelector('.menu ul');
        let menuStyle = window.getComputedStyle(menu);
        if (menuStyle.display == 'none') {
            menu.style.display = 'block'
        } else {
            menu.style.display = 'none';
        }
    });
}

window.addEventListener(                                            // ON LOAD WINDOW
    'load', (event) => {
        busyIndicator = new BusyIndicator('.busy-indicator', 'busy-indicator-hide')
        // загружаем список клиентов
        busyIndicator.show();
        getData('client', ['*'], 'id', 'ASC', [], '%', 0).then(responseData => {
            data = responseData;
            for(var key in data) {
                let item = data[key];
                $('.search-purchase-select')
                    .append(new Option(item.id + ' | ' + item.name + ' | ' + item.phone , item.id, false))
                    .trigger('change');
            }
            busyIndicator.hide();
        }).catch(e => {
            busyIndicator.hide();
        });

        // загружаем закупки выбранного клиента
        $('.search-purchase-select').on('select2:select', e => {
            var selectedId = e.params.data.id;
            busyIndicator.show();
            getJoinData(
                'purchase_member', 
                ['id','purchase/id','purchase/name','client/id','client/group','client/name','client/phone','client/account','purchase_content/id','product/id','product/group','product/name','product/order_quantity','count','distributed','product/primary_price','product/primary_currency','purchase_content/sale_price','purchase_content/sale_currency','purchase_content/shipping','cost','paid','torefound','refounded'], 
                'purchase/id', 'ASC', 
                ['client/id'], selectedId, 
                0
            ).then(responseData => {

                console.log('responseData:', responseData);
                var table = document.querySelector('table.purchase-items');
                var tableBody = document.querySelector('table.purchase-items tbody');
                var purchase_id = -1;
                for (var key in responseData) {
                    var rowData = responseData[key];
                    
                    // если изменился id закупки
                    // то добавляем в таблицу заголовок этой закупки
                    if (purchase_id != rowData['purchase/id']) {
                        purchase_id = rowData['purchase/id'];
                        console.log('next purchase:', rowData);
                        var newPurchase = renderPurchase(rowData);
                        table.append(newPurchase.thead);
                        table.append(newPurchase.tbody);
                        tableBody = newPurchase.tbody;
                    }
                    console.log('rowData:', rowData);
                    var row = renderRow(rowData);
                    console.log('row:', row);
                    tableBody.append(row);
                };
                busyIndicator.hide();
            }).catch(e => {
                busyIndicator.hide();
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

function renderPurchase(row) {
    var theadHtml = `
        <thead>
            <tr class="purchase-row-header">
                <th colspan="100">Закупка [${row['purchase/id']}] ${row['purchase/name']}</th>
            </tr>
            <tr class="purchase-row">
                <th class="id">PuMID</th>
                <th class="client-id">ClID</th>
                <th class="purchase_content-id">PuCID</th>
                <th class="product-id">PrID</th>
                <th class="product-group">PrGroup</th>
                <th class="product-name">PrName</th>
                <th class="product-order_quantity">PrOQ</th>
                <th class="count">count</th>
                <th class="distributed">distributed</th>
                <th class="product-primary_price">product/primary_price</th>
                <th class="product-primary_currency">product/primary_currency</th>
                <th class="purchase_content-sale_price">purchase_content/sale_price</th>
                <th class="purchase_content-sale_currency">purchase_content/sale_currency</th>
                <th class="purchase_content-shipping">purchase_content/shipping</th>
                <th class="cost">cost</th>
                <th class="paid">paid</th>
                <th class="torefound">torefound</th>
                <th class="refounded">refounded</th>
            </tr>
        </thead>
        `;
    var tbodyHtml = `
        <tbody>
        </tbody>
    `;
    var thead = document.createElement('thead');
    thead.innerHTML = theadHtml.trim();
    var tbody = document.createElement('tbody');
    tbody.innerHTML = tbodyHtml.trim();
    return {thead: thead, tbody: tbody};
}

function renderRow(row) {
    var rowHtml = `
        <tr class="purchase-row">
            <td class="id">${row['id']}</td>
            <td class="client-id">${row['client/id']}</td>
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

class BusyIndicator {
    constructor(selector, hiddenClassName) {
        this.selector = selector;
        this.hiddenClassName = hiddenClassName;
        this.busyIndicator = document.querySelector(selector);
    }
    show() {
        this.busyIndicator.classList.remove(this.hiddenClassName);
    }
    hide() {
        this.busyIndicator.classList.add(this.hiddenClassName);
    }
    toggle() {
        this.busyIndicator.classList.toggle(this.hiddenClassName)
    }
};
