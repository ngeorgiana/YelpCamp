var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware")

///INDEX -SHOW ALLL CAMPGROUNDS

router.get("/", function(req,res){
    
    //all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err) {
            console.log(err);
        } else {
            res.render("campgrounds/index",{campgrounds:allCampgrounds});
        }
    });
    // res.render("campgrounds", {campgrounds: campgrounds});
});

///CREATE ROUTE -ADD NEW CAMPGROUNDS TO DB

router.post("/", middleware.isLoggedIn, function(req,res){
    //get data from form add data to array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc =req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name:name, price:price, image:image, description:desc, author: author};
    
    //create a new campground and save it to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else{
            //redirect back to compograounds page
            console.log("newly created");
            res.redirect("/campgrounds");
        }
    });
});

////NEW -show from db new campgrounds

router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

///SHOW -shows more info about campground

router.get("/:id", function(req, res ){
    //find the campground with the provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if (err ||!foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else{
            console.log(foundCampground);
            //render show template wh that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground) {
        res.render("campgrounds/edit", {campground: foundCampground});
        });
    });
    
//UPDATE CAMP ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //find and update
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    //redirect showpage
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
    if(err){
        req.flash("error", "Campground removed");
        res.redirect("/campgrounds");
    } else {
        res.redirect("/campgrounds");
    }        
    });
});


module.exports = router; 