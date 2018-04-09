module.exports = function(billingData) {
    const _billingData = billingData;
    
    module.showBillingIndex = function(req, res, next) {
        var bills = _billingData.getBills();
        var billCandidatePools = _billingData.getBillCandidatePools();
        
        res.render('billing/billingIndex', {
            title: 'Billing Index',
            billingData: bills,
            billCandidatePools: billCandidatePools,
            usernames: accountData.getUsernames(),
            requiresActionOfUserMap: requiresActionOfUserMap(req.session.username, bills)
        });
    }
    
    module.showBill = function(req, res, next) {
        if (req.params.id != null) {
            var bill = _billingData.getBill(req.params.id, req.session.username);
        
            if (bill !== undefined) {
                res.render('billing/bill', {
                    title: bill.name,
                    sumData: bill.calcSums(),
                    dateString: utils.getCurrentDateString(),
                    bill: bill
                });
            } else {
                res.writeHead(301, {Location: '/billing'});
                res.end(); 
            }
        } 
    }
    
    module.toggleBillUserState = function(req, res, next) {
        toggleBillUserState(req.session.username, req.query.state, req.params.id, res);
    }
    
    module.addNewBill = function(req, res, next) {
        //TODO: Check if all pools and users exist.

        //In the case that no pools are selected.
        if (req.body.pools == null) {
            res.status(401);
            res.send("You have to select at least one pool");
            return;
        }

        //In the case that there is only one participant.
        if (typeof req.body.pools == 'string')
        req.body.pools = [req.body.pools];
        
        _billingData.addNewBill(
            req.body.name,
            req.body.pools
        );

        res.writeHead(301, {Location: '/billing'});
        res.end();
    }

        /* Checks for all pools if a user action is required */
        function requiresActionOfUserMap(username, bills) {
            var obj = {};
            for(var bill in bills) {
                obj[bill] = requiresActionOfUser(username, bills[bill].participants);
            }
            return obj;
        }
    
        /* Sets the state of the bill for the current user */
        function requiresActionOfUser(username, participants) {
            if (!(username in participants)) {
                return false;
            }
    
            var settle = false;
            //Does anyone want to change the status of the bill?
            for(var name in participants) {
                settle = settle || participants[name].settled;
            }
    
            //Has the user not checked the field?
            var requiresActionOfUser = settle  && !participants[username].settled;
    
            return requiresActionOfUser;
        }
    
    function toggleBillUserState(username, status, id, res) {
        bill = _billingData.getBill(id);
        if (bill === undefined) {
            res.status(404);
            res.send("bill not found.");
            return;
        }
        if (!bill.toggleStateForUser(username, status)) {
            res.status(403);
            res.send("invalid username or state.");
            return;
        }
        
        res.writeHead(301, {Location: '/billing/' + id});
        res.end();
    }
    
    return module;
};