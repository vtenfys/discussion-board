class Message {
  constructor(message, date) {
    this._id = Message.nextId();
    this.message = message;
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
  get date() {
    return Date.parse(this._date);
  }

  set message(message) {
    if (typeof message !== 'string') {
      throw new TypeError('message must be a string');
    }
    this._message = message;
  }
  set date(date) {
    if (!(date instanceof Date)) {
      throw new TypeError('date must be a Date object');
    }
    this._date = date;
  }
}

module.exports = { Message };
