// рендерит заголовок закупки
export function renderPurchaseHeader(row) {
    var theadHtml = `
        <thead>
            <tr class="purchase-row-header">
                <th colspan="100">Закупка [${row['purchase/id']}] ${row['purchase/name']}</th>
            </tr>
            <tr class="purchase-row">
                <th>PrID</th>
                <th>Группа</th>
                <th>Нименование</th>
                <th><span>Заказано</span></th>
                <th><span>Получено</span></th>
                <th>Цена закупки</th>
                <th>Цена</th>
                <th><span>Транспортные расходы</span></th>
                <th><span>Стоимость</span></th>
                <th><span>Оплачено</span></th>
                <th><span>Сумма к возврату</span></th>
                <th><span>Возвращено</span></th>
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

// рендерит одну позицию из таблицы purchase_member
export function renderPurchaseRow(row) {
    var rowHtml = `
        <tr class="purchase-row">
            <td>${row['product/id']}</td>
            <td>${row['product/group']}</td>
            <td>${row['product/name']}</td>
            <td>${row['count']}</td>
            <td>${row['distributed']}</td>
            <td>
                ${row['product/primary_price']}
                ${row['product/primary_currency']}
            </td>
            <td>
                ${row['purchase_content/sale_price']}
                ${row['purchase_content/sale_currency']}
            </td>
            <td>${row['purchase_content/shipping']}</td>
            <td>${row['cost']}</td>
            <td class="paid">${row['paid']}</td>
            <td class="torefound">${row['torefound']}</td>
            <td class="refounded">${row['refounded']}</td>
        </tr>
    `;
    var newRow = document.createElement('tr');
    newRow.innerHTML = rowHtml.trim();
    return newRow;
}

// рендерит заголовок транзакций
export function renderTransactionHeader(row) {
    var theadHtml = `
        <thead>
            <tr class="purchase-row-header">
                <th colspan="100">Ваши транзакции [${row['client/id']}] ${row['client/name']}</th>
            </tr>
            <tr class="transaction-row-header">
                <th>id</th>
                <th>date</th>
                <th>account_owner</th>
                <th>value</th>
                <th>PuM/id</th>
                <th>PuM/name</th>
                <th>description</th>
                <th>client/account</th>
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

// рендерит одну запись из таблицы transaction
export function renderTransactionRow(row) {
    var rowHtml = `
        <tr class="transaction-row">
            <td>${row['id']}</td>
            <td>${row['date']}</td>
            <td>${row['account_owner']}</td>
            <td>${row['value']} RUB</td>
            <td>${row['purchase_member/id']}</td>
            <td>
                ${row['purchase/name']}
            </td>
            <td>
                ${row['description']}
            </td>
            <td>${row['client_account']} RUB</td>
        </tr>
    `;
    var newRow = document.createElement('tr');
    newRow.innerHTML = rowHtml.trim();
    return newRow;
}