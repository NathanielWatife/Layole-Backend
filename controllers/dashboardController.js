const Blog = require("../models/Blog");


const getDashboardStats = async (req, res, next) => {
    try {        
        const [
            totalBlogs,
            publishBlogs,
            draftBlogs,
            recentBlogs
        ] = await Promise.all([
            Blog.countDocuments(),
            Blog.countDocuments({ status: "published" }),
            Blog.countDocuments({ status: "draft" }),
            Blog.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("title status publishedAt author")
                .populate('author', 'username')
        ]);

        res.json({
            success: true,
            data: {
                totalBlogs,
                publishBlogs,
                draftBlogs,
                recentBlogs
            }
        });
    } catch (error) {
        next(error);
    }
};

const getBlogAnalytics = async (req, res, next) => {
    try {
        const { period = "month" } = req.query;
        let dateRange = new Date();

        switch (period) {
            case "week":
                dateRange.setDate(dateRange.getDate() - 7);
                break;
            case "month":
                dateRange.setMonth(dateRange.getMonth() - 1);
                break;
            case "year":
                dateRange.setFullYear(dateRange.getFullYear() - 1);
                break;
            default:
                dateRange.setMonth(dateRange.getMonth() - 1);
        }

        const [blogsByDate, popularCategories] = await Promise.all([
            Blog.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dateRange }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Blog.aggregate([
                { $unwind: "$categories" },
                {
                    $group: {
                        _id: "$categories",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ])
        ]);

        res.json({
            success: true,
            data: {
                period,
                blogsByDate,
                popularCategories
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getBlogAnalytics
};