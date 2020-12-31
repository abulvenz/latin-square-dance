for (let i = 0; i < 100; i++) {
    console.log(`.child${('0000' + i).substr(-4, 4)}{background-color:hsla(${Math.trunc(i * 3.6)},100%,50%,1)}`)
}

for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
        console.log(`.rchild${'00' + i + j}{background-color:rgba(${i * 25},${j * 25},${255 - 25 * j},1)}`)
    }
}