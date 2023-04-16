const moveNullValuesToEndOfArray = (unsortedArray: any[])=>{
    let nullArray: null[] = []
    let nonNullArray: number[] = []
    unsortedArray.forEach((value: any)=>{
        if(value === null) nullArray.push(value)
        else nonNullArray.push(value)
    })
    // console.log("Length of Null Array: ", nullArray.length)
    let numberOfPointsToRender = nonNullArray.length/3;
    return {numberOfPointsToRender, array: nonNullArray.concat(nullArray)}
}

export default moveNullValuesToEndOfArray