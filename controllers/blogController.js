const Blog = require("../models/Blog")
const axios = require("axios")
const { parseStringPromise } = require("xm12js")

const fetchFromCDC = async () => {
    try {
        const response = await axios.get("")
        return response.data.map(item => ({
            title: item.title,
            content: item.summary,
            source: "CDC Health Alert",
            sourceUrl: item.link,
            tags: ["public-health"] 
        }))
    } catch (error) {
        console.error("CDC fetch error:", error)
        return []
    }
}

const fetchFromWHO = async () => {
    try {
        const response = await axios.get("")
        const parsed = await parseStringPromise(response.data)
        return parsed.rss.channel[0].item.map(item => ({
            title: item.title[0],
            contect: item.description[0],
            source: "WHO Outbreak News",
            sourceUrl: item.link[0],
            tags: ['outbreak', 'global-health']
        }))
    } catch (error) {
        console.error("WHO fetch error:", error)
        return []
    }
}

exports.fetchArticles = async () => {
    const [cdcArticles, whoArticles] = await Promise.all([
        fetchFromCDC().
        fetchFromWHO()
    ])

    const allArticles = [...cdcArticles, ...whoArticles]


    // save to database
    await Blog.insertMany(allArticles.map(article => ({
        ...article,
        isApproved: true
    })))
    return allArticles
}

exports.getArticles = async (req, res) => {
    try {
        const articles = await Blog.find({ isApproved: true })
            .sort({publishDate: -1})
            .limit(10)
        res.json(articles)
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}