function passwordValidator(password){
    let numbers = ['1','2','3','4','5','6','7','8','9','0']
    let characters = ['!', '@', '#', '%', '&', '*', ';']

    let containNumber = false
    let containCharacter = false

// abc123
// ab123#

    for(let i=0; i < password.length; i++){
        if(numbers.includes(password[i])){
            containNumber = true
        }
        if(characters.includes(password[i])){
            containCharacter = true
        }
    }
    
    if(containNumber && containCharacter) return true
    return false
}

module.exports = passwordValidator