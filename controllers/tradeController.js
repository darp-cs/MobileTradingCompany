const Mobiledevice = require('../models/item');
const User = require('../models/user');
const followList = require('../models/interest');
const trademobile = require('../models/trade');
const { DateTime } = require("luxon");

//Home Page
exports.homepage = (req, res, next) => {
    let company = [];
    Mobiledevice.distinct("company", function(error, result){
        company = result;
    });
    Mobiledevice.find()
    .then(mobiles => res.render('./tradem/index', {mobiles, company}))
    .catch(err=>next(err));
};

//New Mobile Display page
exports.newMobile = (req, res) => {
    res.render('./tradem/newTrade');
};

//Create New Mobile Entry
exports.createNewEntry = (req, res, next) => {
    let mobileItem = new Mobiledevice(req.body);
    mobileItem.owner = req.session.user;
    mobileItem.status = "available";
    mobileItem.createAt = new Date(DateTime.now().toFormat('LLLL dd, yyyy'));;
    mobileItem.save()
    .then(mobile=> {
        res.redirect('/trade');
    })
    .catch(err=>{
        if(err.name === 'ValidationError'){
            req.flash('error', err.message);
            res.redirect('back');
        }else{
            next(err);
        }
    });
};

//Show Page
exports.showMobileDetail = (req, res, next) => {
    let mobileId = req.params.id; 
    Mobiledevice.findById(mobileId).populate('owner', 'firstName lastName')
    .then(mobiledetails=>{
        if(mobiledetails) {
            let followFlag = false;
            let userId = req.session.user;
            followList.findOne({uname: userId, mnames: mobileId})
            .then(fFlag => {
                if(fFlag)
                {
                    followFlag = true;
                    return res.render('./tradem/show', {mobiledetails, fFlag});
                }
                else{
                    return res.render('./tradem/show', {mobiledetails, fFlag});
                }
            })
            .catch(err =>next(err));    
            
        } else {
            let err = new Error('Cannot find a mobile with id ' + mobileId);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};


//Edit Page
exports.editMobile = (req, res, next) => {
    let Mobileid = req.params.id;
    Mobiledevice.findById(Mobileid)
    .then(mobileEntry=>{
        if(mobileEntry) {
            return res.render('./tradem/edit', {mobileEntry});
        } else {
            let err = new Error('Cannot find a mobile with id ' + Mobileid);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

//Update the Entry
exports.updateMobile = (req, res, next) => {
    let mobiledetail = req.body;
    let Mobileid = req.params.id;
    Mobiledevice.findByIdAndUpdate(Mobileid, mobiledetail, {useFindAndModify: false, runValidators: true})
    .then(mobileitem=>{
        if(mobileitem) {
            res.redirect('/trade/'+Mobileid);
        } else {
            let err = new Error('Cannot find a mobile with id ' + Mobileid);
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


//Delete an entry
exports.deleteMobile = (req, res, next) => {
    let mobileID = req.params.id;
    trademobile.findOne({offerid:mobileID})
    .then(result=>{
        if(result){
        Mobiledevice.findOneAndUpdate({_id:result.tradeid},{status:'available'})
        .then().catch(err=> next(err));
        }
    })
    .catch(err =>next(err));

    trademobile.findOne({tradeid:mobileID})
    .then(result=>{
        if(result){
        Mobiledevice.findOneAndUpdate({_id:result.offerid},{status:'available'})
        .then().catch(err=> next(err));
        }
    })
    .catch(err =>next(err));

    trademobile.findOneAndDelete({offerid:mobileID})
    .then(result=>{
        if(result){}
        else{
        trademobile.findOneAndDelete({tradeid:mobileID})
        .then(mobile=>{
            if(mobile) {}
        })
            .catch(err=>next(err))
        }

    })
.catch(err=>next(err));

Mobiledevice.findByIdAndDelete(mobileID, {useFindAndModify: false})
    .then(mobile =>{
        if(mobile) {
        res.redirect('/trade');
        } else {
        let err = new Error('Cannot find a mobile with id ' + mobileID);
        err.status = 404;
        return next(err);
        }
    })
    .catch(err=>next(err));
};

//Follow the mobile 
exports.follow = (req, res, next) => {
    let mid = req.params.id;
    let uid = req.session.user;
    followList.findOne({uname:uid})
    .then(user => {
        if(user){
            followList.updateOne({uname: uid},
                {$push: {mnames:[mid]}}, 
                function(err){
                    if(err){
                        return next(err);
                    }
                });    
                console.log("Updated")            
        }
        else{
            let addwlist = new followList({uname: uid, mnames: [mid]});
            addwlist.save();
        }
    })
    .catch(err=>next(err));
    res.redirect('/users/profile');    
};

//unfollow the page
exports.unfollow = (req, res, next) => {
    let mid = req.params.id;
    let uid = req.session.user;
    followList.findOne({uname:uid})
    .then(user => {
        if(user){
            followList.updateOne({uname: uid},
                {$pullAll: {mnames:[mid]}}, 
                function(err){
                    if(err){
                        return next(err);
                    }
                    else{
                        followList.findOne({uname:uid})
                        .then(result=>{
                            if(result){
                                if(result.mnames.length === 0){
                                followList.findOneAndDelete({uname:uid})
                                .then(result =>{
                                    console.log("Watchlist deleted")
                                })
                                .catch(err=> next(err)); 
                            }
                            }
                        })
                        .catch(err=>next(err))
                    }
                });   
        }
    })
    .catch(err=>next(err));
   
    res.redirect('/users/profile');  
};

//To start trade
exports.startTrade = (req, res, next) => {
let mobileid = req.params.id;
let userid = req.session.user;
Promise.all([User.findById(userid), Mobiledevice.find({owner: userid})])
.then(mobiledetails => {
    const [user, mobiles] = mobiledetails;
    res.render('./tradem/trabemobile', {user, mobiles,mobileid })
})
.catch(err=> next(err));
}

//Offer Trade function
exports.tradeoffered =(req, res, next) => {
    let offermobileid = req.params.id;
    let trademobileid = req.body;
    let userid = req.session.user;
    let trademobileid1 = trademobileid.item
    trademobile.findOne({tradeid:offermobileid}, {offerid: trademobileid1})
    .then(ans=>{
    if(!ans)
    {
        let newtrade = new trademobile();
        newtrade.traderid = userid;
        newtrade.tradeid = offermobileid;
        newtrade.offerid = trademobileid1
        Mobiledevice.findOneAndUpdate({_id:offermobileid}, {status: "offer pending"})
        .then().catch(err=> next(err));
        Mobiledevice.findOneAndUpdate({_id:trademobileid1}, {status: "offer pending"})
        .then().catch(err=> next(err));
        newtrade.save();
        res.redirect('/users/profile');
    }
    else{
        res.redirect('/trade');
    }
})
    .catch(err=> next(err));
}

//To cancel the offer
exports.offercancel = (req, res, next) => {
    let mobileid = req.params.id;
    trademobile.findOneAndDelete({tradeid:mobileid})
    .then(result=>{
        const offermobileid = result.offerid
        const trademobileid = result.tradeid
        Mobiledevice.findOneAndUpdate({_id:offermobileid}, {status: "available"})
        .then().catch(err=> next(err));
        Mobiledevice.findOneAndUpdate({_id:trademobileid}, {status: "available"})
        .then().catch(err=> next(err));
        res.redirect('/users/profile');
    })
}

//To manage offers
exports.manageOffer= (req, res, next) => {
    let trademobileid= req.params.id;
    let flag = true
    trademobile.findOne({offerid:tid}).populate('tradeid').populate('offerid')
     .then(resultmobile =>{
         if(resultmobile){
         res.render('./tradem/manageOffer',{flag,resultmobile})
         }
         else{
             flag = false;
             trademobile.findOne({tradeid:trademobileid}).populate('tradeid').populate('offerid')
             .then(resultmobile=>{
                res.render('./tradem/manageOffer',{flag,resultmobile})
             })
             .catch(err=> next(err));
         }
     })
     .catch(err =>next(err));
}


//to accept the offer
exports.acceptOffer = (req, res, next) => {
    let trademobileid = req.params.id;
    Mobiledevice.findByIdAndUpdate(trademobileid,{status: "traded"},{useFindAndModify: false, runValidators: true})
    .then().catch(err=> next(err));
    trademobile.findOne({tradeid:trademobileid}).populate('offerid')
    .then(result=>{
        offermobileid = result.offerid.id;
        Mobiledevice.findByIdAndUpdate(offermobileid,{status: "traded"},{useFindAndModify: false, runValidators: true})
    .then().catch(err=> next(err));
    trademobile.findOneAndDelete({tradeid:trademobileid})
    .then(result=>{
        if(result){
            res.redirect("/users/profile")
        }
    })
    .catch(err=> next(err));    
})
    .catch(err=> next(err));    
}

//to reject the offer
exports.rejectOffer = (req, res, next) => {
    let trademobileid = req.params.id;
    Mobiledevice.findByIdAndUpdate(trademobileid,{status: "available"},{useFindAndModify: false, runValidators: true})
    .then()
    .catch(err=> next(err));    
    trademobile.findOne({tradeid:trademobileid}).populate('offerid')
    .then(result=>{
        offermobileid = result.offerid.id
        Mobiledevice.findByIdAndUpdate(offermobileid,{status: "available"},{useFindAndModify: false, runValidators: true})
    .then().catch(err=> next(err));
    trademobile.findOneAndDelete({tradeid:trademobileid})
    .then(result=>{
        res.redirect("/users/profile")
    })
    .catch(err => next(err));
    })
    .catch(err=> next(err));
}
