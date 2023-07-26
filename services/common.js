const passport = require('passport');
exports.isAuth = (req,res,done)=>{
    return passport.authenticate('jwt')
}

exports.sanitizeUser = (user)=>{
    return {id:user.id, role:user.role}
}

exports.cookieExtractor = function(req){
    let token = null;
    if(req && req.cookies){
        token = req.cookies['jwt'];
    }
    //To DO
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YzEyMjI3M2Y4MmI1MDNiY2M3ODJjNiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5MDQwMDA0NX0.oaIz_X5tnQF-qtHLQHRkg1S0GNp-SXPTm8ZE2T7HmpQ'
    return token;
}