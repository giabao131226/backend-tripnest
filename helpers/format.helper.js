
module.exports.formatVNDMoney = (money) => {
    const array = [];
    money = parseInt(money);
    cnt = 0;
    while(money != 0){
        x = money % 10;
        array.push(x);
        cnt++;
        if(cnt%3==0){
            array.push(",");
        }
        money = parseInt(money/10);        
    }
    array.reverse();
    return array.join("");
}