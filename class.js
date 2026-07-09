class Column {
  constructor(name, color) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.color = color;
  }
  editColumn(name, color) {
    this.name = name;
    this.color = color;
  }
}

class Card {
  constructor(title, description, columnId) {
    this.title = title;
    this.description = description;
    this.id = crypto.randomUUID();
    this.columnId = columnId;
    this.createdAt = Date.now();
  }
  getAgeInDays() {
    return Math.floor((Date.now() - this.createdAt) / 86400000);
  }
  editCard(title, description) {
    this.title = title;
    this.description = description;
  }
  moveTo(columnId) {
    this.columnId = columnId;
  }
}
