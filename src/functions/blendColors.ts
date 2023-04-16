import hexToRgb from "./hexToRgb";
import rgbToHex from "./rgbToHex";

//Credit: https://coderwall.com/p/z8uxzw/javascript-color-blender
function int_to_hex(num: number)
{
    var hex = Math.round(num).toString(16);
    if (hex.length == 1)
        hex = '0' + hex;
    return hex;
}

//credit: https://coderwall.com/p/z8uxzw/javascript-color-blender
function blendColors(color1: string, color2: string, percentage: number){
    // check input
    color1 = color1 || '0x000000';
    color2 = color2 || '0xffffff';
    percentage = percentage || 0.5;

    // 1: validate input, make sure we have provided a valid hex
    // if (color1.length != 5 && color1.length != 8)
    //     throw new Error('colors must be provided as hexes');

    // if (color2.length != 5 && color2.length != 8)
    //     throw new Error('colors must be provided as hexes');    

    // if (percentage > 1 || percentage < 0)
    //     throw new Error('percentage must be between 0 and 1');

    // output to canvas for proof
    // var cvs = document.createElement('canvas');
    // var ctx = cvs.getContext('2d');
    // cvs.width = 90;
    // cvs.height = 25;
    // document.body.appendChild(cvs);

    // // color1 on the left
    // ctx.fillStyle = color1;
    // ctx.fillRect(0, 0, 30, 25);

    // // color2 on the right
    // ctx.fillStyle = color2;
    // ctx.fillRect(60, 0, 30, 25);

    // 2: check to see if we need to convert 3 char hex to 6 char hex, else slice off hash
    //      the three character hex is just a representation of the 6 hex where each character is repeated
    //      ie: #060 => #006600 (green)
    // if (color1.length == 5)
    //     color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3];
    // else
        // color1 = color1.substring(1);
        color1 = color1.substring(2);
    // if (color2.length == 5)
    //     color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3];
    // else
        // color2 = color2.substring(1);      
        color2 = color2.substring(2);   

    // console.log('valid: c1 => ' + color1 + ', c2 => ' + color2);

    // 3: we have valid input, convert colors to rgb
    let color1Arr = [parseInt(color1[0] + color1[1], 16), parseInt(color1[2] + color1[3], 16), parseInt(color1[4] + color1[5], 16)];
    let color2Arr = [parseInt(color2[0] + color2[1], 16), parseInt(color2[2] + color2[3], 16), parseInt(color2[4] + color2[5], 16)];

    // console.log('hex -> rgba: c1 => [' + color1Arr.join(', ') + '], c2 => [' + color2Arr.join(', ') + ']');

    // 4: blend
    var color3 = [ 
        (1 - percentage) * color1Arr[0] + percentage * color2Arr[0], 
        (1 - percentage) * color1Arr[1] + percentage * color2Arr[1], 
        (1 - percentage) * color1Arr[2] + percentage * color2Arr[2]
    ];

    // console.log('c3 => [' + color3.join(', ') + ']');

    // 5: convert to hex
    let hexValue = '0x' + int_to_hex(color3[0]) + int_to_hex(color3[1]) + int_to_hex(color3[2]);

    // console.log(hexValue);

    // color3 in the middle
    // ctx.fillStyle = color3;
    // ctx.fillRect(30, 0, 30, 25);

    // return hex
    return hexValue;
}

//credit: https://stackoverflow.com/questions/16360533/calculate-color-hex-having-2-colors-and-percent-position
function blendColors2(color1:string, color2: string, percentage: number){
    color1 = color1.substring(2)
    color2 = color2.substring(2)
    var hex = function(x: any) {
        x = x.toString(16);
        return (x.length == 1) ? '0' + x : x;
    };

    var r = Math.ceil(parseInt(color1.substring(0,2), 16) * percentage + parseInt(color2.substring(0,2), 16) * (1-percentage));
    var g = Math.ceil(parseInt(color1.substring(2,4), 16) * percentage + parseInt(color2.substring(2,4), 16) * (1-percentage));
    var b = Math.ceil(parseInt(color1.substring(4,6), 16) * percentage + parseInt(color2.substring(4,6), 16) * (1-percentage));

    return `0x${hex(r)}${hex(g)}${hex(b)}`;
}


//credit: https://stackoverflow.com/questions/66649335/get-exact-color-from-two-colors-with-percentage-in-javascript
function blendColors3(color1:string, color2: string, percentage: number) {
    color1 = color1.substring(2)
    color2 = color2.substring(2)
    const from = rgb(color1)
    const to = rgb(color2)
  
    const r = Math.ceil(from.r * percentage + to.r * (1 - percentage));
    const g = Math.ceil(from.g * percentage + to.g * (1 - percentage));
    const b = Math.ceil(from.b * percentage + to.b * (1 - percentage));

    const red = hex(r);
    const green = hex(g);
    const blue = hex(b);

    // console.log("Red: ", red)
    // console.log("Blue: ", green)
    // console.log("Green: ", blue)
    
    
    return rgbToHex(r,g,b);
    return "0x" + red + green + blue;
}
  
function rgb(color: string) {
    const hex = color.replace("0x", "")
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
    }
}

/** eg. hex(123) => "7b" */
function hex(num: any) {
    num = num.toString(16);
    return (num.length == 1) ? '0' + num : num;
}
//credit: https://stackoverflow.com/questions/50286566/generate-color-list-between-two-colors-in-hsv
function blendColors4(color1:string, color2: string, percentage: number){
    // 2: check to see if we need to convert 3 char hex to 6 char hex, else slice off hash
    // the three character hex is just a representation of the 6 hex where each character is repeated
    //      ie: #060 => #006600 (green)
    // if (color1.length == 5)
    //     color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3];
    // else
    //     color1 = color1.substring(1);
    //     color1 = color1.substring(2);
    // if (color2.length == 5)
    //     color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3];
    // else
    //     color2 = color2.substring(1);      
    //     color2 = color2.substring(2);   

    const steps = 100;
    percentage = percentage * 100;
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    console.log("rgb1: ", rgb1);
    console.log("rgb2: ", rgb2);

    let {r: r1, g: g1, b: b1} = rgb1;
    let {r: r2, g: g2, b: b2} = rgb2;
    const rDelta = (r2-r1)/steps;
    const gDelta = (g2-g1)/steps;
    const bDelta = (b2-b1)/steps;

    // let colorGradient: number[][] = [];

    //Only calculating up to needed percentage
    for (let i=0; i<=percentage; i+=1){
        r1 += rDelta
        g1 += gDelta
        b1 += bDelta
        // output.append((r1, g1, b1))
        // colorGradient.push([r1,g1,b1])
    }

    // console.log("Percentage: ", percentage);
    // console.log("Color Gradient: ", colorGradient);
    let hexValue = '';
    [r1,g1,b1].forEach((rgbVal: number)=>{
        // console.log("RGB Value: ", rgbVal);
        hexValue.concat(hex(rgbVal))
    });
    // console.log("Hex Value: ", hexValue);
    return `0x${hexValue}`
}

export default blendColors3;