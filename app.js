const request = require('request'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    logger = require('./logger'),
    MovieListModel = require('./schema/movieList'),
    cheerio = require('cheerio');

//连接数据库
mongoose.connect('mongodb://localhost:27017/Applets');
// mongoose.connect('mongodb://139.199.3.164:27017/Applets');
mongoose.connection.on('error', logger.error.bind(logger.error, 'connection error:'));

/**
 * 集中请求异步操作,num限定一次请求多少个异步操作
 * @param {Array} proArr 
 * @param {Number} num 
 * @param {Function} callback 
 */
const asyncLimit = (proArr, num, callback) => new Promise((resolve, reject) => {
    let len = proArr.length,
        times = Math.ceil(len / num),
        sendArr = [];
    let fun = i => {
        let arr = [];
        for (let j = 0; j < num; j++) {
            let index = i * num + j;
            if (index < len) arr.push(callback(proArr[index]));
        };
        Promise.all(arr).then(a => {
            sendArr = sendArr.concat(a);
            i < times
                ? fun(i + 1)
                : resolve(sendArr)
        }).catch(reject);
    };
    fun(0);
});

/**
 * 根据电影列表地址爬取电影列表信息
 * @param {String} url 
 */
const getMovieList = url => new Promise((resolve, reject) => {
    request(url, (err, response, body) => {
        if (err) return reject(err);
        let $ = cheerio.load(body), movieList = $('.grid_view li');
        let movieArr = [];
        // 获取每部电影信息
        movieList.each(function (i, v) {
            movieArr.push({
                src: $(this).find('.pic a').attr('href'),
                index: $(this).find('.pic em').text(),
                imgSrc: $(this).find('.pic a img').attr('src'),
                title: $(this).find('.info .hd .title').text(),
                performer: $(this).find('.info .bd p').eq(0).text(),
                rating: $(this).find('.info .star .rating_num').text(),
                eva: $(this).find('.info .bd .star span').eq(3).text(),
                quote: $(this).find('.info .bd .quote .inq').text()
            })
        });
        // 将获取的信息存入数据库
        asyncLimit(movieArr, 1, obj => new Promise((resolve, reject) => {
            new MovieListModel(obj).save(err => {
                if (err) return reject(err);
                resolve();
            })
        })).then(() => {
            resolve(movieArr);
        }).catch(reject);
    })
});



/**
 * 获取请求列表url数据
 */
const getUrlArr = () => {
    let arr = [];
    for (let i = 0; i < 10; i++) {
        arr.push('https://movie.douban.com/top250?start=' + (i * 25));
    }
    return arr;
}

asyncLimit(getUrlArr(), 1, getMovieList).then(()=>{
    logger.info('save movie list success');
});





