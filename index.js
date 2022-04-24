const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

const PORT = process.env.PORT || 8000
const sources = [
	{
		name: 'space',
		address: 'https://www.space.com/news',
	},
]
let count = 0
let allArticles = {}
let arrArticle = []

function fetchArticles(source, i) {
	const address = `${source.address}/${i === 1 ? '' : i}`
	allArticles[i] = []

	axios
		.get(address)
		.then((site) => {
			const html = site.data
			const $ = cheerio.load(html)

			$('a[class=article-link]', html).each(function () {
				const title = $('h3', this).text().trim()
				const description = $('p[class=synopsis]', this).text().trim()
				const author = $('p span[class=by-author]', this)
					.text()
					.trim()
					.substring(4)
				const time = $('time', this).attr('datetime')

				let imgSrc = $('img', this).attr('data-srcset')
				const startIdx = imgSrc.indexOf('970w,') + 6
				const endIdx = imgSrc.indexOf('1024w') - 1
				imgSrc = imgSrc.substring(startIdx, endIdx)

				const link = $(this).attr('href')

				const imgAlt = $('img', this).attr('alt')

				allArticles[i].push({
					title,
					description,
					author,
					time,
					image: { src: imgSrc, alt: imgAlt },
					link,
				})
			})
		})
		.catch((err) => console.log(err))
}

function objToArray() {
	let insiderCount = 0
	arrArticle = []

	for (let i = 1; i < 10; i++) {
		arrArticle.push(allArticles[i])
		if (allArticles[i].length !== 0) insiderCount++
	}

	arrArticle = [].concat(...arrArticle)
	if (insiderCount === 9) count++
}

sources.forEach((source) => {
	if (source.name === 'space') {
		for (let i = 1; i < 10; i++) {
			fetchArticles(source, i)
		}
	}
})

app.get('/', (req, res) => {
	res.json({ message: 'Welcome to space api' })
})

app.get('/articles', (req, res) => {
	if (count === 0) objToArray()
	res.json(arrArticle)
})

app.listen(PORT, console.log(`app listening on http://localhost:${8000}`))
