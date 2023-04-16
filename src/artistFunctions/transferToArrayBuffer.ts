//Couresty of the BrainPower team!
const transferToArrayBuffer = (fromArr: any, toArr: any)=>{
    let i;
    for (i=0; i<toArr.length; i++) {
        toArr[i] = fromArr[i];
    }
}
export default transferToArrayBuffer