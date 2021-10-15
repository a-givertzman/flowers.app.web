/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 413:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {

/* harmony import */ var _cookie__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(315);
/* harmony import */ var _mysql__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(340);
/* harmony import */ var _renderClientReport__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(606);
/* harmony import */ var _plugins_busy_indicator_busy_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(172);
/* harmony import */ var _css_style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(962);
/* harmony import */ var _css_media_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(876);
/* provided dependency */ var $ = __webpack_require__(755);







// import '@plugins/jquery-form-styler/jquery.formstyler.css';
// import '@plugins/jquery-form-styler/jquery.formstyler.theme.css';


// import slider_1_background_img from '@img/slider-background.png';
// import header_logo_img from '@img/header-logo.png';


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
        width: '100%', // need to override the changed default
        multiple: false,
        placeholder: "Найди себя",
        allowClear: true,
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
        busyIndicator = new _plugins_busy_indicator_busy_js__WEBPACK_IMPORTED_MODULE_2__/* .BusyIndicator */ .E('.busy-indicator', 'busy-indicator-hide')
        
        // загружаем список закупок
        busyIndicator.show();
        (0,_mysql__WEBPACK_IMPORTED_MODULE_3__/* .getData */ .Yu)({
            tableName: 'purchase', 
            keys: ['*'], 
            orderBy: 'id', 
            order: 'ASC', 
            where: [], 
            limit: 0,
        }).then(responseData => {
            data = responseData;
            for(var key in data) {
                let item = data[key];
                $('.search-purchase-select')
                    .append(new Option(item.id + ' | ' + item.name + ' | ' + item.detales + ' | ' + item.status, item.id, false))
                    .trigger('change');
            }
            busyIndicator.hide();
        }).catch(e => {
            busyIndicator.hide();
        });

        // загружаем информацию по выбранной закупке
        $('.search-purchase-select').on('select2:select', e => {
            console.log('selection id:', e.params.data);
            var selectedId = e.params.data.id;

            // баланс клиента
            var clientAccount = data[selectedId].account;
            document.querySelector('#client-account').innerHTML = `Баланс: ${clientAccount} RUB`;
            
            // закупки клиента
            busyIndicator.show();
            var where = [{operator: 'where', field: 'purchase/id', cond: '=', value: selectedId}];
            (0,_mysql__WEBPACK_IMPORTED_MODULE_3__/* .getView */ .Xe)({
                tableName: 'purchaseMemberView', 
                params: '0', 
                keys: ['*'],
                orderBy: 'purchase/id', 
                order: 'ASC', 
                where: where, 
                limit: 0,
            }).then(responseData => {

                // console.log('responseData:', responseData);
                var table = document.querySelector('table.purchase-items');
                var tableBody;
                var purchase_id = -1;
                for (var key in responseData) {
                    var rowData = responseData[key];
                    
                    // если изменился id закупки
                    // то добавляем в таблицу заголовок этой закупки
                    if (purchase_id != rowData['purchase/id']) {
                        purchase_id = rowData['purchase/id'];
                        // console.log('next purchase:', rowData);
                        var newPurchase = (0,_renderClientReport__WEBPACK_IMPORTED_MODULE_4__/* .renderPurchaseHeader */ .nP)(rowData);
                        table.append(newPurchase.thead);
                        table.append(newPurchase.tbody);
                        tableBody = newPurchase.tbody;
                    }
                    // console.log('rowData:', rowData);
                    var row = (0,_renderClientReport__WEBPACK_IMPORTED_MODULE_4__/* .renderPurchaseRow */ .Gv)(rowData);
                    // console.log('row:', row);
                    tableBody.append(row);
                };

            }).catch(e => {
                busyIndicator.hide();
            });
            // транзакции клиента
            busyIndicator.show();
            var where = [{operator: 'where', field: 'client/id', cond: '=', value: selectedId}];
            (0,_mysql__WEBPACK_IMPORTED_MODULE_3__/* .getView */ .Xe)({
                tableName: 'clientTransactionView', 
                params: '0', 
                keys: ['*'], // ['id','purchase/id','purchase/name','client/id','client/group','client/name','client/phone','client/account','purchase_content/id','product/id','product/group','product/name','product/order_quantity','count','distributed','product/primary_price','product/primary_currency','purchase_content/sale_price','purchase_content/sale_currency','purchase_content/shipping','cost','paid','torefound','refounded'], 
                orderBy: 'date', 
                order: 'ASC', 
                where: where, 
                limit: 0,
            }).then(responseData => {

                console.log('responseData:', responseData);

                var table = document.querySelector('table.transaction-items');
                var tableBody;

                var client_id = -1;
                for (var key in responseData) {
                    var rowData = responseData[key];

                    // если изменился id закупки
                    // то добавляем в таблицу заголовок этой закупки
                    if (client_id != rowData['client/id']) {
                        client_id = rowData['client/id'];
                        // console.log('next purchase:', rowData);
                        var newTransaction = (0,_renderClientReport__WEBPACK_IMPORTED_MODULE_4__/* .renderTransactionHeader */ .pb)(rowData);
                        table.append(newTransaction.thead);
                        table.append(newTransaction.tbody);
                        tableBody = newTransaction.tbody;
                    }

                    // console.log('rowData:', rowData);
                    var row = (0,_renderClientReport__WEBPACK_IMPORTED_MODULE_4__/* .renderTransactionRow */ .B5)(rowData);
                    // console.log('row:', row);
                    tableBody.append(row);
                };

                busyIndicator.hide();
            }).catch(e => {
                busyIndicator.hide();
            });

            // getData('purchase_member', ['*'], 'id', 'ASC', ['client/id'], selectedId, 0).then(responseData => {
                
            //     console.log('responseData:', responseData);
            // });
        });
        
        $('.search-purchase-select').on('select2:unselect', e => {
            var table = document.querySelector('table.purchase-items');
            table.innerHTML = '';
            table = document.querySelector('table.transaction-items');
            table.innerHTML = '';
        });

        USER.name = (0,_cookie__WEBPACK_IMPORTED_MODULE_5__/* .getCookie */ .ej)('name');
        USER.email = (0,_cookie__WEBPACK_IMPORTED_MODULE_5__/* .getCookie */ .ej)('email');
        USER.group = (0,_cookie__WEBPACK_IMPORTED_MODULE_5__/* .getCookie */ .ej)('group');
        // console.log('[window.onLoad] userName:', userName);
        ID_TOKEN = USER.email ? (0,_cookie__WEBPACK_IMPORTED_MODULE_5__/* .getCookie */ .ej)(USER.email) : null;
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

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			329: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkIds[i]] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkpurchase_member"] = self["webpackChunkpurchase_member"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	__webpack_require__.O(undefined, [38,120], () => (__webpack_require__(197)))
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [38,120], () => (__webpack_require__(413)))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;