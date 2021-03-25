import request from 'sync-request';

const htmlHelper = {

    getSouceFromUrl(url) {
        var res = request('GET', url);
        console.log(res);
        return {
            html: '' + res.getBody(),
            statusCode: res.statusCode,
            url: url
        };
    }    
}

export default htmlHelper