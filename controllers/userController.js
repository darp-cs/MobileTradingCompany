const User = require('../models/user');
const mobile = require('../models/item');
const followList = require('../models/follow');
const trades = require('../models/trade');


//To display new user form
exports.new = (req, res)=>{
    res.render('./user/new');
};

//Create new user
exports.create = (req, res, next)=>{
    let user = new User(req.body);
    user.save()
    .then(user=> {
        res.redirect('/users/login');
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/new');
        }
        
        next(err);
    }); 
};

//to display login page
exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
}

//login function
exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Email address is wrong');  
            res.redirect('/users/login');
        } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.session.name = user.name;
                    res.redirect('/');
                } else {
                    req.flash('error', 'Wrong password');      
                    res.redirect('/users/login');
                }
            })
            .catch(err => next(err));;     
        }     
    })
    .catch(err => next(err));
};

//Profile
exports.profile = (req, res, next)=>{
    let userid = req.session.user;
    let flag = false;
    Promise.all([User.findById(userid), mobile.find({owner: userid}),
        followList.find({uid: userid}).populate('mobiles'),trades.find({traderid:userid}).populate('tradeid')]) 
    .then(results=>{
        const [user, mobiles,wmobiles,omobiles] = results;
        const flag = false;
        res.render('./user/profile', {user, mobiles,wmobiles,omobiles});
})
.catch(err=>next(err));
};


exports.editProfile = (req, res, next) => {
    let userId = req.params.id;
    User.findById(userId)
    .then(userProfile=>{
        if(userProfile) {
            return res.render('./user/edit', {userProfile});
        } else {
            let err = new Error('Cannot find a mobile with id ' + userId);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};


exports.updateProfile = (req, res, next)=>{
    let userProfile = req.body;
    let userId = req.params.id;
    console.log(userId)
    User.findByIdAndUpdate(userId, userProfile, {useFindAndModify: false, runValidators: true})
    .then(profile=>{
        if(profile) {
            res.redirect('/users/profile');
        } else {
            let err = new Error('Error ');
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError'){
            req.flash('error', err.message);
            res.redirect('back');
        }else{
            next(err);
        }
    });

};

// logout function
exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
 };