const returnTrueWithProbability = (probability: number)=>{
    let randomReal = Math.random() * 100
    if(randomReal < probability) return true
    else return false
  }
  
  export default returnTrueWithProbability