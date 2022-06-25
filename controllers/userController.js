const model = require('../models/user');
const mobile = require('../models/item');
const watchList = require('../models/interest');
const trades = require('../models/trade');
exports.new = (req, res)=>{
    res.render('./user/new');
};

exports.create = (req, res, next)=>{
    let user = new model(req.body);
    user.save()
    .then(user=> {
        req.flash('success', 'You have successfully registered');
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

exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;

    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Wrong email address');  
            res.redirect('/users/login');
        } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.session.firstName = user.firstName;
                    req.session.lastName = user.lastName;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
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

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    let flag = false;
    let a =[]
    let b =[]
    Promise.all([model.findById(id), mobile.find({owner: id}),
        watchList.find({uname: id}).populate('mnames'),trades.find({traderid:id}).populate('tradeid')]) 
    .then(results=>{
        const [user, mobiles,wmobiles,omobiles] = results;
        const flag = false;
        mobiles.forEach(mobile =>{
            //console.log(mobile.name);
            a.push(mobile.id);
        })
        omobiles.forEach(mobile =>{
            b.push(mobile.offerid);
        })
        for (const a1 of a){
            for (const b1 of b){
                if( a1 ===b1)
                {
                    console.log("yy")
                    flag = true;
                }
            }
        }
       //console.log(b    )
        res.render('./user/profile', {user, mobiles,wmobiles,omobiles});
})
.catch(err=>next(err));
};


exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
 };