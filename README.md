
const getRemainingTime = deadline => {
    let now = new Date(),
        remainingTime = (new Date(deadline) - now + 1000) / 1000, // lo pasamos a segundos. El +1000 es porque tiene una demora de 1 segundo en empezar y para que no vaya 1 seg atrasado.
        remainingSeconds = ('0' + Math.floor(remainingTime % 60)).slice(-2),
        remainingMinutes = ('0' + Math.floor(remainingTime / 60 % 60)).slice(-2),
        remainingHours = ('0' + Math.floor(remainingTime / 3600 % 24)).slice(-2),
        remainingDays = Math.floor(remainingTime/ (3600 * 24));
        
        return {
          remainingTime,
          remainingSeconds,
          remainingMinutes,
          remainingHours, 
          remainingDays
        }
  }

  
  const countdown = (deadline, finalMessage) => {
    const timerUpdate = setInterval(() => {
      let time = getRemainingTime(deadline);
      console.log(`${time.remainingDays} days, ${time.remainingHours}hours, ${time.remainingMinutes} minutes and ${time.remainingSeconds} seconds left for the end of the campaign`);
      
      if(time.remainingTime <= 1) {
        clearInterval(timerUpdate);
        console.log(finalMessage);
      }
      
    }, 1000)
    
  };


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
