class dataQuery {
    include = [];
    where = {};
    order = [];
    attributes = null; // attributes to select, if null then all attributes will be selected
    /**
     * @param {Object} where - The conditions to filter the data.
     * @param {Array} include - The related models to include in the query.
     * @param {Array} order - The order in which to sort the results.
    */
    constructor(where = {}, include = [], order = [], attributes = null) {
        this.order = order;
        this.include = include;
        this.where = where;
        this.attributes = attributes;
    }
    getQuery() {
        return {
            include: this.include,
            where: this.where,
            order: this.order,
            attributes: this.attributes
        }
    }
}
module.exports = dataQuery;