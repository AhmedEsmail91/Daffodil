class ApiFeatures {
    constructor(mongooseQuery, seachQuery) {
        this.mongooseQuery = mongooseQuery;
        this.seachQuery = seachQuery;
    }
    pagination(pageLimit) {
        let pageNum = Math.ceil(Math.abs(this.seachQuery.page * 1 || 1));
        let skip = (pageNum - 1) * pageLimit;
        this.mongooseQuery.skip(skip).limit(pageLimit);
        this.pageNum = pageNum;
        return this
    }
    filtration() {
        let excluded = ["page", "sort", "pageLimit", "fields", "keyword"];
        let filterObj = Object.assign({}, this.seachQuery);
        excluded.forEach((el) => delete filterObj[el]);
        filterObj = JSON.parse(JSON.stringify(filterObj).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`));
        3
        this.mongooseQuery.find(filterObj);
        return this // to chain the methods
    }
    sort() {
        if (this.seachQuery.sort) {
            let sortBy = this.seachQuery.sort.split(",").join(" ");
            this.mongooseQuery.sort(sortBy);
        } else {
            this.mongooseQuery.sort("-createdAt");
        }
        return this
    }
    fields() {
        if (this.seachQuery.fields) {
            let fields = this.seachQuery.fields.split(",").join(" ");
            this.mongooseQuery.select(fields);
        } else {
            this.mongooseQuery.select("-__v");
        }
        return this
    }
    search() {
        if (this.seachQuery.keyword) {
            this.mongooseQuery.find({
                $or: [{
                        name: {
                            $regex: this.seachQuery.keyword,
                            $options: "i"
                        }
                    },
                    {
                        description: {
                            $regex: this.seachQuery.keyword,
                            $options: "i"
                        }
                    }
                ]
            });
        }
        return this
    }
}
export {
    ApiFeatures
}