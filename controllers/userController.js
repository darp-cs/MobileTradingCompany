const model = require('../models/user');
const mobile = require('../models/item');
const followList = require('../models/follow');
const trades = require('../models/trade');

//To display new user form
exports.new = (req, res)=>{
    res.render('./user/new');
};

//Create new user
exports.create = (req, res, next)=>{
    let user = new model(req.body);
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

    model.findOne({ email: email })
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
    Promise.all([model.findById(userid), mobile.find({owner: userid}),
        followList.find({uid: userid}).populate('mobiles'),trades.find({traderid:userid}).populate('tradeid')]) 
    .then(results=>{
        const [user, mobiles,wmobiles,omobiles] = results;
        const flag = false;
        res.render('./user/profile', {user, mobiles,wmobiles,omobiles});
})
.catch(err=>next(err));
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