export async function getData(
    tableName, 
    keys = null, 
    orderBy = 'id', 
    order = 'ASC', 
    searchField = [], 
    searchValue = '%',
    limit,
    url = '/getData.php'
  ) {
    console.log('[mysql.getData]');
    return apiRequest(
        tableName,
        keys,
        orderBy,
        order,
        searchField,
        searchValue,
        limit,
        url  
    );
  }


  export async function getJoinData(
    tableName, 
    keys = null, 
    orderBy = 'id', 
    order = 'ASC', 
    searchField = [], 
    searchValue = '%',
    limit,
    url = '/getJoinData.php'
  ) {
    console.log('[musql.getJoinData]');

    return apiRequest(
        tableName,
        keys,
        orderBy,
        order,
        searchField,
        searchValue,
        limit,
        url  
    );
  }


  export async function apiRequest(
    tableName, 
    keys = null, 
    orderBy = 'id', 
    order = 'ASC', 
    searchField = [], 
    searchValue = '%',
    limit,
    url
  ) {
    console.log('[mysql.apiRequest]');
    var body = new FormData();
    body.append( "tableName", JSON.stringify(tableName) );
    body.append( "keys", JSON.stringify(keys) );
    body.append( "orderBy", JSON.stringify(orderBy) );
    body.append( "order", order );
    body.append( "searchField", JSON.stringify(searchField) );
    body.append( "searchValue", JSON.stringify(searchValue) );
    body.append( "limit", limit );
    console.log('body:', body);
    const options = {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    // mode: 'cors', // no-cors, *cors, same-origin
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, *same-origin, omit
    // headers: {
    //   'Content-Type': 'application/json'
    // //   'Content-Type': 'application/x-www-form-urlencoded',
    // },
    // redirect: 'follow', // manual, *follow, error
    // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: body}; // body data type must match "Content-Type" header    };
    console.log('options:', options);

    var response = await fetch(url, options);

    console.log('response data:', response);
    const responseCode = response.status;
    
    const jsonData = await response.json();
    console.log('json data:', jsonData);
    
    const parsedData = (typeof(jsonData) == 'object') ? jsonData : JSON.parse(jsonData);
    
    var errCount = parsedData.errCount;
    console.log('errCount: ', errCount);

    if (errCount > 0) {
        var errDump = parsedData.errDump;
        console.log('errDump: ', errDump);
        alert('Ошибка сервера', errDump);
        return {};
    }
    
    if (responseCode == 200) {
        var data = parsedData.data;
        // console.log('data: ', data);
        return data;
    } else {
        var responseText = response.statusText;
        alert('Ошибка', '[' + responseCode + '] ' + responseText);
    }
  }
