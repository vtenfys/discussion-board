class Message {
  constructor(message, author, date) {
    this._id = Message.nextId();
    this.message = message;
    this.author = author;
    this.date = date;
  }

  static setInitialId(id) {
    this._nextId = id;
  }

  static nextId() {
    if (typeof this._nextId !== 'number') {
      this._nextId = 0;
    } else {
      this._nextId += 1;
    }
    return this._nextId;
  }

  get data() {
    return {
      message: this.message,
      author: this.author,
      date: this.date
    };
  }

  get id() {
    return this._id;
  }
  get message() {
    return this._message;
  }
  get author() {
    return this._author;
  }
  get date() {
    return Date.parse(this._date);
  }

  set message(message) {
    if (typeof message !== 'string') {
      throw new TypeError('message must be a string');
    }
    this._message = message;
  }
  set author(author) {
    if (typeof author !== 'string') {
      throw new TypeError('author must be a string');
    }
    this._author = author;
  }
  set date(date) {
    if (!(date instanceof Date)) {
      throw new TypeError('date must be a Date object');
    }
    this._date = date;
  }
}

module.exports = { Message };
