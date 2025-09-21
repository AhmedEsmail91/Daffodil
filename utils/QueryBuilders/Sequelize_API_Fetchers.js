const {Op, Sequelize}=require('sequelize');
const dataQuery = require('./dataQuery.js');
class ApiFeatures {
    /**
     * 
     * @param {Sequelize} model 
     * @param {params} searchQuery 
     * @param {dataQuery} dQuery 
     */
    constructor(model, searchQuery, dQuery=null) {
        this.model = model; // Sequelize model
        this.searchQuery = searchQuery;
        this.queryOptions = dQuery ? dQuery.getQuery() : {}; // initialized query options
        this.pageNum = 1;
        this.meta = {};
    }
    /**
     * Sets up pagination for the query.
     * @param {number} pageLimit - The number of elements per page.
     * @returns {ApiFeatures} - The current instance for method chaining.
     */
    pagination(pageLimit = 10) {
        let pageNum = Math.ceil(Math.abs(this.searchQuery.page * 1 || 1));
        const realLimit = this.searchQuery.limit ? Math.abs(this.searchQuery.limit * 1) : pageLimit;
        let offset = (pageNum - 1) * realLimit;
        this.queryOptions.limit = realLimit;
        this.queryOptions.offset = offset;
        this.pageNum = pageNum;
        return this;
    }
    /**
     * Adds filtering capabilities to the query for numeric fields.
     * Filters are applied based on operators like gte, gt, lte, and lt.
     * 
     * @returns {ApiFeatures} - The current instance for method chaining.
     */
    filtration() {
        const excluded = ["page", "sort", "pageLimit", "fields", "keyword"];
        let filters = { ...this.searchQuery };

        excluded.forEach(el => delete filters[el]);
        
        // Sequelize where operators
        for (let key in filters) {
            if (typeof filters[key] === 'object') {
                for (let op in filters[key]) {
                    if (['gte', 'gt', 'lte', 'lt'].includes(op)) {
                        filters[key][Sequelize.Op[op]] = filters[key][op];
                        delete filters[key][op];
                    }
                }
            }
        }

        this.queryOptions.where = { ...(this.queryOptions.where || {}), ...filters };
        return this;
    }
    /**
     * Adds sorting capabilities to the query.
     * fieldname: means the field will be sorted in ascending order
     * -fieldname: means the field will be sorted in descending order
     * @returns {ApiFeatures} - The current instance for method chaining.
     */
    sort() {
        if (this.searchQuery.sort) {
            let sortBy = this.searchQuery.sort.split(",").map(field =>
                field.startsWith("-") ? [field.slice(1), 'DESC'] : [field, 'ASC']
            );
            this.queryOptions.order = sortBy;
        } else {
            this.queryOptions.order = [['createdAt', 'DESC']];
        }
        return this;
    }
    /**
     * Adds field selection capabilities to the query.
     * @returns {ApiFeatures} - The current instance for method chaining.
     */
    fields() {
        if (this.searchQuery.fields) {
            let fields = this.searchQuery.fields.split(",").map(f => f.trim());
            this.queryOptions.attributes = fields;
        }
        return this;
    }
    /**
     * Adds search capabilities to the query.
     * @param {Array<string>} columns - The columns to search in.
     * @returns {ApiFeatures} - The current instance for method chaining.
     */
    search(columns = ['name']) {
        if (this.searchQuery.keyword) {
            const keyword = this.searchQuery.keyword;
            this.queryOptions.where = {
                ...(this.queryOptions.where || {}),
                [Op.or]: columns.map(col => ({
                    [col]: { [Op.iLike]: `%${keyword}%` }
                }))
            };
        }
        return this;
    }
    /**
     * Executes the built query and returns the result.
     * @returns {Promise<Object>} - The result of the query execution.
     */
    async execute() {
        const result = await this.model.findAndCountAll(this.queryOptions);
        return {
            data:result.rows,
            meta: {
                page: this.pageNum,
                pageLimit: this.queryOptions.limit,
                totalPages: Math.ceil(result.count / this.queryOptions.limit),
                totalResults: result.count
            }
        };
    }
}

module.exports = ApiFeatures;