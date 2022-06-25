const Mobile = require('../models/item');
const model = require('../models/user');
const watchList = require('../models/interest');
const tradem = require('../models/trade');
const { DateTime } = require("luxon");

exports.index = (req, res, next) => {
    let categories = [];
    Mobile.distinct("company", function(error, results){
        categories = results;
    });
    Mobile.find()
    .then(mobiles => res.render('./story/index', {mobiles, categories}))
    .catch(err=>next(err));
};

exports.new = (req, res) => {
    res.render('./story/newTrade');
};

exports.create = (req, res, next) => {
    let mobile = new Mobile(req.body);//create a new connection document
    mobile.owner = req.session.user;
    mobile.status = "available";
    mobile.createAt = new Date(DateTime.now().toFormat('LLLL dd, yyyy'));;
    mobile.save()//insert the document to the database
    .then(mobiles=> {
        req.flash('success', 'You have successfully created a new mobile detail');
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

exports.show = (req, res, next) => {
    let id = req.params.id;

    Mobile.findById(id).populate('owner', 'firstName lastName')
    .then(mobile=>{
        if(mobile) {
            let watch = false;
            let uid = req.session.user;
            watchList.findOne({uname: uid, mnames: id})
            .then(w => {
                if(w)
                {
                    watch = true;
                    return res.render('./story/show', {mobile, w});
                }
                else{
                    return res.render('./story/show', {mobile, w});
                }
            })
            .catch(err =>next(err));    
            
        } else {
            let err = new Error('Cannot find a mobile with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    Mobile.findById(id)
    .then(mobile=>{
        if(mobile) {
            return res.render('./story/edit', {mobile});
        } else {
            let err = new Error('Cannot find a mobile with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.update = (req, res, next) => {
    let mobile = req.body;
    let id = req.params.id;
    Mobile.findByIdAndUpdate(id, mobile, {useFindAndModify: false, runValidators: true})
    .then(mobile=>{
        if(mobile) {
            req.flash('success', 'Mobile has been successfully updated');
            res.redirect('/trade/'+id);
        } else {
            let err = new Error('Cannot find a mobile with id ' + id);
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

exports.delete = (req, res, next) => {
    let id = req.params.id;
    //console.log(id)
    tradem.findOne({offerid:id})
    .then(result=>{
        if(result){
        Mobile.findOneAndUpdate({_id:result.tradeid},{status:'available'})
        .then(r=>{})
        .catch(err=> next(err));
        console.log(result)
        }
    })
    .catch(err =>next(err));

    tradem.findOne({tradeid:id})
    .then(result=>{
        if(result){
        Mobile.findOneAndUpdate({_id:result.offerid},{status:'available'})
        .then(r=>{})
        .catch(err=> next(err));
        console.log(result)
        }
    })
    .catch(err =>next(err));


    tradem.findOneAndDelete({offerid:id})
    .then(result=>{
        if(result){
            console.log("Trade details deleted")
        }
        else{
            tradem.findOneAndDelete({tradeid:id})
            .then(mobile=>{
                if(mobile) {
                    console.log("Trade details deleted")
                }
        })
            .catch(err=>next(err))
        }

    })
.catch(err=>next(err));

    Mobile.findByIdAndDelete(id, {useFindAndModify: false})
    .then(mobile =>{
        if(mobile) {
            req.flash('success', 'Mobile has been successfully deleted');
            res.redirect('/trade');
        } else {
            let err = new Error('Cannot find a mobile with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
    //res.redirect('/');
};

exports.interested = (req, res, next) => {
    let mid = req.params.id;
    let uid = req.session.user;
    watchList.findOne({uname:uid})
    .then(user => {
        if(user){
            watchList.updateOne({uname: uid},
                {$push: {mnames:[mid]}}, 
                function(err){
                    if(err){
                        return next(err);
                    }
                });    
                console.log("Updated")            
        }
        else{
            let addwlist = new watchList({uname: uid, mnames: [mid]});
            addwlist.save();
        }
    })
    .catch(err=>next(err));
    res.redirect('/users/profile');    
};


exports.notinterested = (req, res, next) => {
    let mid = req.params.id;
    let uid = req.session.user;
    watchList.findOne({uname:uid})
    .then(user => {
        if(user){
            watchList.updateOne({uname: uid},
                {$pullAll: {mnames:[mid]}}, 
                function(err){
                    if(err){
                        return next(err);
                    }
                    else{
                        watchList.findOne({uname:uid})
                        .then(result=>{
                            if(result){
                                if(result.mnames.length === 0){
                                watchList.findOneAndDelete({uname:uid})
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

exports.tradeitem = (req, res, next) => {
let omid = req.params.id;
let uid = req.session.user;
Promise.all([model.findById(uid), Mobile.find({owner: uid})])
.then(results => {
    let a = true;
    const [user, mobiles] = results;
    res.render('./story/trabemobile', {user, mobiles,omid })
})
.catch(err=> next(err));
}


exports.tradeoffered =(req, res, next) => {
    let omid = req.params.id;
    let tmid = req.body;
    let uid = req.session.user;
    let tmid1 = tmid.item
    console.log(omid);
    tradem.findOne({tradeid:omid}, {offerid: tmid1})
    .then(a=>{
    if(!a)
    {
        let newtrade = new tradem();
        newtrade.traderid = uid;
        newtrade.tradeid = omid;
        newtrade.offerid = tmid1
        Mobile.findOneAndUpdate({_id:omid}, {status: "offer pending"})
        .then(r=>{
        })
        .catch(err=> next(err));
        Mobile.findOneAndUpdate({_id:tmid1}, {status: "offer pending"})
        .then(r=>{
        })
        .catch(err=> next(err));
        newtrade.save();
        req.flash('success', 'Trade has been succesfully offered');
        res.redirect('/users/profile');
    }
    else{
        console.log("Mobile already in trade");
        res.redirect('/trade');
    }
    
})
    .catch(err=> next(err));
}

exports.offercancel = (req, res, next) => {
    let mid = req.params.id;
    console.log(mid);

    tradem.findOneAndDelete({tradeid:mid})
    .then(r=>{
        //console.log(r)
        const oid = r.offerid
        const tid = r.tradeid
        Mobile.findOneAndUpdate({_id:oid}, {status: "available"})
        .then(r=>{
            //console.log(r)
        })
        .catch(err=> next(err));
        Mobile.findOneAndUpdate({_id:tid}, {status: "available"})
        .then(r=>{
            //console.log(r)
        })
        .catch(err=> next(err));
        //console.log("TD: "+r.traderid)
        req.flash('success', 'Offer has been successfully canceled');
        res.redirect('/users/profile');
    })
}

exports.manageOffer= (req, res, next) => {
    let tid= req.params.id;
    console.log(tid)
    let r = true
     tradem.findOne({offerid:tid}).populate('tradeid').populate('offerid')
     .then(result =>{
         if(result){
         //console.log(result)
         res.render('./story/manageOffer',{r,result})
         }
         else{
             r = false;
             //console.log(r)
             tradem.findOne({tradeid:tid}).populate('tradeid').populate('offerid')
             .then(result=>{
                res.render('./story/manageOffer',{r,result})
             })
             .catch(err=> next(err));
             
         }
     })
     .catch(err =>next(err));
}

exports.acceptOffer = (req, res, next) => {
    let tid = req.params.id;
    //console.log(tid);
    Mobile.findByIdAndUpdate(tid,{status: "traded"},{useFindAndModify: false, runValidators: true})
    .then(mobile =>{
        if(mobile) {
            req.flash('success', 'Mobile has been successfully updated');
            //res.redirect('/trade/'+id);
        } else {
            let err = new Error('Cannot find a mobile with id ' + tid);
            err.status = 404;
            next(err);
        }
})
    .catch(err=> next(err));


    tradem.findOne({tradeid:tid}).populate('offerid')
    .then(result=>{

        oid = result.offerid.id
        console.log(oid)
        Mobile.findByIdAndUpdate(oid,{status: "traded"},{useFindAndModify: false, runValidators: true})
    .then(mobile =>{
        if(mobile) {
            req.flash('success', 'Mobile has been successfully updated');
            //res.redirect('/trade/'+id);
        } else {
            let err = new Error('Cannot find a mobile with id ' + oid);
            err.status = 404;
            next(err);
        }
})
    .catch(err=> next(err));
    tradem.findOneAndDelete({tradeid:tid})
    .then(result=>{
        if(result){
            req.flash('success', 'Offer has been Accepted');
            res.redirect("/users/profile")
        }
    })
    .catch(err=> next(err));
    
})
    .catch(err=> next(err));
    
}

exports.rejectOffer = (req, res, next) => {
    let tid = req.params.id;
    console.log(tid);
    Mobile.findByIdAndUpdate(tid,{status: "available"},{useFindAndModify: false, runValidators: true})
    .then(mobile =>{
        if(mobile) {
            req.flash('success', 'Mobile has been successfully updated');
            //res.redirect('/trade/'+id);
        } else {
            let err = new Error('Cannot find a mobile with id ' + tid);
            err.status = 404;
            next(err);
        }
})
    .catch(err=> next(err));
    
    tradem.findOne({tradeid:tid}).populate('offerid')
    .then(result=>{
        oid = result.offerid.id
        Mobile.findByIdAndUpdate(oid,{status: "available"},{useFindAndModify: false, runValidators: true})
    .then(mobile =>{
        if(mobile) {
            req.flash('success', 'Mobile has been successfully updated');
        } else {
            let err = new Error('Cannot find a mobile with id ' + oid);
            err.status = 404;
            next(err);
        }
})
    .catch(err=> next(err));
    tradem.findOneAndDelete({tradeid:tid})
    .then(result=>{
        req.flash('success', 'Offer has been Rejected');
        res.redirect("/users/profile")
    })
    .catch(err => next(err));
    })
    .catch(err=> next(err));
    
}