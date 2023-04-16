const createOpacityArray = (allAxonPoints: number)=>{
    let opacityArray = [];
    let i;
    for(i = 0; i<allAxonPoints; i++){
        //@ts-ignore
        var opacity = .4
        opacityArray.push(opacity, opacity);
    }
    return opacityArray
}

export default createOpacityArray;