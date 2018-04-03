
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