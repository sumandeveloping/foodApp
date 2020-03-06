export default class Likes {
  constructor() {
    this.likes = [];
  }

  addLike(id, title, author, img) {
    const like = { id, title, author, img };
    this.likes.push(like);

    //Persist data in local storage
    this.persistData();
    return like;
  }

  deleteLike(id) {
    const index = this.likes.findIndex(el => el.id === id);
    this.likes.splice(index, 1);

    //Persist data in local storage
    this.persistData();
  }

  isLiked(id) {
    return this.likes.findIndex(el => el.id === id) !== -1;
  }

  getNumLikes() {
    return this.likes.length;
  }

  persistData() {
    localStorage.setItem("likes", JSON.stringify(this.likes)); //in localstorage value of 'key' should be always a string..dats y we used JSON.stringify to convert an array to an string
  }

  readStorage() {
    const storage = JSON.parse(localStorage.getItem("likes"));
    if (storage) {
      //restore likes array from localstorage
      this.likes = storage;
    }
  }
}
