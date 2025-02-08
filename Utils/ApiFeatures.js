const Movie = require("./../Models/Movies")

class ApiFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    filter(){
        const excludeFields = ['sort', 'page', 'limit', 'fields']
        let queryObj = {...this.queryStr};
        excludeFields.forEach((el) => {
            delete queryObj[el]
        })

       let queryString = JSON.stringify(queryObj);
       queryString = queryString.replace(/\b(gte|lte|lt|gt)\b/g, (match) => `$${match}`)
       let queryFilter = JSON.parse(queryString);
       this.query = Movie.find(queryFilter)

       return this;
    }

    sort(){
        if(this.queryStr.sort){
            let sortBy = this.queryStr.sort.split(",").join(" ")
            console.log("Sort ",sortBy)
            this.query = this.query.sort(sortBy)    
       }
       else{
            this.query = this.query.sort('createAt')
       }

       return this;
    }

    limitFields(){
        if(this.queryStr.fields){
            let fields = this.queryStr.fields.split(",").join(" ")
            this.query.select(fields);
       }
       else{
            this.query.select('-__v');
       }

       return this;
    }

    paginate(){
        if(this.queryStr.page || this.queryStr.limit){
            let page = this.queryStr.page || 1;
            let limit = this.queryStr.limit;
            let skip = (page - 1) * limit;
            this.query.skip(skip).limit(limit);

            // let count = await Movie.countDocuments();
            // if(skip > count){
            //     throw Error("Empty Page!!");
            // }
       }
       return this;
    }
}

module.exports = ApiFeatures;