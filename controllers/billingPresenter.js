module.exports = function(billingData) {
    const _billingData = billingData;
    
    module.showBillingIndex = function(req, res, next) {
        var bills = _billingData.getBills();
        var billCandidatePools = _billingData.getBillCandidatePools();
        
        //for(var bills in bills) {
        //    bills[bills].setRequiresActionOfUser(req.session.username);
        //}
        
        res.render('billing/billingIndex', {
            title: 'Billing Index',
            billingData: bills,
            billCandidatePools: billCandidatePools,
            usernames: accountData.getUsernames()
        });
    }
    
    module.showBill = function(req, res, next) {
        if (req.params.id != null) {
            var bill = _billingData.getBill(req.params.id - 1, req.session.username);
        
            if (bill !== undefined) {
                res.render('billing/bill', {
                    title: bill.name,
                    sumData: bill.calcSums(),
                    dateString: utils.getCurrentDateString(),
                    pool: bill
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
        
        _settlementData.addNewBill(
            req.body.name,
            req.body.pools
        );

        res.writeHead(301, {Location: '/billing'});
        res.end();
    }
    
    function toggleBillUserState(username, status, id, res) {
        settlement = _settlementData.getSettlement(id);
        if (settlement === undefined) {
            res.status(404);
            res.send("Settlement not found.");
            return;
        }
        if (!settlement.toggleStateForUser(username, status)) {
            res.status(403);
            res.send("invalid username or state.");
            return;
        }
        
        res.writeHead(301, {Location: '/billing/' + id});
        res.end();
    }
    
    return module;
};