const express = require('express');
const multer = require('multer');

const Post = require('../models/post');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

// configure disk storage for multer
const storage = multer.diskStorage({
  // cb is the callback with error = null and the storage path (that is relative to the server.js file)
  destination: (req, file, cb) => {
    // check & validate file type
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid MIME type');
    // if isValid != null or undefined
    if (isValid) {
      error = null;
    }
    cb(error, "images");
  },
  filename: (req, file, cb) => {
    // split by spaces then rejoin with -
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype]; // to pick the right extension from the map object
    cb(null, name + '-' + Date.now() + '.' + ext); // to create the file name in the callback result
  }
});

// route for POST requests for /api/posts
router.post('', multer({storage: storage}).single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host'); // create the file url up until the host
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename
  }); // from bodyParser.json -- file.filename comes from multer
  post.save()
    // pick the ID of the saved document from the db and return it in the json
    .then(createdPost => {
      res.status(201).json({
        message: 'Post added successfully',
        post: {
          ...createdPost,
          id: createdPost._id
        } // nextgen javascript feature: copy createdPost to post, then add id again wo underscore
      });
    });
});

// route for UPDATE requests
router.put("/:id", multer({storage: storage}).single('image'), (req, res, next) => {

  // check if new image file added or we receive image file path only
  let imagePath = req.body.imagePath; // use the file path received from the frontend (old path)
  if (req.file) {
    const url = req.protocol + '://' + req.get('host'); // create the file url up until the host
    imagePath = url + '/images/' + req.file.filename // file.filename comes from multer
  }

  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });
  Post.updateOne({_id: req.params.id}, post).then(result => {
    console.log(result);
    res.status(200).json({ message: "Update successful! "});
  })
});

// route for GET requests for /api/posts
router.get('', (req, res, next) => {

  // capture query parameters
  const pageSize = +req.query.pagesize; // + turns string to number
  const currentPage = +req.query.page; // + turns string to number
  const postQuery = Post.find(); // pass parameters to this const

  // if parameters exist: query a slice for the given page
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1)) // skip first posts
      .limit(pageSize); // only retrieve n posts
  }

  postQuery.then(documents => {
    fetchedPosts = documents; // to store the posts
    return Post.count(); // to count the total posts
  })
  .then(count => {
    res.status(200).json({
      message: 'Posts fetched successfully!',
      posts: fetchedPosts,
      maxPosts: count
    });
  });
});

// route for GET a single ID under /api/posts
router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(400).json({message: 'Post not found!'});
    }
  });
});

// route for DELETE requests for /api/posts/:id
router.delete('/:id', (req, res, next) => {
  Post.deleteOne({ _id: req.params.id })
    .then(result => {
      console.log(result);
      res.status(200).json({ message: "Post deleted!" });
    });
});

module.exports = router;
