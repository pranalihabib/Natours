class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // sort() {
  //   if (this.queryString.sort) {
  //     const sortBy = this.queryString.sort.split(',').join(' ');
  //     // console.log(sortBy);
  //     this.query = this.query.sort(sortBy); //query = query.sort('price'); - equivalent
  //   } else {
  //     this.query = this.query.sort('-createdAt'); //descending order - newest ones appear first
  //   }
  //   return this;
  // }

  sort() {
    if (this.queryString.sort) {
      let sortBy;

      if (typeof this.queryString.sort === 'string') {
        sortBy = this.queryString.sort.split(',').join(' ');
      } else if (Array.isArray(this.queryString.sort)) {
        sortBy = this.queryString.sort.join(' ');
      }

      if (sortBy) {
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt'); // fallback
      }
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); //negative sign - exclude this field
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
