//驗證
function getAuthType() {
    var response = {
        type: 'NONE'
    };
    return response;
}

//用戶將看到的配置選項
function getConfig(request) {
    var cc = DataStudioApp.createCommunityConnector();
    var config = cc.getConfig();

    config.newInfo()
        .setId('instructions')
        .setText('Enter your CLICKFORCE SSP User token');

    config.newTextInput()
        .setId('token')
        .setName('Enter a your token')
        .setHelpText('Enter your CLICKFORCE SSP User token')
        .setPlaceholder('googleapis');

    config.setDateRangeRequired(true);

    return config.build();
}


//column的名稱和類型
function getFields(request) {
    var cc = DataStudioApp.createCommunityConnector();
    var fields = cc.getFields();
    var types = cc.FieldType;
    var aggregations = cc.AggregationType;

    fields.newDimension()
        .setId('token')
        .setType(types.TEXT);

    fields.newMetric()
        .setId('clicks')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);

    fields.newMetric()
        .setId('impress')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);
    fields.newMetric()
        .setId('request')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);
    fields.newMetric()
        .setId('invalid_impress')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);
    fields.newMetric()
        .setId('invalid_click')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);
    fields.newMetric()
        .setId('bidding_price')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);
    fields.newMetric()
        .setId('campaign_mu')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);
    fields.newMetric()
        .setId('advertiser_mu')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);
    fields.newMetric()
        .setId('site_mu')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);
    fields.newMetric()
        .setId('profit')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);
    fields.newMetric()
        .setId('ecpm')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);
    fields.newMetric()
        .setId('ecpc')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);
    fields.newMetric()
        .setId('ctr')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);
    fields.newDimension()
        .setId('day')
        .setType(types.YEAR_MONTH_DAY);

    return fields;
}

function getSchema(request) {
    var fields = getFields(request).build();
    return {
        schema: fields
    };
}


//取得資料
function responseToRows(requestedFields, packageName, response) {
    // Transform parsed data and filter for requested fields
    return response.map(function (dailyDownload) {
        var row = [];
        requestedFields.asArray().forEach(function (field) {
            switch (field.getId()) {
                case 'day':
                    return row.push(dailyDownload.day.replace(/-/g, ''));
                case 'clicks':
                    return row.push(dailyDownload.clicks);
                case 'impress':
                    return row.push(dailyDownload.impress);
                case 'request':
                    return row.push(dailyDownload.request);
                case 'invalid_impress':
                    return row.push(dailyDownload.invalid_impress);
                case 'invalid_click':
                    return row.push(dailyDownload.invalid_click);
                case 'bidding_price':
                    return row.push(dailyDownload.bidding_price);
                case 'campaign_mu':
                    return row.push(dailyDownload.campaign_mu);
                case 'advertiser_mu':
                    return row.push(dailyDownload.advertiser_mu);
                case 'site_mu':
                    return row.push(dailyDownload.site_mu);
                case 'profit':
                    return row.push(dailyDownload.profit);
                case 'ecpm':
                    return row.push(dailyDownload.ecpm);
                case 'ecpc':
                    return row.push(dailyDownload.ecpc);
                case 'ctr':
                    return row.push(dailyDownload.ctr);
                case 'token':
                    return row.push(token);
                default:
                    return row.push('');
            }
        });
        return {
            values: row
        };
    });
}

function getData(request) {
    var requestedFieldIds = request.fields.map(function (field) {
        return field.name;
    });
    var requestedFields = getFields().forIds(requestedFieldIds);

    // Fetch and parse data from API
    var url = [
        'https://ssp.holmesmind.com/',
        request.configParams.token,
        '/',
        request.dateRange.startDate,
        '/',
        request.dateRange.endDate,
        '/DTDsp'
    ];
    var response = UrlFetchApp.fetch(url.join(''));
    var clicks = JSON.parse(response).clicks;

    var rows = responseToRows(requestedFields, request.configParams.token, clicks);

    return {
        schema: requestedFields.build(),
        rows: rows
    };
}