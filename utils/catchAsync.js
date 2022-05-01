module.exports = func =>{
    return (req, res, next) =>{
        func(req, res, next).catch(next)
    }
}

//A protection layer for async functions.
// It basically just runs the function and if there are errors, it throws it.
// Otherwise the function runs as normal
