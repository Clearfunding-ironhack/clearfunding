

  const goalAchieved = (campaign) => {
    campaign.isAchieved = true;
  }
  
  const campaignFinished = (campaign) => {
      // if target is met
    if (campaign.isAchieved === true) {
        //1) transfer funds to the creator's account (do we have the account in the user model? Nope, we should add it)

        //2) update user's amount disbursed and committed amount in relation to the SPECIFIC campaign
             //amount disbursed (total for each campaign?) += committedAmount (campaign)
             //committedAmount(total) -= committedAmount(campaign)

        //3) notify creator, backers and followers (this notification should be a function since we will use it both in the if and else clauses)

    // if target is NOT met
    } else {
        // 1) refund users
        // 2) update user's amount disbursed and committed amount 
            // committedAmount (total) -= committedAmount (campaign);
        // 3) notify creator, backers and followers
    }
  }

  campaignAlmostFinished = (campaign) => {
      //for notifying stakeholders that the goal is 80% met
      if (this.campaign.amountRaised == this.campaign.goal * 0.8) {
       // notify creator, backers and followers that the goal is 80% met
      }
  }
