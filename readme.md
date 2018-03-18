##node下实现对豆瓣电影爬虫
>主要实现使用``node``对豆瓣电影排在250名内的电影进行爬虫，将获取的数据整理并存入``mongodb``数据库。

####思路
使用``npm``模块``request``获取豆瓣页面的静态文件，然后使用模块``cheerio``对获取的文件摘取需要的数据，最后保存数据库。
####实现
+ 获取页面，如

		//url为需要爬虫的地址
		request(url, (err, response, body) => {
			//body就是获取的页面静态文件字符串
		)}
	
+ 使用cheerio模块，摘取获取的静态文件字符串中有用的数据

		let $ = cheerio.load(body), movieList = $('.grid_view li');
        let movieArr = [];//将数据保存在数组里
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
        
+ 将获取的数据保存到mongodb数据库，如

		new MovieListModel(obj).save(err => {
           if (err) return reject(err);
           resolve();
  		});

####结果
通过上述的爬取，获取的数据如
````
/* 1 */
{
"_id" : ObjectId("5aae5e408603840c77c7a881"),
"src" : "https://movie.douban.com/subject/1292052/",
"index" : "1",
"imgSrc" : "https://img3.doubanio.com/view/photo/s_ratio_poster/public/p480747492.jpg",
"title" : "肖申克的救赎 / The Shawshank Redemption",
"performer" : "\n                            导演: 弗兰克·德拉邦特 Frank Darabont   主演: 蒂姆·罗宾斯 Tim Robbins /...\n                            1994 / 美国 / 犯罪 剧情\n                        ",
"rating" : "9.6",
"eva" : "994278人评价",
"quote" : "希望让人自由。",
"__v" : 0
}

/* 2 */
{
"_id" : ObjectId("5aae5e408603840c77c7a882"),
"src" : "https://movie.douban.com/subject/1291546/",
"index" : "2",
"imgSrc" : "https://img3.doubanio.com/view/photo/s_ratio_poster/public/p1910813120.jpg",
"title" : "霸王别姬",
"performer" : "\n                            导演: 陈凯歌 Kaige Chen   主演: 张国荣 Leslie Cheung / 张丰毅 Fengyi Zha...\n                            1993 / 中国大陆 香港 / 剧情 爱情 同性\n                        ",
"rating" : "9.5",
"eva" : "722457人评价",
"quote" : "风华绝代。",
"__v" : 0
}
````
   






